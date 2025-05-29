require('dotenv/config');

const { Client, IntentsBitField } = require('discord.js');
const { CommandKit } = require('commandkit');
const aichat = require('./commands/General/aichat');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

client.on('messageCreate', (message) => {
    if (typeof aichat.onMessage === 'function') {
        aichat.onMessage(message);
    }
});

new CommandKit({
    client,
    eventsPath: `${__dirname}/events`,
    commandsPath: `${__dirname}/commands`
});

client.login(process.env.TOKEN);