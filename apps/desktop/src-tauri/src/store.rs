use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::types::StoredCredentials;

const STORE_PATH: &str = "credentials.json";

pub fn load_credentials(app: &AppHandle) -> Result<StoredCredentials, String> {
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    if let Some(value) = store.get("credentials") {
        serde_json::from_value(value).map_err(|e| e.to_string())
    } else {
        Ok(StoredCredentials::default())
    }
}

pub fn save_credentials(app: &AppHandle, creds: &StoredCredentials) -> Result<(), String> {
    let store = app.store(STORE_PATH).map_err(|e| e.to_string())?;
    store.set(
        "credentials",
        serde_json::to_value(creds).map_err(|e| e.to_string())?,
    );
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}
