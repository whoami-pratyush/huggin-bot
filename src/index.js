const { Client, IntentsBitField, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { spawn, exec } = require('child_process');
const path = require('path');
require('dotenv').config();

// Configuration
const config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  serverPath: 'C:/Program Files (x86)/Steam/steamapps/common/Valheim dedicated server',
  playitPath: 'C:/Program Files/playit_gg/bin/playit.exe'
};

// Process tracking
let serverRunning = false;
let serverProcess = null;
let playitProcess = null;

// Discord Client Setup
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Command Definitions
const commands = [
  new SlashCommandBuilder()
    .setName('startserver')
    .setDescription('Start the Valheim server'),
  new SlashCommandBuilder()
    .setName('stopserver')
    .setDescription('Stop the Valheim server'),
  new SlashCommandBuilder()
    .setName('restartserver')
    .setDescription('Restart the Valheim server'),
  new SlashCommandBuilder()
    .setName('serverstatus')
    .setDescription('Check server status')
].map(cmd => cmd.toJSON());

// Register Commands
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('Successfully registered commands!');
  } catch (error) {
    console.error('Command registration failed:', error);
  }
}

// Start Valheim Server
function startValheimServer() {
  return new Promise((resolve, reject) => {
    // We’ll let cmd.exe do the heavy lifting, quoting is automatic here:
    serverProcess = spawn(
      'cmd.exe',
      ['/c', 'start_headless_server.bat'],
      {
        cwd: config.serverPath,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    serverProcess.stdout.on('data', chunk => {
      const text = chunk.toString();
      console.log('[Valheim]', text.trim());
      if (text.includes('Am I Host')) {
        serverRunning = true;
        resolve(true);
      }
    });

    serverProcess.stderr.on('data', chunk => {
      console.error('[Valheim Error]', chunk.toString().trim());
    });

    serverProcess.on('error', err => {
      reject(err);
    });

    serverProcess.on('close', code => {
      serverRunning = false;
      serverProcess = null;
      // If we never hit the ready state, fail the promise
      reject(new Error(`Server exited (code ${code}) before ready`));
    });
  });
}

function startPlayitTunnel() {
    playitProcess = spawn(config.playitPath, [], {
      windowsHide: true,
      detached: true
    });
  
    playitProcess.on('close', code => {
      console.log(`Playit tunnel exited with code ${code}`);
      playitProcess = null;
    });
  }

// Stop Server
async function stopServer(interaction) {
  return new Promise((resolve) => {
    exec('taskkill /f /im valheim_server.exe', (error) => {
      if (error) {
        console.error('Error killing server:', error);
        interaction.editReply('Failed to stop server. Is it running?');
        resolve(false);
        return;
      }

      console.log('Server stopped successfully');
      serverRunning = false;
      serverProcess = null;
      
      // Kill playit tunnel
      exec('taskkill /f /im playit.exe', (err) => {
        if (err) console.error('Error killing playit:', err);
        playitProcess = null;
      });

      interaction.editReply('Server has been stopped!');
      resolve(true);
    });
  });
}

function stopServerWithSigint(interaction) {
    return new Promise((resolve, reject) => {
      if (!serverProcess) {
        interaction.editReply('Server is not running.');
        return resolve(false);
      }
  
      // Request a Ctrl‑C
      try {
        console.log("TEST")
        serverProcess.kill('SIGTERM');


      } catch (err) {
        return reject(err);
      }
  
      serverProcess.once('close', code => {
        console.log(`Valheim server closed (SIGINT) with code ${code}`);
        serverRunning = false;
        serverProcess = null;
  
        // Tear down playit tunnel
        if (playitProcess) {
          playitProcess.kill();
          playitProcess = null;
        } 
  
        interaction.editReply('Server stopped (graceful Ctrl‑C).');
        resolve(true);
      });
    });
  }

  function stopServerGraceful(interaction) {
    return new Promise((resolve, reject) => {
      if (!serverProcess) {
        interaction.editReply('Server is not running.');
        return resolve(false);
      }
  
      // Send the console command that tells Valheim to save + exit
      serverProcess.stdin.write('exit\r\n');
  
      // Wait for the server process to actually close
      serverProcess.once('close', code => {
        console.log(`Valheim server exited with code ${code}`);
        serverRunning = false;
        serverProcess = null;
  
        // Now kill the playit tunnel
        if (playitProcess) {
          playitProcess.kill();
          playitProcess = null;
        }
  
        interaction.editReply('Server stopped gracefully and world saved.');
        resolve(true);
      });
  
      // If something goes wrong with the process itself
      serverProcess.once('error', err => {
        console.error('Error shutting down server:', err);
        reject(err);
      });
    });
  }

// Command Handlers
async function handleStartCommand(interaction) {
  if (serverRunning) {
    return await interaction.editReply('Server is already running!');
  }

  try {
    await interaction.editReply('Starting server... This may take a few minutes.');
    await startValheimServer();
    startPlayitTunnel();
    await interaction.editReply('Server started successfully!');
  } catch (error) {
    console.error('Start server error:', error);
    await interaction.editReply(`Failed to start server: ${error.message}`);
  }
}

async function handleStopCommand(interaction) {
  if (!serverRunning) {
    return await interaction.editReply('Server is not currently running');
  }

  try {
    await interaction.editReply('Stopping server...');
    await stopServerWithSigint(interaction);
  } catch (error) {
    console.error('Stop server error:', error);
    await interaction.editReply(`Error stopping server: ${error.message}`);
  }
}

// Client Events
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  registerCommands();
  checkServerStatus();
  setInterval(checkServerStatus, 300000); // Check every 5 minutes
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await interaction.deferReply({ ephemeral: true });

    switch (interaction.commandName) {
      case 'startserver':
        await handleStartCommand(interaction);
        break;
      case 'stopserver':
        await handleStopCommand(interaction);
        break;
      case 'restartserver':
        if (serverRunning) {
          await handleStopCommand(interaction);
          await new Promise(resolve => setTimeout(resolve, 5000));
          await handleStartCommand(interaction);
        } else {
          await handleStartCommand(interaction);
        }
        break;
      case 'serverstatus':
        await interaction.editReply(serverRunning ? '🟢 Server is running' : '🔴 Server is stopped');
        break;
      default:
        await interaction.editReply('Unknown command');
    }
  } catch (error) {
    console.error('Interaction error:', error);
    await interaction.editReply('An error occurred while processing your command');
  }
});

// Check Server Status
function checkServerStatus() {
  exec('tasklist /fi "imagename eq valheim_server.exe"', (error, stdout) => {
    if (!error) {
      serverRunning = stdout.toLowerCase().includes('valheim_server.exe');
    }
  });
}

// Cleanup
function cleanup() {
  if (serverProcess) serverProcess.kill();
  if (playitProcess) playitProcess.kill();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Start Bot
client.login(config.token).catch(err => {
  console.error('Login failed:', err);
  process.exit(1);
});