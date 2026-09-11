use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuotaWindow {
    pub kind: String,
    pub label: String,
    pub used: f64,
    pub limit: f64,
    pub remaining: f64,
    pub percent_used: f64,
    pub resets_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderUsage {
    pub id: String,
    pub name: String,
    pub plan: Option<String>,
    pub status: String,
    pub windows: Vec<QuotaWindow>,
    pub last_synced_at: String,
    pub error: Option<String>,
    pub accent: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct StoredCredentials {
    pub cursor_session_token: Option<String>,
    pub claude_access_token: Option<String>,
    pub chatgpt_access_token: Option<String>,
    pub grok_access_token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionStatus {
    pub cursor: bool,
    pub claude: bool,
    pub chatgpt: bool,
    pub grok: bool,
}
