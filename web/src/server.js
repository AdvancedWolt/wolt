import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
    console.log(`AdvancedWolt web server listening on port ${config.port}`);
});
