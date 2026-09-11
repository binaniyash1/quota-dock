use serde_json::Value;

use super::window_percent;
use crate::types::ProviderUsage;

fn window_from_rate(obj: &Value, fallback_label: &str) -> Option<crate::types::QuotaWindow> {
    let used = obj.get("used_percent").and_then(|v| v.as_f64())?;
    let seconds = obj.get("limit_window_seconds").and_then(|v| v.as_u64());
    let reset_secs = obj.get("reset_after_seconds").and_then(|v| v.as_u64());

    let (kind, label) = match seconds {
        Some(s) if s >= 6 * 24 * 3600 => ("weekly", "Weekly"),
        _ => ("session", "Session (5h)"),
    };

    let resets_at = reset_secs.map(|secs| {
        (chrono::Utc::now() + chrono::Duration::seconds(secs as i64))
            .to_rfc3339()
    });

    Some(window_percent(kind, label, used, resets_at))
}

pub async fn fetch(token: Option<String>) -> ProviderUsage {
    let base = ProviderUsage {
        id: "chatgpt".into(),
        name: "ChatGPT".into(),
        plan: None,
        status: "disconnected".into(),
        windows: vec![],
        last_synced_at: chrono::Utc::now().to_rfc3339(),
        error: None,
        accent: "#10A37F".into(),
    };

    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return ProviderUsage { error: Some("Not connected".into()), ..base },
    };

    let client = reqwest::Client::new();
    let resp = client
        .get("https://chatgpt.com/backend-api/wham/usage")
        .header("Authorization", format!("Bearer {}", token))
        .header("OpenAI-Beta", "codex-1")
        .header("originator", "Codex Desktop")
        .send()
        .await;

    let mut windows = vec![];

    if let Ok(resp) = resp {
        if let Ok(json) = resp.json::<Value>().await {
            if let Some(primary) = json.get("primary_window") {
                if let Some(w) = window_from_rate(primary, "Primary") {
                    windows.push(w);
                }
            }
            if let Some(secondary) = json.get("secondary_window") {
                if let Some(w) = window_from_rate(secondary, "Weekly") {
                    windows.push(w);
                }
            }
        }
    }

    if windows.is_empty() {
        return ProviderUsage {
            status: "error".into(),
            error: Some("Could not read ChatGPT usage. Log in to Codex first.".into()),
            ..base
        };
    }

    ProviderUsage {
        status: "connected".into(),
        plan: Some("Plus / Pro".into()),
        windows,
        ..base
    }
}
