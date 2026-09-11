use std::fs;
use std::path::{Path, PathBuf};

use serde_json::Value;

use crate::types::StoredCredentials;

pub fn discover_local_credentials() -> StoredCredentials {
    let mut creds = StoredCredentials::default();

    creds.cursor_session_token = read_cursor_token();
    creds.claude_access_token = read_claude_token();
    creds.chatgpt_access_token = read_chatgpt_token();
    creds.grok_access_token = read_grok_token();

    creds
}

pub fn merge_credentials(
    stored: &StoredCredentials,
    local: &StoredCredentials,
) -> StoredCredentials {
    StoredCredentials {
        cursor_session_token: stored
            .cursor_session_token
            .clone()
            .or_else(|| local.cursor_session_token.clone()),
        claude_access_token: stored
            .claude_access_token
            .clone()
            .or_else(|| local.claude_access_token.clone()),
        chatgpt_access_token: stored
            .chatgpt_access_token
            .clone()
            .or_else(|| local.chatgpt_access_token.clone()),
        grok_access_token: stored
            .grok_access_token
            .clone()
            .or_else(|| local.grok_access_token.clone()),
    }
}

fn read_text(path: &Path) -> Option<String> {
    fs::read_to_string(path).ok()
}

fn extract_jsonish_value(raw: &str, key: &str) -> Option<String> {
    let patterns = [
        format!("\"{}\":\"", key),
        format!("\"{}\": \"", key),
        format!("{}=", key),
        format!("{} =", key),
    ];

    for pattern in patterns {
        if let Some(start) = raw.find(&pattern) {
            let value_start = start + pattern.len();
            let rest = &raw[value_start..];
            let end = rest
                .find(|c: char| c == '"' || c == '\'' || c.is_whitespace() || c == ',' || c == '}')
                .unwrap_or(rest.len());
            let token = rest[..end].trim();
            if !token.is_empty() {
                return Some(token.to_string());
            }
        }
    }

    None
}

fn read_json(path: &Path) -> Option<Value> {
    read_text(path).and_then(|raw| serde_json::from_str(&raw).ok())
}

fn home() -> Option<PathBuf> {
    dirs::home_dir()
}

fn read_cursor_token() -> Option<String> {
    if let Ok(token) = std::env::var("CURSOR_SESSION_TOKEN") {
        if !token.is_empty() {
            return Some(token);
        }
    }

    let home = home()?;
    let paths = [
        home.join(".config/Cursor/User/globalStorage/storage.json"),
        home.join("Library/Application Support/Cursor/User/globalStorage/storage.json"),
    ];

    for path in paths {
        if let Some(raw) = read_text(&path) {
            if let Some(token) = extract_jsonish_value(&raw, "WorkosCursorSessionToken") {
                return Some(token);
            }
        }
    }

    None
}

fn read_claude_token() -> Option<String> {
    if let Ok(token) = std::env::var("ANTHROPIC_OAUTH_TOKEN") {
        if !token.is_empty() {
            return Some(token);
        }
    }

    let home = home()?;
    let mut paths = vec![home.join(".claude/.credentials.json")];

    if let Ok(entries) = fs::read_dir(&home) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(".claude-") {
                paths.push(entry.path().join(".credentials.json"));
            }
        }
    }

    for path in paths {
        if let Some(json) = read_json(&path) {
            let token = json
                .pointer("/claudeAiOauth/accessToken")
                .or_else(|| json.pointer("/oauth/accessToken"));
            if let Some(Value::String(token)) = token {
                return Some(token.clone());
            }
        }
    }

    None
}

fn read_chatgpt_token() -> Option<String> {
    if let Ok(token) = std::env::var("OPENAI_CODEX_TOKEN") {
        if !token.is_empty() {
            return Some(token);
        }
    }

    let home = home()?;
    let mut paths = vec![home.join(".codex/auth.json")];

    if let Ok(entries) = fs::read_dir(&home) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(".codex-") {
                paths.push(entry.path().join("auth.json"));
            }
        }
    }

    for path in paths {
        if let Some(json) = read_json(&path) {
            if let Some(Value::String(token)) = json.pointer("/tokens/access_token") {
                return Some(token.clone());
            }
            if let Some(Value::String(token)) = json.get("accessToken") {
                return Some(token.clone());
            }
        }
    }

    None
}

fn read_grok_token() -> Option<String> {
    if let Ok(token) = std::env::var("GROK_ACCESS_TOKEN") {
        if !token.is_empty() {
            return Some(token);
        }
    }

    let home = home()?;
    let mut paths = vec![home.join(".grok/auth.json")];

    if let Ok(entries) = fs::read_dir(&home) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with(".grok-") {
                paths.push(entry.path().join("auth.json"));
            }
        }
    }

    for path in paths {
        if let Some(json) = read_json(&path) {
            if let Some(obj) = json.as_object() {
                for value in obj.values() {
                    if let Some(Value::String(key)) = value.get("key") {
                        return Some(key.clone());
                    }
                }
            }
        }
    }

    None
}
