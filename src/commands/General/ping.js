const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ping',
        description: 'Replies with Pong'
    },
    run: ({ interaction }) => {
        const ping = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle('BOT LATENCY')
            .setDescription(`📶 **Discord REST Latency:** \`${ping}ms\``)
            .setColor('Random')
            .setFooter({ text: `Requested By ${interaction.user.username}` })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    },
    options: {
        // https://commandkit.js.org/typedef/CommandOptions
    }
}