const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'about',
        description: 'Informasi tentang bot'
    },

    run: ({ interaction }) => {
        const ping = interaction.client.ws.ping;
    
        const uptime = interaction.client.uptime || 0;
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

        const embed = new EmbedBuilder()
            .setTitle('Tentang Bot')
            .setDescription('Bot ini dibuat untuk membantu pengguna dalam berbagai tugas.')
            .addFields(
                { name: 'Versi', value: '1.5.0', inline: true },
                { name: 'Pengembang', value: '[roto_gg](https://damar.cc)', inline: true },
                { name: 'Uptime', value: `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`, inline: true },
                { name: 'Latency', value: `\`${ping}ms\``, inline: true }
            )
            .setColor('Random')
            .setFooter({ text: `Requested By ${interaction.user.username}` })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    },

    options: {}
}