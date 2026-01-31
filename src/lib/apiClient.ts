export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string> || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!headers['Content-Type'] && opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, { ...opts, headers, credentials: 'same-origin' });
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    let err: any = new Error('Request failed');
    try {
      if (contentType.includes('application/json')) {
        const body = await res.json();
        err.message = body.error || JSON.stringify(body);
      } else {
        err.message = await res.text();
      }
    } catch (e) {}
    err.status = res.status;
    throw err;
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}
