export default class tcpConfig {
    constructor() {
        this.host = process.env.CPP_SERVICE_HOST || 'cpp-service';
        this.port = process.env.CPP_SERVICE_PORT || 8080;
    }

    getHost() {
        return this.host;
    }

    getPort() {
        return this.port;
    }
}