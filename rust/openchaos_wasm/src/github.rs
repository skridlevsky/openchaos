use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};
use crate::types::*;
use crate::utils::log;

// Fetch open PRs with votes from our Next.js API endpoint
pub async fn fetch_open_prs_with_votes(_token: Option<String>) -> Result<Vec<PullRequest>, Box<dyn std::error::Error>> {
    log("Fetching open PRs from Next.js API");

    let url = "/api/github/prs";
    let prs: Vec<PullRequest> = fetch_json(url).await?;

    log(&format!("Received {} PRs from API", prs.len()));

    Ok(prs)
}

// Fetch merged PRs from our Next.js API endpoint
pub async fn fetch_merged_prs(limit: u32, _token: Option<String>) -> Result<Vec<MergedPullRequest>, Box<dyn std::error::Error>> {
    log(&format!("Fetching {} merged PRs from Next.js API", limit));

    let url = format!("/api/github/merged?limit={}", limit);
    let prs: Vec<MergedPullRequest> = fetch_json(&url).await?;

    log(&format!("Received {} merged PRs from API", prs.len()));

    Ok(prs)
}

// Generic JSON fetch helper
async fn fetch_json<T: serde::de::DeserializeOwned>(url: &str) -> Result<T, Box<dyn std::error::Error>> {
    let window = web_sys::window().ok_or("No window object")?;

    let opts = RequestInit::new();
    opts.set_method("GET");
    opts.set_mode(RequestMode::SameOrigin);

    let request = Request::new_with_str_and_init(url, &opts)
        .map_err(|e| format!("Request creation failed: {:?}", e))?;

    request
        .headers()
        .set("Accept", "application/json")
        .map_err(|e| format!("Header set failed: {:?}", e))?;

    let resp_value = JsFuture::from(window.fetch_with_request(&request))
        .await
        .map_err(|e| format!("Fetch failed: {:?}", e))?;

    let resp: Response = resp_value
        .dyn_into()
        .map_err(|_| "Response type error")?;

    if !resp.ok() {
        let status = resp.status();
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
