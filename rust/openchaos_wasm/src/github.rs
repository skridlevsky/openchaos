use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};
use crate::types::*;
use crate::utils::{log, log_error};

const GITHUB_REPO: &str = "skridlevsky/openchaos";
const GITHUB_API: &str = "https://api.github.com";

pub async fn fetch_open_prs_with_votes() -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    let (owner, repo) = GITHUB_REPO.split_once('/').ok_or("Invalid repo format")?;

    log(&format!("Fetching open PRs for {}/{}", owner, repo));

    // Fetch PRs (paginated)
    let mut all_prs = vec![];
    let mut page = 1;

    loop {
        let url = format!(
            "{}/repos/{}/{}/pulls?state=open&per_page=100&page={}",
            GITHUB_API, owner, repo, page
        );

        let prs: Vec<GitHubPR> = fetch_json(&url).await?;
        let prs_count = prs.len();

        if prs_count == 0 {
            break;
        }

        all_prs.extend(prs);

        if prs_count < 100 {
            break;
        }

        page += 1;
    }

    log(&format!("Found {} open PRs", all_prs.len()));

    // Fetch votes for each PR
    let mut prs_with_votes = vec![];
    for pr in all_prs {
        let votes = fetch_pr_votes(owner, repo, pr.number).await?;
        prs_with_votes.push(PullRequest {
            number: pr.number,
            title: pr.title,
            author: pr.user.login,
            url: pr.html_url,
            votes,
            created_at: pr.created_at,
        });
    }

    // Sort by votes DESC, then created_at DESC
    prs_with_votes.sort_by(|a, b| {
        b.votes
            .cmp(&a.votes)
            .then_with(|| b.created_at.cmp(&a.created_at))
    });

    log(&format!("Sorted {} PRs by votes", prs_with_votes.len()));

    Ok(prs_with_votes)
}

pub async fn fetch_merged_prs(limit: u32) -> Result<Vec<MergedPullRequest>, Box<dyn std::error::Error>> {
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

        let prs: Vec<GitHubPR> = fetch_json(&url).await?;
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

async fn fetch_pr_votes(
    owner: &str,
    repo: &str,
    pr_number: u32,
) -> Result<i32, Box<dyn std::error::Error>> {
    let mut all_reactions = vec![];
    let mut page = 1;

    loop {
        let url = format!(
            "{}/repos/{}/{}/issues/{}/reactions?per_page=100&page={}",
            GITHUB_API, owner, repo, pr_number, page
        );

        let reactions: Vec<GitHubReaction> = fetch_json(&url).await?;
        let reactions_count = reactions.len();

        if reactions_count == 0 {
            break;
        }

        all_reactions.extend(reactions);

        if reactions_count < 100 {
            break;
        }

        page += 1;
    }

    let upvotes = all_reactions.iter().filter(|r| r.content == "+1").count() as i32;
    let downvotes = all_reactions.iter().filter(|r| r.content == "-1").count() as i32;

    Ok(upvotes - downvotes)
}

async fn fetch_json<T: serde::de::DeserializeOwned>(
    url: &str,
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

    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| format!("Fetch failed: {:?}", e))?;

    let resp: Response = resp_value
        .dyn_into()
        .map_err(|_| "Response type error")?;

    if !resp.ok() {
        let status = resp.status();
        log_error(&format!("HTTP error: {}", status));
        return Err(format!("HTTP error: {}", status).into());
    }

    let json = JsFuture::from(
        resp.json()
            .map_err(|e| format!("JSON extraction failed: {:?}", e))?,
    )
    .await
    .map_err(|e| format!("JSON parse failed: {:?}", e))?;

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
