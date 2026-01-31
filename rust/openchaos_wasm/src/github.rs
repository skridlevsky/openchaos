use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response, Storage};
use crate::types::*;
use crate::utils::{log, log_error};

const GITHUB_REPO: &str = "skridlevsky/openchaos";
const GITHUB_API: &str = "https://api.github.com";
const GITHUB_GRAPHQL: &str = "https://api.github.com/graphql";

// Get localStorage for caching
fn get_local_storage() -> Option<Storage> {
    web_sys::window()?.local_storage().ok()?
}

// REST API fallback (when no token) - only fetches reactions for top 20 PRs to save API calls
async fn fetch_open_prs_rest(owner: &str, repo: &str, token: Option<String>) -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    log("Using REST API - fetching reactions for top 20 PRs only to avoid rate limit");

    // Fetch PR list (1 API call)
    let url = format!(
        "{}/repos/{}/{}/pulls?state=open&per_page=100&sort=created&direction=desc",
        GITHUB_API, owner, repo
    );

    let prs: Vec<GitHubPR> = fetch_json(&url, token.as_deref()).await?;
    log(&format!("Found {} open PRs", prs.len()));

    let mut prs_with_votes = vec![];

    // Only fetch reactions for first 20 PRs to avoid rate limit (20 API calls max)
    let limit = 20.min(prs.len());

    for pr in prs.iter().take(limit) {
        let votes = fetch_pr_reactions_rest(owner, repo, pr.number, token.as_deref()).await?;
        prs_with_votes.push(PullRequest {
            number: pr.number,
            title: pr.title.clone(),
            author: pr.user.login.clone(),
            url: pr.html_url.clone(),
            votes,
            created_at: pr.created_at.clone(),
        });
    }

    // Add remaining PRs with 0 votes (no API calls)
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
        b.votes
            .cmp(&a.votes)
            .then_with(|| b.created_at.cmp(&a.created_at))
    });

    log(&format!("Sorted {} PRs (reactions fetched for top {})", prs_with_votes.len(), limit));

    Ok(prs_with_votes)
}

// Fetch reactions for a single PR (REST API)
async fn fetch_pr_reactions_rest(
    owner: &str,
    repo: &str,
    pr_number: u32,
    token: Option<&str>,
) -> Result<i32, Box<dyn std::error::Error>> {
    // Only fetch first page (100 reactions) to minimize API calls
    let url = format!(
        "{}/repos/{}/{}/issues/{}/reactions?per_page=100&page=1",
        GITHUB_API, owner, repo, pr_number
    );

    let reactions: Vec<GitHubReaction> = fetch_json(&url, token).await?;

    let upvotes = reactions.iter().filter(|r| r.content == "+1").count() as i32;
    let downvotes = reactions.iter().filter(|r| r.content == "-1").count() as i32;

    Ok(upvotes - downvotes)
}

// Get cached ETag for a URL
fn get_cached_etag(url: &str) -> Option<String> {
    let storage = get_local_storage()?;
    let key = format!("etag:{}", url);
    storage.get_item(&key).ok()?
}

// Store ETag for a URL
fn store_etag(url: &str, etag: &str) {
    if let Some(storage) = get_local_storage() {
        let key = format!("etag:{}", url);
        let _ = storage.set_item(&key, etag);
    }
}

// Get cached data for a URL
fn get_cached_data(url: &str) -> Option<String> {
    let storage = get_local_storage()?;
    let key = format!("cache:{}", url);
    storage.get_item(&key).ok()?
}

// Store cached data for a URL
fn store_cached_data(url: &str, data: &str) {
    if let Some(storage) = get_local_storage() {
        let key = format!("cache:{}", url);
        let _ = storage.set_item(&key, data);
    }
}

