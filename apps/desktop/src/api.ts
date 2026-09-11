import { invoke } from "@tauri-apps/api/core";
import type { ConnectionStatus, ProviderId, ProviderUsage } from "./types";

export async function getUsage(): Promise<ProviderUsage[]> {
  return invoke<ProviderUsage[]>("get_usage");
}

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  return invoke<ConnectionStatus>("get_connection_status");
}

export async function autoDetect(): Promise<ConnectionStatus> {
  return invoke<ConnectionStatus>("auto_detect_credentials");
}

export async function saveToken(
  provider: ProviderId,
  token: string
): Promise<void> {
  return invoke("save_provider_token", { provider, token });
}

export async function disconnect(provider: ProviderId): Promise<void> {
  return invoke("disconnect_provider", { provider });
}

export async function openLogin(provider: ProviderId): Promise<void> {
  return invoke("open_login_page", { provider });
}

export async function setAlwaysOnTop(enabled: boolean): Promise<void> {
  return invoke("set_always_on_top", { enabled });
}
