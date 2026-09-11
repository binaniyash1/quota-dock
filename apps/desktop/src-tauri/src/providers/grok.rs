use serde_json::Value;

use super::window_percent;
use crate::types::ProviderUsage;

pub async fn fetch(token: Option<String>) -> ProviderUsage {
    let base = ProviderUsage {
        id: "grok".into(),
        name: "Grok".into(),
        plan: None,
        status: "disconnected".into(),
        windows: vec![],
        last_synced_at: chrono::Utc::now().to_rfc3339(),
        error: None,
        accent: "#111827".into(),
    };

    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return ProviderUsage { error: Some("Not connected".into()), ..base },
    };

    let client = reqwest::Client::new();
    let resp = client
        .get("https://cli-chat-proxy.grok.com/v1/billing?format=credits")
        .header("Authorization", format!("Bearer {}", token))
        .header("X-XAI-Token-Auth", "xai-grok-cli")
        .send()
        .await;

    let mut windows = vec![];

    if let Ok(resp) = resp {
        if let Ok(json) = resp.json::<Value>().await {
            if let Some(config) = json.get("config") {
                let pct = config
                    .get("creditUsagePercent")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);
                let reset = config
                    .pointer("/currentPeriod/end")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());
                windows.push(window_percent("weekly", "Weekly credits", pct, reset));
            }
        }
    }

    if windows.is_empty() {
        return ProviderUsage {
            status: "error".into(),
            error: Some("Could not read Grok usage. Run `grok login` first.".into()),
            ..base
        };
    }

    ProviderUsage {
        status: "connected".into(),
        plan: Some("SuperGrok".into()),
        windows,
        ..base
    }
}
