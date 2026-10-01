const apiBaseUrl=process.env.NEXT_PUBLIC_API_URL??"http://localhost:8080";
export type ApiResult<T>={success:boolean;code?:string;message:string;data:T;errors:string[]};
function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
export class ApiClient {
  private csrfReady = false;
  private async request<T>(path: string, init: RequestInit = {}) {
    if (init.method && init.method !== "GET" && !this.csrfReady) {
      try {
        await fetch(`${apiBaseUrl}/api/auth/csrf`, { credentials: "include" });
      } catch {
        // ignore prefetch failure if offline/handled
      }
      this.csrfReady = true;
    }
    const token = getCookie("XSRF-TOKEN");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { "X-XSRF-TOKEN": token } : {}),
      ...((init.headers as Record<string, string>) ?? {}),
    };
    const response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers,
    });
    const body = (await response.json()) as ApiResult<T>;
    if (!response.ok) throw new Error(body.message);
    return body;
  }
  get<T>(p: string) { return this.request<T>(p); }
  post<T>(p: string, b?: unknown) { return this.request<T>(p, { method: "POST", body: JSON.stringify(b ?? {}) }); }
  put<T>(p: string, b: unknown) { return this.request<T>(p, { method: "PUT", body: JSON.stringify(b) }); }
  delete<T>(p: string) { return this.request<T>(p, { method: "DELETE" }); }
}
export const apiClient = new ApiClient();
