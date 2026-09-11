mod credentials;
mod providers;
mod store;
mod types;

use std::sync::Mutex;

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};
use tauri_plugin_opener::OpenerExt;

use credentials::{discover_local_credentials, merge_credentials};
use store::{load_credentials, save_credentials};
use types::{ConnectionStatus, ProviderUsage, StoredCredentials};

struct AppState {
    use_mock: bool,
}

#[tauri::command]
fn get_connection_status(app: tauri::AppHandle) -> Result<ConnectionStatus, String> {
    let stored = load_credentials(&app)?;
    let local = discover_local_credentials();
    let merged = merge_credentials(&stored, &local);

    Ok(ConnectionStatus {
        cursor: merged.cursor_session_token.is_some(),
        claude: merged.claude_access_token.is_some(),
        chatgpt: merged.chatgpt_access_token.is_some(),
        grok: merged.grok_access_token.is_some(),
    })
}

#[tauri::command]
async fn get_usage(app: tauri::AppHandle) -> Result<Vec<ProviderUsage>, String> {
    let state = app.state::<Mutex<AppState>>();
    let use_mock = state.lock().map_err(|e| e.to_string())?.use_mock;

    if use_mock {
        return Ok(providers::mock_all());
    }

    let stored = load_credentials(&app)?;
    let local = discover_local_credentials();
    let merged = merge_credentials(&stored, &local);

    Ok(providers::fetch_all(&merged).await)
}

#[tauri::command]
fn save_provider_token(
    app: tauri::AppHandle,
    provider: String,
    token: String,
) -> Result<(), String> {
    let mut creds = load_credentials(&app)?;
    let trimmed = token.trim();
    if trimmed.is_empty() {
        return Err("Token cannot be empty".into());
    }

    match provider.as_str() {
        "cursor" => creds.cursor_session_token = Some(trimmed.to_string()),
        "claude" => creds.claude_access_token = Some(trimmed.to_string()),
        "chatgpt" => creds.chatgpt_access_token = Some(trimmed.to_string()),
        "grok" => creds.grok_access_token = Some(trimmed.to_string()),
        _ => return Err("Unknown provider".into()),
    }

    save_credentials(&app, &creds)
}

#[tauri::command]
fn disconnect_provider(app: tauri::AppHandle, provider: String) -> Result<(), String> {
    let mut creds = load_credentials(&app)?;
    match provider.as_str() {
        "cursor" => creds.cursor_session_token = None,
        "claude" => creds.claude_access_token = None,
        "chatgpt" => creds.chatgpt_access_token = None,
        "grok" => creds.grok_access_token = None,
        _ => return Err("Unknown provider".into()),
    }
    save_credentials(&app, &creds)
}

#[tauri::command]
fn auto_detect_credentials(app: tauri::AppHandle) -> Result<ConnectionStatus, String> {
    let local = discover_local_credentials();
    let stored = load_credentials(&app)?;
    let merged = merge_credentials(&stored, &local);
    save_credentials(&app, &merged)?;

    Ok(ConnectionStatus {
        cursor: merged.cursor_session_token.is_some(),
        claude: merged.claude_access_token.is_some(),
        chatgpt: merged.chatgpt_access_token.is_some(),
        grok: merged.grok_access_token.is_some(),
    })
}

#[tauri::command]
async fn open_login_page(app: tauri::AppHandle, provider: String) -> Result<(), String> {
    let url = match provider.as_str() {
        "cursor" => "https://cursor.com/dashboard",
        "claude" => "https://claude.ai/login",
        "chatgpt" => "https://chatgpt.com",
        "grok" => "https://grok.com",
        _ => return Err("Unknown provider".into()),
    };
    app.opener()
        .open_url(url, None::<&str>)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn set_always_on_top(app: tauri::AppHandle, enabled: bool) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("Window not found")?;
    window
        .set_always_on_top(enabled)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(Mutex::new(AppState {
            use_mock: std::env::var("QUOTA_DOCK_MOCK")
                .map(|v| v == "1")
                .unwrap_or(false),
        }))
        .setup(|app| {
            let show = MenuItem::with_id(app, "show", "Show Widget", true, None::<&str>)?;
            let hide = MenuItem::with_id(app, "hide", "Hide Widget", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Quota Dock", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &hide, &quit])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    }
                    "hide" => {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.hide();
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(w) = app.get_webview_window("main") {
                            if w.is_visible().unwrap_or(false) {
                                let _ = w.hide();
                            } else {
                                let _ = w.show();
                                let _ = w.set_focus();
                            }
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_usage,
            get_connection_status,
            save_provider_token,
            disconnect_provider,
            auto_detect_credentials,
            open_login_page,
            set_always_on_top
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
