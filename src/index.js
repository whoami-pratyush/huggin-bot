const { Client, IntentsBitField, REST } = require("discord.js");
const config = require("../configs/config.js");
const { startVahleimServer } = require("../commands/startValheimServer.js");
// const {stopValheimServer} = require('../commands/rconCommand.js')

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
  startVahleimServer(serverState.process);
});

client.login(config.botToken).catch((err) => {
  console.log(`Failed to login: ${err}`);
});
