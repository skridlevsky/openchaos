use js_sys::{Date, Function, Reflect};
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::{prelude::*, JsCast};
use wasm_bindgen_futures::JsFuture;
use web_sys::{Headers, Request, RequestInit, Response};

const GH_ACCEPT: &str = "application/vnd.github.v3+json";
const REACTIONS_ACCEPT: &str = "application/vnd.github.squirrel-girl-preview+json";

#[derive(Serialize, Deserialize)]
struct GitHubUser {
    login: String,
}

#[derive(Serialize, Deserialize)]
struct GitHubPR {
    number: u32,
    title: String,
    html_url: String,
    user: GitHubUser,
    created_at: String,
}

#[derive(Serialize, Deserialize)]
struct GitHubReaction {
    content: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PullRequest {
    number: u32,
    title: String,
    author: String,
    url: String,
    votes: u32,
    created_at: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CountdownRemaining {
    days: u32,
    hours: u32,
    minutes: u32,
    seconds: u32,
}

#[wasm_bindgen]
pub async fn get_open_prs(repo: String) -> Result<JsValue, JsValue> {
    let (owner, name) = split_repo(&repo)?;
    let prs_url = format!("https://api.github.com/repos/{owner}/{name}/pulls?state=open");
    let prs: Vec<GitHubPR> = fetch_paged(&prs_url, GH_ACCEPT).await?;

    let mut mapped: Vec<PullRequest> = Vec::with_capacity(prs.len());
    for pr in prs {
        let reactions_url = format!(
            "https://api.github.com/repos/{owner}/{name}/issues/{}/reactions",
            pr.number
        );
        let reactions: Vec<GitHubReaction> =
            fetch_paged(&reactions_url, REACTIONS_ACCEPT).await?;
        let votes = reactions
            .iter()
            .filter(|reaction| reaction.content == "+1")
            .count() as u32;

        mapped.push(PullRequest {
            number: pr.number,
            title: pr.title,
            author: pr.user.login,
            url: pr.html_url,
            votes,
            created_at: pr.created_at,
        });
    }

    mapped.sort_by(|a, b| b.votes.cmp(&a.votes));
    to_value(&mapped).map_err(|e| e.into())
}

#[wasm_bindgen]
pub fn next_merge_timestamp(now_ms: f64) -> f64 {
    let now = Date::new(&JsValue::from_f64(now_ms));
    let day = now.get_utc_day();
    let hour = now.get_utc_hours();

    let mut days_until_sunday = (7 - day) % 7;
    if day == 0 && hour < 9 {
        days_until_sunday = 0;
    } else if day == 0 {
        days_until_sunday = 7;
    }

    let target = Date::new(&JsValue::from_f64(now_ms));
    if days_until_sunday > 0 {
        target.set_utc_date(target.get_utc_date() + days_until_sunday);
    }
    target.set_utc_hours(9);
    target.set_utc_minutes(0);
    target.set_utc_seconds(0);
    target.set_utc_milliseconds(0);
    target.get_time()
}

#[wasm_bindgen]
pub fn remaining_until(target_ms: f64, now_ms: f64) -> Result<JsValue, JsValue> {
    let diff_ms = if target_ms > now_ms {
        target_ms - now_ms
    } else {
        0.0
    };

    let total_seconds = (diff_ms / 1000.0).floor() as u64;
    let days = total_seconds / 86_400;
    let hours = (total_seconds % 86_400) / 3_600;
    let minutes = (total_seconds % 3_600) / 60;
    let seconds = total_seconds % 60;

    let remaining = CountdownRemaining {
        days: days as u32,
        hours: hours as u32,
        minutes: minutes as u32,
        seconds: seconds as u32,
    };

    to_value(&remaining).map_err(|e| e.into())
}

fn split_repo(repo: &str) -> Result<(&str, &str), JsValue> {
    let mut parts = repo.splitn(2, '/');
    let owner = parts.next().unwrap_or_default();
    let name = parts.next().unwrap_or_default();

    if owner.is_empty() || name.is_empty() {
        return Err(JsValue::from_str("Repo must be in the form owner/name"));
    }

    Ok((owner, name))
}

async fn fetch_json(url: String, accept: &str) -> Result<JsValue, JsValue> {
    let init = RequestInit::new();
    init.set_method("GET");

    let headers = Headers::new()?;
    headers.set("Accept", accept)?;
    init.set_headers(&headers);

    let request = Request::new_with_str_and_init(&url, &init)?;
    let global = js_sys::global();
    let fetch_value = Reflect::get(&global, &JsValue::from_str("fetch"))?;
    if fetch_value.is_undefined() {
        return Err(JsValue::from_str("fetch is not available in this runtime"));
    }

    let fetch = fetch_value.dyn_into::<Function>()?;
    let promise = fetch.call1(&global, &request)?;
    let promise = promise.dyn_into::<js_sys::Promise>()?;
    let response_value = JsFuture::from(promise).await?;
    let response: Response = response_value.dyn_into()?;

    if !response.ok() {
        if response.status() == 403 {
            return Err(JsValue::from_str("Rate limited by GitHub API"));
        }
        return Err(JsValue::from_str(&format!(
            "GitHub API error: {}",
            response.status()
        )));
    }

    let json_promise = response.json()?;
    let json = JsFuture::from(json_promise).await?;
    Ok(json)
}

fn paged_url(base: &str, page: u32, per_page: u32) -> String {
    let separator = if base.contains('?') { "&" } else { "?" };
    format!("{base}{separator}per_page={per_page}&page={page}")
}

async fn fetch_paged<T>(base_url: &str, accept: &str) -> Result<Vec<T>, JsValue>
where
    T: for<'de> Deserialize<'de>,
{
    let mut page = 1;
    let mut all: Vec<T> = Vec::new();

    loop {
        let url = paged_url(base_url, page, 100);
        let value = fetch_json(url, accept).await?;
        let mut items: Vec<T> = from_value(value)?;
        if items.is_empty() {
            break;
        }

        let done = items.len() < 100;
        all.append(&mut items);
        if done {
            break;
        }
        page += 1;
    }

    Ok(all)
}