pub async fn fetch_open_prs_with_votes(token: Option<String>) -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    let (owner, repo) = GITHUB_REPO.split_once('/').ok_or("Invalid repo format")?;

    // GraphQL requires authentication, fall back to REST if no token
    if token.is_none() || token.as_ref().map(|t| t.is_empty()).unwrap_or(true) {
        log("No token provided, using REST API (slower but works without auth)");
        return fetch_open_prs_rest(owner, repo, token).await;
    }

    log(&format!("Fetching open PRs for {}/{} via GraphQL", owner, repo));

    // Use GraphQL to fetch PRs and reactions in one query
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
              pageInfo {
                hasNextPage
                endCursor
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

    let mut all_prs = vec![];
    let mut cursor: Option<String> = None;

    // Paginate through PRs (100 at a time)
    loop {
        let variables = if let Some(ref c) = cursor {
            format!(r#"{{"owner": "{}", "repo": "{}", "cursor": "{}"}}"#, owner, repo, c)
        } else {
            format!(r#"{{"owner": "{}", "repo": "{}"}}"#, owner, repo)
        };

        let response = fetch_graphql(query, &variables, token.as_deref()).await?;

        let prs = parse_graphql_prs(&response)?;
        let has_next_page = response["data"]["repository"]["pullRequests"]["pageInfo"]["hasNextPage"]
            .as_bool()
            .unwrap_or(false);

        all_prs.extend(prs);

        if !has_next_page {
            break;
        }

        cursor = response["data"]["repository"]["pullRequests"]["pageInfo"]["endCursor"]
            .as_str()
            .map(|s| s.to_string());

        if cursor.is_none() {
            break;
        }
    }

    log(&format!("Found {} open PRs via GraphQL", all_prs.len()));

    // Sort by votes DESC, then created_at DESC
    all_prs.sort_by(|a, b| {
        b.votes
            .cmp(&a.votes)
            .then_with(|| b.created_at.cmp(&a.created_at))
    });

    log(&format!("Sorted {} PRs by votes", all_prs.len()));

    Ok(all_prs)
}

pub async fn fetch_merged_prs(limit: u32, token: Option<String>) -> Result<Vec<MergedPullRequest>, Box<dyn std::error::Error>> {
    let (owner, repo) = GITHUB_REPO.split_once('/').ok_or("Invalid repo format")?;

    log(&format!("Fetching merged PRs for {}/{}", owner, repo));

    let mut all_merged_prs = vec![];
    let mut page = 1;

    // Fetch closed PRs (which includes merged ones)
    loop {
        let url = format!(
            "{}/repos/{}/{}/pulls?state=closed&per_page=100&page={}&sort=updated&direction=desc",
            GITHUB_API, owner, repo, page
        );

        let prs: Vec<GitHubPR> = fetch_json(&url, token.as_deref()).await?;
        let prs_count = prs.len();

        if prs_count == 0 {
            break;
        }

        // Filter to only merged PRs and exclude repo owner
        for pr in prs {
            if let Some(merged_at) = pr.merged_at {
                // Exclude repo owner's PRs
                if pr.user.login != owner.split('/').next().unwrap_or("") {
                    all_merged_prs.push(MergedPullRequest {
                        number: pr.number,
                        title: pr.title,
                        author: pr.user.login,
                        url: pr.html_url,
                        merged_at,
                    });
                }

                if all_merged_prs.len() >= limit as usize {
                    break;
                }
            }
        }

        if all_merged_prs.len() >= limit as usize {
            break;
        }

        if prs_count < 100 {
            break;
        }

        page += 1;
    }

    // Sort by merged_at DESC
    all_merged_prs.sort_by(|a, b| b.merged_at.cmp(&a.merged_at));

    // Take only the requested limit
    all_merged_prs.truncate(limit as usize);

    log(&format!("Found {} merged PRs", all_merged_prs.len()));

    Ok(all_merged_prs)
}


// Fetch GraphQL query
async fn fetch_graphql(
    query: &str,
    variables: &str,
    token: Option<&str>,
) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
    let window = web_sys::window().ok_or("No window object")?;

    let body = format!(
        r#"{{"query": {}, "variables": {}}}"#,
        serde_json::to_string(query)?,
        variables
    );

    let opts = RequestInit::new();
    opts.set_method("POST");
    opts.set_mode(RequestMode::Cors);
    opts.set_body(&wasm_bindgen::JsValue::from_str(&body));

    let request = Request::new_with_str_and_init(GITHUB_GRAPHQL, &opts)
        .map_err(|e| format!("Request creation failed: {:?}", e))?;

    request
        .headers()
        .set("Content-Type", "application/json")
        .map_err(|e| format!("Header set failed: {:?}", e))?;

    request
        .headers()
        .set("Accept", "application/vnd.github.v4+json")
        .map_err(|e| format!("Header set failed: {:?}", e))?;

    // GraphQL requires authentication for most queries
    if let Some(token) = token {
        if !token.is_empty() {
            request
                .headers()
                .set("Authorization", &format!("Bearer {}", token))
                .map_err(|e| format!("Auth header set failed: {:?}", e))?;
        }
    }

    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| format!("Fetch failed: {:?}", e))?;

    let resp: Response = resp_value
        .dyn_into()
        .map_err(|_| "Response type error")?;

    if !resp.ok() {
        let status = resp.status();
        log_error(&format!("GraphQL HTTP error: {}", status));
        return Err(format!("HTTP error: {}", status).into());
    }

    let json = JsFuture::from(
        resp.json()
            .map_err(|e| format!("JSON extraction failed: {:?}", e))?,
    )
    .await
    .map_err(|e| format!("JSON parse failed: {:?}", e))?;

    let value: serde_json::Value = serde_wasm_bindgen::from_value(json)
        .map_err(|e| format!("Deserialization failed: {:?}", e))?;

    Ok(value)
}

