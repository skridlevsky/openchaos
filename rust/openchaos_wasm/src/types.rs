use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PullRequest {
    pub number: u32,
    pub title: String,
    pub author: String,
    pub url: String,
    pub votes: i32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MergedPullRequest {
    pub number: u32,
    pub title: String,
    pub author: String,
    pub url: String,
    pub merged_at: String,
}

#[derive(Debug, Deserialize)]
pub struct GitHubPR {
    pub number: u32,
    pub title: String,
    pub html_url: String,
    pub user: GitHubUser,
    pub created_at: String,
    #[serde(default)]
    pub merged_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct GitHubUser {
    pub login: String,
}

#[derive(Debug, Deserialize)]
pub struct GitHubReaction {
    pub content: String,
}

#[derive(Debug)]
#[allow(dead_code)]
pub enum WasmError {
    FetchError(String),
    ParseError(String),
    NetworkError(String),
}

impl fmt::Display for WasmError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            WasmError::FetchError(msg) => write!(f, "Fetch error: {}", msg),
            WasmError::ParseError(msg) => write!(f, "Parse error: {}", msg),
            WasmError::NetworkError(msg) => write!(f, "Network error: {}", msg),
        }
    }
}

impl std::error::Error for WasmError {}
