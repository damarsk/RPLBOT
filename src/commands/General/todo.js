const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./src/database/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected successfully!');
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS todos (
        userId TEXT PRIMARY KEY,
        tasks TEXT
    )
`);

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
                name: 'edit',
                description: 'Edit tugas',
                options: [
                    {
                        type: 4,
                        name: 'index',
                        description: 'Nomor tugas',
                        required: true
                    },
                    {
                        type: 3,
                        name: 'newtask',
                        description: 'Isi tugas baru',
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

    run: async ({ interaction }) => {
        const userId = interaction.user.id;

        db.get('SELECT tasks FROM todos WHERE userId = ?', [userId], (err, row) => {
            if (err) {
                console.error('Error fetching tasks:', err);
                return interaction.reply('Terjadi kesalahan saat mengambil tugas.');
            }

            let tasks = row ? JSON.parse(row.tasks) : [];

            const sub = interaction.options.getSubcommand();

            if (sub === 'add') {
                const task = interaction.options.getString('task');
                tasks.push({ text: task, completed: false });

                db.run('INSERT OR REPLACE INTO todos (userId, tasks) VALUES (?, ?)', [userId, JSON.stringify(tasks)], (err) => {
                    if (err) {
                        console.error('Error saving task:', err);
                        return interaction.reply('Terjadi kesalahan saat menyimpan tugas.');
                    }
                    return interaction.reply(`✅ Tugas ditambahkan: **${task}**`);
                });
            }

            if (sub === 'list') {
                if (tasks.length === 0) {
                    return interaction.reply('Daftar tugasmu kosong!');
                }
                const embed = new EmbedBuilder()
                    .setTitle('Daftar Tugasmu')
                    .setColor('Random')
                    .setDescription(
                        tasks.map((t, i) =>
                            `${t.completed ? '✅' : '❌'} **${i + 1}.** ${t.text}`
                        ).join('\n')
                    )
                    .setFooter({ text: `Requested By ${interaction.user.username}` })
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }

            if (sub === 'done') {
                const idx = interaction.options.getInteger('index') - 1;
                if (idx < 0 || idx >= tasks.length) {
                    return interaction.reply('Nomor tugas tidak valid!');
                }
                tasks[idx].completed = true;

                db.run('UPDATE todos SET tasks = ? WHERE userId = ?', [JSON.stringify(tasks), userId], (err) => {
                    if (err) {
                        console.error('Error updating task:', err);
                        return interaction.reply('Terjadi kesalahan saat menandai tugas selesai.');
                    }
                    return interaction.reply(`Tugas nomor ${idx + 1} ditandai selesai!`);
                });
            }

            if (sub === 'edit') {
                const idx = interaction.options.getInteger('index') - 1;
                const newTask = interaction.options.getString('newtask');

                if (idx < 0 || idx >= tasks.length) {
                    return interaction.reply('Nomor tugas tidak valid!');
                }

                tasks[idx].text = newTask;

                db.run('UPDATE todos SET tasks = ? WHERE userId = ?', [JSON.stringify(tasks), userId], (err) => {
                    if (err) {
                        console.error('Error updating task:', err);
                        return interaction.reply('Terjadi kesalahan saat mengedit tugas.');
                    }
                    return interaction.reply(`Tugas nomor ${idx + 1} berhasil diubah menjadi: "**${newTask}**"`);
                });
            }

            if (sub === 'remove') {
                const idx = interaction.options.getInteger('index') - 1;
                if (idx < 0 || idx >= tasks.length) {
                    return interaction.reply('Nomor tugas tidak valid!');
                }
                const removed = tasks.splice(idx, 1);

                db.run('UPDATE todos SET tasks = ? WHERE userId = ?', [JSON.stringify(tasks), userId], (err) => {
                    if (err) {
                        console.error('Error removing task:', err);
                        return interaction.reply('Terjadi kesalahan saat menghapus tugas.');
                    }
                    return interaction.reply(`Tugas dihapus: **${removed[0].text}**`);
                });
            }
        });
    },

    options: {}
};
