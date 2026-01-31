export async function invokeFunction(name: string, body?: any) {
  try {
    const path = {
      "verify-payment": "/api/functions/verify-payment",
      "send-email": "/api/functions/send-email",
      "check-connections": "/api/functions/check-connections",
    }[name];

    if (!path) throw new Error(`Unknown function: ${name}`);

    const opts: RequestInit = {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    };

    const resp = await fetch(path, opts);
    const json = await resp.json().catch(() => ({}));
    return { data: json, error: json?.error || (resp.ok ? null : new Error('Request failed')) };
  } catch (err: any) {
    return { data: null, error: err };
  }
}