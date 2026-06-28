import { API_URL } from "@/lib/constants";
import type { CityBuilding, InstagramStats, MeResponse, PublicInstagramImportRequest, SyncResponse } from "@/lib/types";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    let detail = `Request failed with ${response.status}`;
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body.detail ?? detail;
    } catch {
      // Keep the HTTP status message when the server returns no JSON body.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export function importPublicInstagram(payload: PublicInstagramImportRequest) {
  return request<SyncResponse>("/instagram/public/import", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMe() {
  return request<MeResponse>("/users/me");
}

export function syncInstagram() {
  return request<SyncResponse>("/instagram/sync", { method: "POST" });
}

export function getMyStats() {
  return request<InstagramStats>("/instagram/me/stats");
}

export function getBuildings() {
  return request<CityBuilding[]>("/city/buildings");
}

export function getBuilding(id: string) {
  return request<CityBuilding>(`/city/buildings/${id}`);
}

export function getMyBuilding() {
  return request<CityBuilding>("/city/me/building");
}

export function logout() {
  return request<{ message: string }>("/auth/logout", { method: "POST" });
}
