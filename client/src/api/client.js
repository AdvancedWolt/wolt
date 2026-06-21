const TOKEN_KEY = 'aw_token';

// All HTTP goes through here so the auth token is attached and failures are
// reported the same way for every call in the app.
const request = async (method, path, body) => {
    const headers = { 'Content-Type': 'application/json' };

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    // 204 responses (e.g. PATCH/DELETE) carry no body to parse.
    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error((data && data.error) || `Request failed (${res.status})`);
    }

    return data;
};

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiDelete = (path) => request('DELETE', path);

export { TOKEN_KEY };
