import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the React app and the API run on different ports, so /api is
// proxied to the Express server. In production the server serves the built
// app, so /api is already same-origin.
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': process.env.VITE_API_URL || 'http://localhost:3000',
        },
    },
});
