use serde_json::Value;

use super::window_percent;
use crate::types::ProviderUsage;

pub async fn fetch(token: Option<String>) -> ProviderUsage {
    let base = ProviderUsage {
        id: "claude".into(),
        name: "Claude".into(),
        plan: None,
        status: "disconnected".into(),
        windows: vec![],
        last_synced_at: chrono::Utc::now().to_rfc3339(),
        error: None,
        accent: "#D97757".into(),
    };

    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return ProviderUsage { error: Some("Not connected".into()), ..base },
    };

    let client = reqwest::Client::new();
    let headers = [
        ("Authorization", format!("Bearer {}", token)),
        ("anthropic-beta", "oauth-2025-04-20".into()),
    ];

    let mut req = client.get("https://api.anthropic.com/api/oauth/usage");
    for (k, v) in headers {
        req = req.header(k, v);
    }

    let usage_resp = req.send().await;
    let mut windows = vec![];

    if let Ok(resp) = usage_resp {
        if let Ok(json) = resp.json::<Value>().await {
            let session = json
                .get("five_hour_sonnet")
                .or_else(|| json.get("five_hour_opus"))
                .or_else(|| json.get("five_hour"));
            let weekly = json
                .get("seven_day_sonnet")
                .or_else(|| json.get("seven_day_opus"))
                .or_else(|| json.get("seven_day"));

            if let Some(s) = session {
                let pct = s.get("utilization").and_then(|v| v.as_f64()).unwrap_or(0.0);
                let reset = s
                    .get("resets_at")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());
                windows.push(window_percent("session", "Session (5h)", pct, reset));
            }

            if let Some(w) = weekly {
                let pct = w.get("utilization").and_then(|v| v.as_f64()).unwrap_or(0.0);
                let reset = w
                    .get("resets_at")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());
                windows.push(window_percent("weekly", "Weekly", pct, reset));
            }
        }
    }

    if windows.is_empty() {
        return ProviderUsage {
            status: "error".into(),
            error: Some("Could not read Claude usage. Log in to Claude Code first.".into()),
            ..base
        };
    }

    ProviderUsage {
        status: "connected".into(),
        plan: Some("Pro / Max".into()),
        windows,
        ..base
    }
}
