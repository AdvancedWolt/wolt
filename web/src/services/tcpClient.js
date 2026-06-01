import net from 'net';
import tcpConfig from '../config/tcpConfig.js';

const config = new tcpConfig();

const HOST = config.getHost();
const PORT = config.getPort();

export function send(command) {
    return new Promise((resolve, reject) => {

        const client = new net.Socket();
        let response = '';

        client.connect(PORT, HOST, () => {
            client.write(command + '\n');
        });

        client.on('data', (data) => {
            response += data.toString();
        });

        client.on('close', () => {
            resolve(response.trim());
        });

        client.on('error', reject);
    });
}

// exported API
export const tcpClient = {

    // when creating user, no watched products yet
    createUser(userId) {
        return send('POST ${userId}');
    },

    addView(userId, productId) {
        return send(`PATCH ${userId} ${productId}`);
    },

    // multiple products. usage exmpaple: (await cppClient.addViews(5, [12, 13, 14, 20]);)
    addViews(userId, productIds) {
        const list = productIds.join(' ');
        return send(`PATCH ${userId} ${list}`);
    },

    removeView(userId, productId) {
        return send(`DELETE ${userId} ${productId}`)
    },

    // multiple products. usage exmpaple: (await cppClient.removeViews(5, [12, 13, 14, 20]);)
    removeViews(userId, productIds) {
        const list = productIds.join(' ');
        return send(`DELETE ${userId} ${list}`)
    },

    getRecommendations(userId, productId) {
        return send(`RECOMMEND ${userId} ${productId}`);
    }
};