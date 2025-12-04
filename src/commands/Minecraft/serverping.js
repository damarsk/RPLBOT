const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

let interval = null;
let lastMessage = null;

module.exports = {
    data: {
        name: 'serv-stats',
        description: 'Toggle status server tiap 1 menit'
    },

    run: async ({ interaction, client }) => {
        const SERVER_ADDRESS = "YOUR_IP_ADDRESS";
        const url = `https://api.mcstatus.io/v2/status/java/${SERVER_ADDRESS}`;
        const channelId = "YOUR_CHANNEL_ID_DISCORD";
        const channel = client.channels.cache.get(channelId);
        const ALLOWED_USER_IDS = ['YOUR_ID'];
    
        if (!ALLOWED_USER_IDS.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Kamu tidak diizinkan menggunakan command ini!',
                ephemeral: true
            });
        }

        if (!channel)
            return interaction.reply('❌ Channel tidak ditemukan');

        if (interval) {
            clearInterval(interval);
            interval = null;
            lastMessage = null;
            return interaction.reply('🔴 Status loop dimatikan');
        }

        await interaction.reply('✅ Status loop diaktifkan. Mengirim status pertama...');

        const sendStatus = async () => {
            try {
                const res = await axios.get(url);
                const data = res.data;

                const timestamp = Date.now();
                const widgetUrl = `https://api.mcstatus.io/v2/widget/java/${SERVER_ADDRESS}?t=${timestamp}`;

                const embed = new EmbedBuilder()
                    .setColor(data.online ? '#00ff88' : '#ff4444')
                    .setTitle('🖥️ Minecraft Server Status')
                    .setDescription(`**IP: ${SERVER_ADDRESS}**`)
                    .setTimestamp()
                    .setImage(widgetUrl);

                const files = [];

                if (!data.online) {
                    embed.addFields(
                        { name: '📡 Status', value: '```diff\n- OFFLINE\n```', inline: false }
                    );
                } else {
                    const playerList = data.players?.list?.slice(0, 5).map(p => p.name_clean).join(', ') || 'Tidak ada pemain';
                    const hasMorePlayers = data.players?.online > 5;
                    
                    embed.addFields(
                        { name: '📡 Status', value: '```diff\n+ ONLINE\n```', inline: true },
                        { name: '🎮 Versi', value: `\`${data.version?.name_clean ?? 'Unknown'}\``, inline: true },
                        { name: '👥 Pemain', value: `\`${data.players?.online ?? 0}/${data.players?.max ?? '?'}\``, inline: true },
                        { name: '🕒 Ping', value: `\`${data.latency ?? 20}+ms\``, inline: true },
                        { name: '🌐 IP Address', value: `\`${data.ip_address ?? "-"}\``, inline: true },
                        { name: '🔌 Port', value: `\`${data.port ?? "-"}\``, inline: true }
                    );

                    if (data.players?.online > -1) {
                        embed.addFields({
                            name: '👤 Pemain Online',
                            value: `${playerList}${hasMorePlayers ? ` *+${data.players.online - 5} lainnya*` : ''}`,
                            inline: false
                        });
                    }

                    if (data.motd?.clean) {
                        embed.addFields({
                            name: '📝 MOTD',
                            value: `\`\`\`${data.motd.clean}\`\`\``,
                            inline: false
                        });
                    }

                    const icon = data.icon;
                    if (icon) {
                        if (icon.startsWith('data:image')) {
                            const base64Data = icon.split(',')[1];
                            const buffer = Buffer.from(base64Data, 'base64');
                            const fileName = 'server-icon.png';
                            embed.setThumbnail(`attachment://${fileName}`);
                            files.push({ attachment: buffer, name: fileName });
                        } else if (icon.startsWith('http://') || icon.startsWith('https://')) {
                            embed.setThumbnail(icon);
                        }
                    }
                }

                embed.setFooter({ text: '🔄 Update otomatis setiap 1 menit' });

                if (lastMessage) {
                    try {
                        await lastMessage.edit({ embeds: [embed], files });
                    } catch (err) {
                        lastMessage = await channel.send({ embeds: [embed], files });
                    }
                } else {
                    lastMessage = await channel.send({ embeds: [embed], files });
                }

            } catch (err) {
                console.error('Error mengirim status:', err.message);
            }
        };

        sendStatus();
        interval = setInterval(sendStatus, 60_000);
    },

    options: {}
};