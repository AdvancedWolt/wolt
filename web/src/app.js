import express from "express";

import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
    const app = express();
    app.use(express.json());

    app.use((req, res) => {
        res.status(404).json({ error: "Route not found" });
    });

    app.use(errorHandler);
    return app;
}

export const app = createApp();
