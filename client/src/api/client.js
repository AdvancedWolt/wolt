// Single entry point for talking to the Exercise 3 server.
// Why: every request must attach the JWT and report errors the same way, so
// components never build URLs, set headers, or parse error bodies by hand.

const TOKEN_KEY = 'aw_token';

const request = async (method, path, body) => {
    const headers = { 'Content-Type': 'application/json' };

    // Attach the token (a JWT once EX4-2 lands) to every request automatically.
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    // 204 No Content (PATCH/DELETE) has no body to parse.
    const data = res.status === 204 ? null : await res.json().catch(() => null);

    if (!res.ok) {
        // Normalize every failure into one Error the UI can show directly.
        const message = (data && data.error) || `Request failed (${res.status})`;
        throw new Error(message);
    }

    return data;
};

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body);
export const apiPatch = (path, body) => request('PATCH', path, body);
export const apiDelete = (path) => request('DELETE', path);

export { TOKEN_KEY };
