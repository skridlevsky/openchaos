use wasm_bindgen::prelude::*;

mod github;
mod types;

// Re-export for Node.js
#[wasm_bindgen]
pub async fn get_open_prs(token: Option<String>) -> Result<JsValue, JsValue> {
    console_log("WASM: get_open_prs() called");

    let prs = github::fetch_open_prs_with_votes(token)
        .await
        .map_err(|e| {
            let err_msg = format!("Failed to fetch open PRs: {}", e);
            console_error(&err_msg);
            JsValue::from_str(&err_msg)
        })?;

    console_log(&format!("WASM: Returning {} open PRs", prs.len()));

    // Return as JSON string for easier consumption in Node.js
    let json = serde_json::to_string(&prs)
        .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))?;

    Ok(JsValue::from_str(&json))
}

#[wasm_bindgen]
pub async fn get_merged_prs(limit: u32, token: Option<String>) -> Result<JsValue, JsValue> {
    console_log(&format!("WASM: get_merged_prs({}) called", limit));

    let prs = github::fetch_merged_prs(limit, token)
        .await
        .map_err(|e| {
            let err_msg = format!("Failed to fetch merged PRs: {}", e);
            console_error(&err_msg);
            JsValue::from_str(&err_msg)
        })?;

    console_log(&format!("WASM: Returning {} merged PRs", prs.len()));

    // Return as JSON string for easier consumption in Node.js
    let json = serde_json::to_string(&prs)
        .map_err(|e| JsValue::from_str(&format!("Serialization failed: {}", e)))?;

    Ok(JsValue::from_str(&json))
}

// Console logging helpers
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

fn console_log(s: &str) {
    log(s);
}

fn console_error(s: &str) {
    error(s);
}
