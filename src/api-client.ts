const DEFAULT_API_URL = "http://104.156.246.8:3100";

export function getApiUrl(): string {
  return process.env.HUB_ORACLE_API_URL || DEFAULT_API_URL;
}

export function getApiKey(): string | null {
  return process.env.HUB_ORACLE_API_KEY || null;
}

async function request(method: string, path: string, body?: unknown): Promise<any> {
  const apiUrl = getApiUrl();
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("HUB_ORACLE_API_KEY environment variable is required");
  }

  const url = `${apiUrl}${path}`;
  const headers: Record<string, string> = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function query(sql: string, schema: string) {
  return request("POST", "/api/query", { sql, schema });
}

export async function listSchemas() {
  return request("GET", "/api/schemas");
}

export async function listTables(schema: string) {
  return request("GET", `/api/tables/${schema}`);
}

export async function describeTable(schema: string, table: string) {
  return request("GET", `/api/describe/${schema}/${table}`);
}

export async function getApprovalStatus(id: string) {
  return request("GET", `/api/approval/${id}`);
}

export async function healthCheck() {
  const apiUrl = getApiUrl();
  const response = await fetch(`${apiUrl}/api/health`);
  return response.json();
}
