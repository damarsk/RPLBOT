const { Client, IntentsBitField } = require("discord.js");
require('dotenv').config();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', (bot) => {
    console.log(`✅ ${bot.user.tag} is online!`);
    client.user.setActivity({
        name: "for /help",
        type: 3,
    }); 
    client.user.setStatus('dnd');
});

client.on('interactionCreate', (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        interaction.reply(`Hello, ${interaction.user.username} \nBot Latency: ${Date.now() - interaction.createdTimestamp}ms`);
    }

    if (interaction.commandName === 'add') {
        const num1 = interaction.options.get('first_number')?.value;
        const num2 = interaction.options.get('second_number')?.value;

        interaction.reply(`The sum is ${num1 + num2}`);
    }
});

client.login(process.env.BOT_TOKEN);
