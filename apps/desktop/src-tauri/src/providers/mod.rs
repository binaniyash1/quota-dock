mod claude;
mod chatgpt;
mod cursor;
mod grok;

use crate::types::{ProviderUsage, StoredCredentials};

pub async fn fetch_all(creds: &StoredCredentials) -> Vec<ProviderUsage> {
    let (cursor, claude, chatgpt, grok) = tokio::join!(
        cursor::fetch(creds.cursor_session_token.clone()),
        claude::fetch(creds.claude_access_token.clone()),
        chatgpt::fetch(creds.chatgpt_access_token.clone()),
        grok::fetch(creds.grok_access_token.clone()),
    );

    vec![cursor, claude, chatgpt, grok]
}

pub fn mock_all() -> Vec<ProviderUsage> {
    let now = chrono::Utc::now().to_rfc3339();
    let session_reset = (chrono::Utc::now() + chrono::Duration::hours(2)).to_rfc3339();
    let weekly_reset = (chrono::Utc::now() + chrono::Duration::days(4)).to_rfc3339();

    vec![
        ProviderUsage {
            id: "cursor".into(),
            name: "Cursor".into(),
            plan: Some("Pro".into()),
            status: "connected".into(),
            accent: "#7C3AED".into(),
            last_synced_at: now.clone(),
            error: None,
            windows: vec![
                window_dollars("billing_cycle", "Monthly included", 14.2, 20.0, Some(weekly_reset.clone())),
                window_percent("monthly", "API models", 68.0, None),
            ],
        },
        ProviderUsage {
            id: "claude".into(),
            name: "Claude".into(),
            plan: Some("Max".into()),
            status: "connected".into(),
            accent: "#D97757".into(),
            last_synced_at: now.clone(),
            error: None,
            windows: vec![
                window_percent("session", "Session (5h)", 42.0, Some(session_reset.clone())),
                window_percent("weekly", "Weekly", 78.0, Some(weekly_reset.clone())),
            ],
        },
        ProviderUsage {
            id: "chatgpt".into(),
            name: "ChatGPT".into(),
            plan: Some("Plus".into()),
            status: "connected".into(),
            accent: "#10A37F".into(),
            last_synced_at: now.clone(),
            error: None,
            windows: vec![
                window_percent("session", "Session (5h)", 55.0, Some(session_reset.clone())),
                window_percent("weekly", "Weekly", 31.0, Some(weekly_reset.clone())),
            ],
        },
        ProviderUsage {
            id: "grok".into(),
            name: "Grok".into(),
            plan: Some("SuperGrok".into()),
            status: "connected".into(),
            accent: "#111827".into(),
            last_synced_at: now.clone(),
            error: None,
            windows: vec![
                window_percent("weekly", "Weekly credits", 23.0, Some(weekly_reset.clone())),
            ],
        },
    ]
}

fn clamp_percent(value: f64) -> f64 {
    value.clamp(0.0, 100.0).round()
}

pub(crate) fn window_percent(
    kind: &str,
    label: &str,
    percent_used: f64,
    resets_at: Option<String>,
) -> crate::types::QuotaWindow {
    let used = clamp_percent(percent_used);
    crate::types::QuotaWindow {
        kind: kind.into(),
        label: label.into(),
        used,
        limit: 100.0,
        remaining: 100.0 - used,
        percent_used: used,
        resets_at,
    }
}

pub(crate) fn window_dollars(
    kind: &str,
    label: &str,
    used: f64,
    limit: f64,
    resets_at: Option<String>,
) -> crate::types::QuotaWindow {
    let remaining = (limit - used).max(0.0);
    let percent_used = if limit > 0.0 {
        clamp_percent((used / limit) * 100.0)
    } else {
        0.0
    };
    crate::types::QuotaWindow {
        kind: kind.into(),
        label: label.into(),
        used,
        limit,
        remaining,
        percent_used,
        resets_at,
    }
}
