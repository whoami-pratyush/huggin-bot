const { SlashCommandBuilder } = require("discord.js");
const { startValheimServer } = require("./startValheimServer"); // fixed typo in function name
const { valheimServer } = require("../configs/serverStates.js");
const { checkServerStatus } = require("./checkServer.js");
const {stopValheimServer} = require("./rconCommand.js")

module.exports = {
  start: new SlashCommandBuilder()
    .setName("StartServer")
    .setDescription("Starts the server if the Host Machine is online"),

  async execute(interaction) {
    await interaction.reply(
      "Starting the server, it might take a few minutes..."
    );

    valheimServer.isRunning = await checkServerStatus();

    if (valheimServer.isRunning) {
      await interaction.editReply("Server is already running.");
      return;
    }

    try {
      await startValheimServer(interaction);
    } catch (err) {
      console.error("Failed to start server:", err);
      await interaction.editReply("Failed to start server.");
      return;
    }

    // Optional: re-check status after attempting to start
    valheimServer.isRunning = await checkServerStatus();
  },

  stop: new SlashCommandBuilder()
  .setName('StopServer')
  .setDescription('Stops the running Valheim server'),

async execute(interaction) {
  // Check if the server is running (process exists)
  if (valheimServer.process !== null) {
    try {
      await stopValheimServer(valheimServer.process, interaction);
      // After stopping, reset the state
      valheimServer.process = null;
      valheimServer.isRunning = await checkServerStatus();
      await interaction.editReply("Server has been stopped successfully.");
    } catch (err) {
      console.error("Error stopping the server:", err);
      await interaction.editReply("An error occurred while trying to stop the server.");
    }
  } else {
    // If the server is not running
    await interaction.editReply("The server is not currently running.");
  }
},
};
