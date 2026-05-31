export const config = {
    port: Number(process.env.PORT || 3000),
    cppServiceHost: process.env.CPP_SERVICE_HOST || "127.0.0.1",
    cppServicePort: Number(process.env.CPP_SERVICE_PORT || 8080),
};
