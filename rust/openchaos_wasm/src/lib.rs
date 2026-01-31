use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::to_value;

mod github;
mod types;
mod utils;

#[wasm_bindgen]
pub async fn get_open_prs(token: Option<String>) -> Result<JsValue, JsValue> {
    utils::log("WASM: get_open_prs() called");

    let prs = github::fetch_open_prs_with_votes(token)
        .await
        .map_err(|e| {
            let err_msg = format!("Failed to fetch open PRs: {}", e);
            utils::log_error(&err_msg);
            JsValue::from_str(&err_msg)
        })?;

    utils::log(&format!("WASM: Returning {} open PRs", prs.len()));

    to_value(&prs).map_err(|e| {
        let err_msg = format!("Serialization failed: {}", e);
        utils::log_error(&err_msg);
        JsValue::from_str(&err_msg)
    })
}

#[wasm_bindgen]
pub async fn get_merged_prs(limit: u32, token: Option<String>) -> Result<JsValue, JsValue> {
    utils::log(&format!("WASM: get_merged_prs({}) called", limit));

    let prs = github::fetch_merged_prs(limit, token)
        .await
        .map_err(|e| {
            let err_msg = format!("Failed to fetch merged PRs: {}", e);
            utils::log_error(&err_msg);
            JsValue::from_str(&err_msg)
        })?;

    utils::log(&format!("WASM: Returning {} merged PRs", prs.len()));

    to_value(&prs).map_err(|e| {
        let err_msg = format!("Serialization failed: {}", e);
        utils::log_error(&err_msg);
        JsValue::from_str(&err_msg)
    })
}
