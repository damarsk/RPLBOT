const { EmbedBuilder } = require('discord.js');

module.exports = {
    /** @type {import('commandkit').CommandData}  */
    data: {
        name: 'ping',
        description: 'Replies with Pong'
    },

    /**
     * @param {import('commandkit').SlashCommandProps} param0 
     */
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

    /** @type {import('commandkit').CommandOptions} */
    options: {
        // https://commandkit.js.org/typedef/CommandOptions
    }
}