const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");
require("dotenv").config();

const commands = [
  {
    name: 'ping',
    description: 'Shows the bot Latency',
  },
  {
    name: 'add',
    description: 'Add two numbers together!',
    options: [
      {
        name: 'first_number', // Fixed name format to use underscore
        description: 'The first number to add',
        type: ApplicationCommandOptionType.Number,
        required: true // Added required field
      },
      {
        name: 'second_number', // Fixed name format to use underscore
        description: 'The second number to add',
        type: ApplicationCommandOptionType.Number,
        required: true // Added required field
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(process.env.BOT_CLIENT_ID, process.env.MAIN_GUILD_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.log(`There was an error: ${error}`);
  }
})();