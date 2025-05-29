const { EmbedBuilder } = require('discord.js');
const Todo = require('../../models/Todo');

/** @type {import('commandkit').CommandData}  */
module.exports = {
    data: {
        name: 'todo',
        description: 'Kelola daftar tugasmu',
        options: [
            {
                type: 1,
                name: 'add',
                description: 'Tambah tugas',
                options: [
                    {
                        type: 3,
                        name: 'task',
                        description: 'Isi tugas',
                        required: true
                    }
                ]
            },
            {
                type: 1,
                name: 'list',
                description: 'Lihat daftar tugas'
            },
            {
                type: 1,
                name: 'done',
                description: 'Tandai tugas selesai',
                options: [
                    {
                        type: 4,
                        name: 'index',
                        description: 'Nomor tugas',
                        required: true
                    }
                ]
            },
            {
                type: 1,
                name: 'remove',
                description: 'Hapus tugas',
                options: [
                    {
                        type: 4,
                        name: 'index',
                        description: 'Nomor tugas',
                        required: true
                    }
                ]
            }
        ]
    },

    /**
     * @param {import('commandkit').SlashCommandProps} param0 
     */
    run: async ({ interaction }) => {
        const userId = interaction.user.id;
        let todo = await Todo.findOne({ userId });
        if (!todo) {
            todo = new Todo({ userId, tasks: [] });
        }

        const sub = interaction.options.getSubcommand();

        if (sub === 'add') {
            const task = interaction.options.getString('task');
            todo.tasks.push({ text: task });
            await todo.save();
            return interaction.reply(`✅ Tugas ditambahkan: **${task}**`);
        }

        if (sub === 'list') {
            if (todo.tasks.length === 0) {
                return interaction.reply('Daftar tugasmu kosong!');
            }
            const embed = new EmbedBuilder()
                .setTitle('Daftar Tugasmu')
                .setColor('Random')
                .setDescription(
                    todo.tasks.map((t, i) =>
                        `${t.completed ? '✅' : '❌'} **${i + 1}.** ${t.text}`
                    ).join('\n')
                )
                .setFooter({ text: `Requested By ${interaction.user.username}` })
                .setTimestamp();
            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'done') {
            const idx = interaction.options.getInteger('index') - 1;
            if (idx < 0 || idx >= todo.tasks.length) {
                return interaction.reply('Nomor tugas tidak valid!');
            }
            todo.tasks[idx].completed = true;
            await todo.save();
            return interaction.reply(`Tugas nomor ${idx + 1} ditandai selesai!`);
        }

        if (sub === 'remove') {
            const idx = interaction.options.getInteger('index') - 1;
            if (idx < 0 || idx >= todo.tasks.length) {
                return interaction.reply('Nomor tugas tidak valid!');
            }
            const removed = todo.tasks.splice(idx, 1);
            await todo.save();
            return interaction.reply(`Tugas dihapus: **${removed[0].text}**`);
        }
    },

    /** @type {import('commandkit').CommandOptions} */
    options: {
        
    }
};