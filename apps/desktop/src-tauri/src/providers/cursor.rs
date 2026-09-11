use serde_json::Value;

use super::{window_dollars, window_percent};
use crate::types::ProviderUsage;

pub async fn fetch(token: Option<String>) -> ProviderUsage {
    let base = ProviderUsage {
        id: "cursor".into(),
        name: "Cursor".into(),
        plan: None,
        status: "disconnected".into(),
        windows: vec![],
        last_synced_at: chrono::Utc::now().to_rfc3339(),
        error: None,
        accent: "#7C3AED".into(),
    };

    let token = match token {
        Some(t) if !t.is_empty() => t,
        _ => return ProviderUsage { error: Some("Not connected".into()), ..base },
    };

    let client = reqwest::Client::new();
    let cookie = format!("WorkosCursorSessionToken={}", token);

    let summary = client
        .get("https://www.cursor.com/api/usage-summary")
        .header("Cookie", cookie.clone())
        .send()
        .await;

    let mut windows = vec![];

    if let Ok(resp) = summary {
        if let Ok(json) = resp.json::<Value>().await {
            if let Some(plan) = json.pointer("/individualUsage/plan") {
                let used = plan.get("used").and_then(|v| v.as_f64());
                let limit = plan.get("limit").and_then(|v| v.as_f64());
                let resets = json
                    .get("billingCycleEnd")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());

                if let (Some(used), Some(limit)) = (used, limit) {
                    windows.push(window_dollars("billing_cycle", "Monthly included", used, limit, resets));
                }

                if let Some(pct) = plan.get("apiPercentUsed").and_then(|v| v.as_f64()) {
                    windows.push(window_percent("monthly", "API models", pct, None));
                }
                if let Some(pct) = plan.get("autoPercentUsed").and_then(|v| v.as_f64()) {
                    windows.push(window_percent("monthly", "Cursor models", pct, None));
                }
            }
        }
    }

    if windows.is_empty() {
        return ProviderUsage {
            status: "error".into(),
            error: Some("Could not read Cursor usage. Try reconnecting.".into()),
            ..base
        };
    }

    ProviderUsage {
        status: "connected".into(),
        plan: Some("Pro".into()),
        windows,
        ..base
    }
}
