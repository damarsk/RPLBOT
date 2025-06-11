const { EmbedBuilder } = require('discord.js');
const quoteAPI = require('quote-indo');

module.exports = {
    data: {
        name: 'quote',
        description: 'Memberi kutipan inspiratif',
    },
    
    run: async ({ interaction }) => {
        try {
            const quote = await quoteAPI.Quotes('kehidupan');

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle('Kutipan Inspiratif')
                .setDescription(`"${quote}"`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('❌ Error')
                .setDescription('Terjadi kesalahan saat mengambil quotes.');

            console.error(err);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    /** @type {import('commandkit').CommandOptions} */
    options: {}
};