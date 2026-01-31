use crate::types::*;
use wasm_bindgen::prelude::*;

const GITHUB_REPO: &str = "skridlevsky/openchaos";
const GITHUB_API: &str = "https://api.github.com";
const GITHUB_GRAPHQL: &str = "https://api.github.com/graphql";

// Fetch open PRs with votes (GraphQL or REST based on token availability)
pub async fn fetch_open_prs_with_votes(token: Option<String>) -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    let (owner, repo) = GITHUB_REPO.split_once('/').ok_or("Invalid repo format")?;

    // Use GraphQL if token available, otherwise REST
    if let Some(ref token) = token {
        if !token.is_empty() {
            log(&format!("Fetching PRs via GraphQL"));
            return fetch_prs_graphql(owner, repo, token).await;
        }
    }

    log("Fetching PRs via REST (no token)");
    fetch_prs_rest(owner, repo).await
}

// GraphQL query to fetch PRs and reactions in 1-2 calls
async fn fetch_prs_graphql(owner: &str, repo: &str, token: &str) -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    let query = r#"
    query($owner: String!, $repo: String!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        pullRequests(first: 100, states: OPEN, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            number
            title
            url
            createdAt
            author {
              login
            }
            reactions(first: 100, content: [THUMBS_UP, THUMBS_DOWN]) {
              nodes {
                content
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
    "#;

    let client = reqwest::Client::new();
    let mut all_prs = Vec::new();
    let mut cursor: Option<String> = None;

    loop {
        let variables = if let Some(ref c) = cursor {
            serde_json::json!({
                "owner": owner,
                "repo": repo,
                "cursor": c
            })
        } else {
            serde_json::json!({
                "owner": owner,
                "repo": repo
            })
        };

        let response = client
            .post(GITHUB_GRAPHQL)
            .header("Authorization", format!("Bearer {}", token))
            .header("Content-Type", "application/json")
            .header("Accept", "application/vnd.github.v4+json")
            .header("User-Agent", "openchaos-wasm")
            .json(&serde_json::json!({
                "query": query,
                "variables": variables
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(format!("GraphQL request failed: {}", response.status()).into());
        }

        let data: serde_json::Value = response.json().await?;

        if let Some(errors) = data.get("errors") {
            return Err(format!("GraphQL errors: {:?}", errors).into());
        }

        let nodes = data["data"]["repository"]["pullRequests"]["nodes"]
            .as_array()
            .ok_or("Invalid GraphQL response")?;

        // Parse PRs from GraphQL response
        for node in nodes {
            let number = node["number"].as_u64().ok_or("Missing PR number")? as u32;
            let title = node["title"].as_str().ok_or("Missing title")?.to_string();
            let url = node["url"].as_str().ok_or("Missing url")?.to_string();
            let created_at = node["createdAt"].as_str().ok_or("Missing createdAt")?.to_string();
            let author = node["author"]["login"].as_str().unwrap_or("ghost").to_string();

            // Count reactions
            let empty_vec = vec![];
            let reactions = node["reactions"]["nodes"].as_array().unwrap_or(&empty_vec);
            let upvotes = reactions.iter()
                .filter(|r| r["content"].as_str() == Some("THUMBS_UP"))
                .count() as i32;
            let downvotes = reactions.iter()
                .filter(|r| r["content"].as_str() == Some("THUMBS_DOWN"))
                .count() as i32;

            all_prs.push(PullRequest {
                number,
                title,
                author,
                url,
                votes: upvotes - downvotes,
                created_at,
            });
        }

        // Check if there are more pages
        let page_info = &data["data"]["repository"]["pullRequests"]["pageInfo"];
        let has_next_page = page_info["hasNextPage"].as_bool().unwrap_or(false);

        if !has_next_page {
            break;
        }

        cursor = page_info["endCursor"].as_str().map(|s| s.to_string());
    }

    // Sort by votes DESC, then created_at DESC
    all_prs.sort_by(|a, b| {
        b.votes.cmp(&a.votes)
            .then_with(|| b.created_at.cmp(&a.created_at))
    });

    log(&format!("Fetched {} PRs via GraphQL", all_prs.len()));

    Ok(all_prs)
}

// REST API fallback - only fetch reactions for top 20 PRs
async fn fetch_prs_rest(owner: &str, repo: &str) -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();

    // Fetch PR list
    let url = format!("{}/repos/{}/{}/pulls?state=open&per_page=100&sort=created&direction=desc", GITHUB_API, owner, repo);

    let response = client
        .get(&url)
        .header("Accept", "application/vnd.github.v3+json")
        .header("User-Agent", "openchaos-wasm")
        .send()
        .await?;

    if !response.status().is_success() {
        return Err(format!("Failed to fetch PRs: {}", response.status()).into());
    }

    let prs: Vec<GitHubPR> = response.json().await?;
    let mut prs_with_votes = Vec::new();

    // Only fetch reactions for first 20 PRs to avoid rate limit
    let limit = 20.min(prs.len());

    for pr in prs.iter().take(limit) {
        let reactions_url = format!("{}/repos/{}/{}/issues/{}/reactions?per_page=100&page=1", GITHUB_API, owner, repo, pr.number);

        let reactions_response = client
            .get(&reactions_url)
            .header("Accept", "application/vnd.github.v3+json")
            .header("User-Agent", "openchaos-wasm")
            .send()
            .await?;

        let votes = if reactions_response.status().is_success() {
            let reactions: Vec<GitHubReaction> = reactions_response.json().await?;
            let upvotes = reactions.iter().filter(|r| r.content == "+1").count() as i32;
            let downvotes = reactions.iter().filter(|r| r.content == "-1").count() as i32;
            upvotes - downvotes
        } else {
            0
        };

        prs_with_votes.push(PullRequest {
            number: pr.number,
            title: pr.title.clone(),
            author: pr.user.login.clone(),
            url: pr.html_url.clone(),
            votes,
            created_at: pr.created_at.clone(),
        });
    }

    // Add remaining PRs with 0 votes
    for pr in prs.iter().skip(limit) {
        prs_with_votes.push(PullRequest {
            number: pr.number,
            title: pr.title.clone(),
            author: pr.user.login.clone(),
            url: pr.html_url.clone(),
            votes: 0,
            created_at: pr.created_at.clone(),
        });
    }

    // Sort by votes DESC, then created_at DESC
    prs_with_votes.sort_by(|a, b| {
        b.votes.cmp(&a.votes)
            .then_with(|| b.created_at.cmp(&a.created_at))
    });

    log(&format!("Fetched {} PRs via REST (reactions for top {})", prs_with_votes.len(), limit));

    Ok(prs_with_votes)
}

// Fetch merged PRs
pub async fn fetch_merged_prs(limit: u32, token: Option<String>) -> Result<Vec<MergedPullRequest>, Box<dyn std::error::Error>> {
    let (owner, repo) = GITHUB_REPO.split_once('/').ok_or("Invalid repo format")?;
    let client = reqwest::Client::new();

    let mut all_merged_prs = Vec::new();
    let mut page = 1;

    while all_merged_prs.len() < limit as usize {
        let url = format!(
            "{}/repos/{}/{}/pulls?state=closed&per_page=100&page={}&sort=updated&direction=desc",
            GITHUB_API, owner, repo, page
        );

        let mut request = client
            .get(&url)
            .header("Accept", "application/vnd.github.v3+json")
            .header("User-Agent", "openchaos-wasm");

        if let Some(ref token) = token {
            if !token.is_empty() {
                request = request.header("Authorization", format!("Bearer {}", token));
            }
        }

        let response = request.send().await?;

        if !response.status().is_success() {
            return Err(format!("Failed to fetch PRs: {}", response.status()).into());
        }

        let prs: Vec<GitHubPR> = response.json().await?;

        if prs.is_empty() {
            break;
        }

        // Filter to only merged PRs and exclude repo owner
        for pr in prs {
            if let Some(merged_at) = pr.merged_at {
                if pr.user.login != owner {
                    all_merged_prs.push(MergedPullRequest {
                        number: pr.number,
                        title: pr.title,
                        author: pr.user.login,
                        url: pr.html_url,
                        merged_at,
                    });
                }
            }
        }

        if all_merged_prs.len() >= limit as usize {
            break;
        }

        page += 1;
    }

    // Take only the requested limit
    all_merged_prs.truncate(limit as usize);

    log(&format!("Fetched {} merged PRs", all_merged_prs.len()));

    Ok(all_merged_prs)
}

// Simple logging for Node.js
fn log(msg: &str) {
    // In Node.js WASM, we can use console.log via wasm_bindgen
    #[wasm_bindgen]
    extern "C" {
        #[wasm_bindgen(js_namespace = console)]
        fn log(s: &str);
    }
    log(msg);
}
