const { spawn } = require("child_process");
let testProcess = null;

// Initialize RCON connection
function initializeRCON() {
  return spawn("./rcon", [], {
    cwd: "utils",
    stdio: ["pipe", "pipe", "pipe"], // Full control of all streams
    windowsHide: true,
  });
}

// Stop server using RCON
function stopValheimServer(process, interaction) {
    // Check if process is valid and not already killed
    if (!process || process.killed) {
      console.error("No active RCON process");
      interaction.editReply("The server is not running, so it cannot be stopped.");
      return;
    }
  
    // Inform the user that we are sending the shutdown command
    interaction.editReply("Attempting to stop the server...");
  
    // Send shutdown command after a short delay
    setTimeout(() => {
      process.stdin.write("shutdown\n");
    }, 5000);
  
    // Confirm the server stop action to the user
    console.log("Server shutdown command sent");
    interaction.followUp("Server stopped successfully.");
  }
  
  // Set up error handling
  process.on("error", (err) => {
    console.error("RCON error:", err);
    interaction.followUp(`An error occurred while trying to stop the server: ${err.message}`);
  });
  
  // Set up output monitoring
  process.stdout.on("data", (data) => {
    console.log("RCON:", data.toString());
    // Optionally, send the output to Discord
    interaction.followUp(`RCON Output: ${data.toString()}`);
  });
  
  module.exports = {
    stopValheimServer
  };
  