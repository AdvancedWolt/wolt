import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development the React app runs on Vite's dev server while the API runs
// on the Express server (port 3000). This proxy forwards /api calls there, so
// the client uses relative paths and avoids CORS. In production the Express
// server serves the built app, so /api is already same-origin.
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'http://localhost:3000',
        },
    },
});
