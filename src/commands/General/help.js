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
                { name: '`/about`', value: 'Informasi tentang bot.' },
                { name: '`/barcode`', value: "Generate Barcode." },
                { name: '`/quote`', value: 'Memberikan kutipan inspiratif.' },
                { name: '`/qr`', value: "Generate QRCode." },
                { name: '`/todo`', value: 'Mengelola daftar tugasmu.' },
            )
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
    options: {}
};