// Parse GraphQL response into PullRequest objects
fn parse_graphql_prs(response: &serde_json::Value) -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    let nodes = response["data"]["repository"]["pullRequests"]["nodes"]
        .as_array()
        .ok_or("Invalid GraphQL response: missing nodes")?;

    let mut prs = vec![];

    for node in nodes {
        let number = node["number"].as_u64().ok_or("Missing PR number")? as u32;
        let title = node["title"].as_str().ok_or("Missing PR title")?.to_string();
        let url = node["url"].as_str().ok_or("Missing PR url")?.to_string();
        let created_at = node["createdAt"].as_str().ok_or("Missing createdAt")?.to_string();
        let author = node["author"]["login"]
            .as_str()
            .unwrap_or("ghost")
            .to_string();

        // Count reactions
        let empty_vec = vec![];
        let reactions = node["reactions"]["nodes"].as_array().unwrap_or(&empty_vec);
        let upvotes = reactions
            .iter()
            .filter(|r| r["content"].as_str() == Some("THUMBS_UP"))
            .count() as i32;
        let downvotes = reactions
            .iter()
            .filter(|r| r["content"].as_str() == Some("THUMBS_DOWN"))
            .count() as i32;

        let votes = upvotes - downvotes;

        // TODO: Handle paginated reactions if hasNextPage is true
        // For now, we only get first 100 reactions per PR

        prs.push(PullRequest {
            number,
            title,
            author,
            url,
            votes,
            created_at,
        });
    }

    Ok(prs)
}

async fn fetch_json<T: serde::de::DeserializeOwned>(
    url: &str,
    token: Option<&str>,
) -> Result<T, Box<dyn std::error::Error>> {
    let window = web_sys::window().ok_or("No window object")?;

    let opts = RequestInit::new();
    opts.set_method("GET");
    opts.set_mode(RequestMode::Cors);

    let request = Request::new_with_str_and_init(url, &opts)
        .map_err(|e| format!("Request creation failed: {:?}", e))?;

    request
        .headers()
        .set("Accept", "application/vnd.github.v3+json")
        .map_err(|e| format!("Header set failed: {:?}", e))?;

    // Add authorization header if token provided
    if let Some(token) = token {
        if !token.is_empty() {
            request
                .headers()
                .set("Authorization", &format!("Bearer {}", token))
                .map_err(|e| format!("Auth header set failed: {:?}", e))?;
        }
    }

    // Add ETag header if we have cached data
    if let Some(etag) = get_cached_etag(url) {
        log(&format!("Using cached ETag: {}", etag));
        request
            .headers()
            .set("If-None-Match", &etag)
            .map_err(|e| format!("ETag header set failed: {:?}", e))?;
    }

    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| format!("Fetch failed: {:?}", e))?;

    let resp: Response = resp_value
        .dyn_into()
        .map_err(|_| "Response type error")?;

    let status = resp.status();

    // 304 Not Modified - use cached data
    if status == 304 {
        log("304 Not Modified - using cached data");
        if let Some(cached) = get_cached_data(url) {
            return serde_json::from_str(&cached)
                .map_err(|e| format!("Cache deserialization failed: {:?}", e).into());
        } else {
            return Err("304 but no cached data found".into());
        }
    }

    if !resp.ok() {
        log_error(&format!("HTTP error: {}", status));
        return Err(format!("HTTP error: {}", status).into());
    }

    // Store new ETag if present
    if let Ok(headers) = resp.headers().get("etag") {
        if let Some(etag) = headers {
            log(&format!("Storing new ETag: {}", etag));
            store_etag(url, &etag);
        }
    }

    let json = JsFuture::from(
        resp.json()
            .map_err(|e| format!("JSON extraction failed: {:?}", e))?,
    )
    .await
    .map_err(|e| format!("JSON parse failed: {:?}", e))?;

    // Store response as JSON string for 304 responses
    if let Ok(text) = serde_wasm_bindgen::from_value::<serde_json::Value>(json.clone()) {
        if let Ok(text_str) = serde_json::to_string(&text) {
            store_cached_data(url, &text_str);
        }
    }

    serde_wasm_bindgen::from_value(json)
        .map_err(|e| format!("Deserialization failed: {:?}", e).into())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vote_sorting() {
        let mut prs = vec![
            PullRequest {
                number: 1,
                title: "PR 1".to_string(),
                author: "user1".to_string(),
                url: "".to_string(),
                votes: 10,
                created_at: "2024-01-01T00:00:00Z".to_string(),
            },
            PullRequest {
                number: 2,
                title: "PR 2".to_string(),
                author: "user2".to_string(),
                url: "".to_string(),
                votes: 20,
                created_at: "2024-01-02T00:00:00Z".to_string(),
            },
            PullRequest {
                number: 3,
                title: "PR 3".to_string(),
                author: "user3".to_string(),
                url: "".to_string(),
                votes: 10,
                created_at: "2024-01-03T00:00:00Z".to_string(),
            },
        ];

        prs.sort_by(|a, b| {
            b.votes
                .cmp(&a.votes)
                .then_with(|| b.created_at.cmp(&a.created_at))
        });

        assert_eq!(prs[0].number, 2); // Highest votes
        assert_eq!(prs[1].number, 3); // Same votes as #1 but newer
        assert_eq!(prs[2].number, 1); // Same votes as #3 but older
    }
}
