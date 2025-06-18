const { EmbedBuilder } = require('discord.js');
const bwipjs = require('bwip-js');

module.exports = {
    data: {
        name: 'barcode',
        description: 'Membuat Barcode dari teks yang diberikan',
        options: [
            {
                name: 'text',
                type: 3,
                description: 'Teks untuk membuat Barcode',
                required: true
            }
        ]
    },
    run: async ({ interaction }) => {
        const text = interaction.options.getString('text');

        if (text.length > 20) {
            return interaction.reply({
                content: '❌ Teks terlalu panjang! Maksimal 20 karakter.',
                ephemeral: false
            });
        }

        try {
            const barcodeImage = await bwipjs.toBuffer({
                bcid: 'code128',
                text: text,
                scale: 3,
                height: 10,
                includetext: true
            });

            const embed = new EmbedBuilder()
                .setTitle('Barcode')
                .setDescription(`Barcode untuk: ${text}`)
                .setImage('attachment://barcode.png');

            return interaction.reply({
                embeds: [embed],
                files: [{
                    attachment: barcodeImage,
                    name: 'barcode.png'
                }]
            });
        } catch (err) {
            console.error(err);
            return interaction.reply('Terjadi kesalahan saat membuat Barcode.');
        }
    },
};