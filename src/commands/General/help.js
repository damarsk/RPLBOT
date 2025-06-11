const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'help',
        description: 'Menampilkan daftar perintah yang tersedia',
    },
    run: ({ interaction }) => {
        const embed = new EmbedBuilder()
            .setColor('Random')
            .setTitle('Daftar Perintah')
            .setDescription('Berikut adalah daftar perintah yang tersedia:')
            .addFields(
                { name: '`/ping`', value: 'Menampilkan latensi bot.' },
                { name: '`/quote`', value: 'Memberikan kutipan inspiratif.' },
                { name: '`/todo`', value: 'Mengelola daftar tugasmu.' },
                { name: '`/ai`', value: 'Menjawab pertanyaan dengan AI.' }
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
    options: {}
};