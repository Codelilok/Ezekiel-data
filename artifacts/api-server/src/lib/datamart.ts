const BASE_URL = "https://api.datamartgh.shop";

function getApiKey(): string {
  const key = process.env["DATAMART_API_KEY"];
  if (!key) {
    throw new Error("DATAMART_API_KEY environment variable is not set");
  }
  return key;
}

export async function datamartFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw Object.assign(
      new Error(`Datamart API error ${res.status}: ${res.statusText}`),
      { status: res.status, body },
    );
  }

  return res.json() as Promise<T>;
}
