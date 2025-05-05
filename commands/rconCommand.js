const { spawn } = require("child_process");
const { SlashCommandBuilder } = require('discord.js');
const { rconClient, valheimServer } = require('../configs/serverStates');
const { checkServerStatus } = require('./checkServer');
// Initialize RCON connection
function initializeRCON() {
  return spawn("./rcon", [], {
    cwd: "utils",
    stdio: ["pipe", "pipe", "pipe"], // Full control of all streams
    windowsHide: true,
  });
}
// Stop server using RCON
async function stopValheimServer(process, interaction) {
    return new Promise((resolve, reject) => {
        // Check if process is valid and not already killed
        if (!process || process.killed) {
            process = initializeRCON()
        }

        // Set up error handling
        process.on("error", (err) => {
            console.error("RCON process error:", err);
            reject(err);
        });

        // Set up output monitoring
        process.stdout.on("data", (data) => {
            console.log("RCON output:", data.toString());
        });

        // Send shutdown command
        try {
            process.stdin.write("shutdown\n");
            setTimeout(() => {
                resolve(true);
            }, 5000); // Give server time to process shutdown
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop-server')
        .setDescription('Stops the running Valheim server'),

    async execute(interaction) {
        try {
            // Defer the reply immediately
            await interaction.deferReply();

            // Check server status first
            const isRunning = await checkServerStatus();
            console.log(rconClient.cooldown)
            
            if (!isRunning || rconClient.cooldown) {
                await interaction.editReply("The server is not currently running.");
                return;
            }

            // Attempt to stop the server
            await interaction.editReply("Attempting to stop the server...");
            await stopValheimServer(rconClient.process, interaction);

            // Update server state
            valheimServer.process = null;
            valheimServer.isRunning = false;

            // Confirm successful shutdown
            await interaction.editReply("Server has been stopped successfully.");
            
        } catch (err) {
            console.error("Error stopping the server:", err);
            
            try {
                await interaction.editReply({
                    content: `An error occurred while trying to stop the server: ${err.message}`,
                    ephemeral: true
                });
            } catch (editError) {
                console.error("Failed to send error reply:", editError);
                await interaction.followUp({
                    content: `An error occurred: ${err.message}`,
                    ephemeral: true
                });
            }
        }
    }
};