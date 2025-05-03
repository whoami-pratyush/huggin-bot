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
function stopValheimServer(process) {
  if (!process || process.killed) {
    console.error("No active RCON process");
    return;
  }
  setTimeout(() => {
    process.stdin.write("shutdown\n");
  }, 5000);

  console.log("Server Stopped successfully");
}

// Set up error handling
testProcess.on("error", (err) => {
  console.error("RCON error:", err);
});

// Set up output monitoring
testProcess.stdout.on("data", (data) => {
  console.log("RCON:", data.toString());
});
