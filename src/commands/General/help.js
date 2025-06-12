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
                { name: '`/ai`', value: 'Menjawab pertanyaan dengan AI.' },
                { name: '`/todo`', value: 'Mengelola daftar tugasmu.' },
                { name: '`/quote`', value: 'Memberikan kutipan inspiratif.' },
                { name: '`/about`', value: 'Informasi tentang bot.' },
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
    options: {}
};