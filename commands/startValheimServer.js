const { spawn } = require('child_process');
const configs = require('../configs/config.js');
const{SlashCommandBuilder} = require('discord.js')
const{valheimServer, rconClient} = require('../configs/serverStates.js')
const {checkServerStatus} = require ('./checkServer')


function startValheimServer(interaction) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('bash', ['./start_server_bepinex.sh'], {
      windowsHide: true,
      cwd: configs.serverPath,
      detached: true,
    });
  rconClient.cooldown = true;
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`stdout: ${output}`);
      
      if (output.includes('Opened Steam server')) {
        interaction.editReply('Server is on');
        rconClient.cooldown =false;
        resolve(true);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(new Error(`Server error: ${data.toString()}`));
    });

    serverProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("start-server")
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
};
