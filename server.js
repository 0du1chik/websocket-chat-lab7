const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const messages = [
    { username: 'System', text: 'Ласкаво просимо до чату!', timestamp: new Date().toLocaleTimeString() }
];

console.log('WebSocket сервер запущено на ws://localhost:8080');

function broadcastMessages() {
    const payload = JSON.stringify({
        type: 'ALL_MESSAGES',
        data: messages
    });

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('Новий клієнт підключався');

    ws.send(JSON.stringify({
        type: 'ALL_MESSAGES',
        data: messages
    }));

    ws.on('message', (message) => {
        try {
            const parsed = JSON.parse(message);

            switch (parsed.action) {
                case 'ADD_MESSAGE':
                    if (parsed.username && parsed.text) {
                        const newMessage = {
                            username: parsed.username,
                            text: parsed.text,
                            timestamp: new Date().toLocaleTimeString()
                        };
                        messages.push(newMessage);
                        broadcastMessages();
                    }
                    break;

                case 'GET_MESSAGES':
                    ws.send(JSON.stringify({
                        type: 'ALL_MESSAGES',
                        data: messages
                    }));
                    break;

                default:
                    console.log('Невідома дія:', parsed.action);
            }
        } catch (error) {
            console.error('Помилка парсингу JSON:', error);
        }
    });

    ws.on('close', () => {
        console.log('Клієнт відключився');
    });
});