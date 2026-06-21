const net = require('net');
const tcpConfig = require('../config/tcpConfig');

const config = new tcpConfig();

const HOST = config.getHost();
const PORT = config.getPort();

function send(command) {
    return new Promise((resolve, reject) => {

        const client = new net.Socket();
        let settled = false;

        client.connect(PORT, HOST, () => {
            client.write(command + '\n');
        });

        client.on('data', (data) => {
            if (settled) return;
            settled = true;
            resolve(data.toString().trim());
            client.end();
        });

        client.on('close', () => {
            if (!settled) {
                settled = true;
                resolve('');
            }
        });

        client.on('error', (err) => {
            if (!settled) {
                settled = true;
                reject(err);
            }
        });
    });
}

// exported API
const tcpClient = {
    
    createUser(userId, productId) {
        return send(`POST ${userId} ${productId}`);
    },

    addView(userId, productId) {
        return send(`PATCH ${userId} ${productId}`);
    },

    // Records several product views in one command.
    addViews(userId, productIds) {
        const list = productIds.join(' ');
        return send(`PATCH ${userId} ${list}`);
    },

    removeView(userId, productId) {
        return send(`DELETE ${userId} ${productId}`)
    },

    // Removes several product views in one command.
    removeViews(userId, productIds) {
        const list = productIds.join(' ');
        return send(`DELETE ${userId} ${list}`)
    },

    getRecommendations(userId, productId) {
        return send(`GET ${userId} ${productId}`);
    }
};

module.exports = { tcpClient };
