const { EmbedBuilder } = require('discord.js');
const QRCode = require('qrcode');

module.exports = {
    data: {
        name: 'qr',
        description: 'Membuat QR Code dari teks yang diberikan',
        options: [
            {
                name: 'text',
                type: 3,
                description: 'Teks untuk membuat QR Code',
                required: true
            }
        ]
    },
    run: async ({ interaction }) => {
        const text = interaction.options.getString('text');

        if(text.length > 1000) {
            return interaction.reply('❌Teks terlalu panjang! Maksimal 1000 karakter.')
        }

        try {
            const qrImage = await QRCode.toBuffer(text, {
                width: 1024,
                height: 1024,
                errorCorrectionLevel: 'H'
            });

            const embed = new EmbedBuilder()
                .setTitle('QR Code')
                .setDescription(`QR Code untuk: ${text}`)
                .setImage('attachment://qrcode.png');

            return interaction.reply({
                embeds: [embed],
                files: [{
                    attachment: qrImage,
                    name: 'qrcode.png'
                }]
            });

        } catch (err) {
            console.error(err);
            return interaction.reply('Terjadi kesalahan saat membuat QR Code.');
        }
    },
};