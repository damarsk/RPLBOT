const aichat = require('../../commands/General/aichat');

module.exports = (client) => {
    client.on('messageCreate', (message) => {
        if (typeof aichat.onMessage === 'function') {
            aichat.onMessage(message);
        }
    });
}