const { Client, IntentsBitField, REST, Collection, Events } = require("discord.js");
const config = require("../configs/config.js");
const fs = require('fs');
const path = require('node:path')
const{setCommands} = require('../utils/commandHandler.js')
const{registerCommands} = require('../utils/commandRegister.js')

const client = new Client({
  intents: [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers,
  ],
});

client.on("ready", () => {
  console.log(`Logged in successfully as ${client.user.tag}`);
});

client.commands = new Collection()


const commandsPath = path.join(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

setCommands(client,commandFiles,commandsPath);
registerCommands(commandFiles, commandsPath);

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});
client.login(config.botToken).catch((err) => {
  console.log(`Failed to login: ${err}`);
});