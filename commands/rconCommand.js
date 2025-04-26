const { spawn } = require("child_process");
const config = require("../configs/config.js");
const { log, error } = require("console");

function initializeRCON(rconProcess) {
  reconProcess = spawn("utils/recon.exe", [], {
    detached: true,
    windowsHide: true,
  });
  rconProcess.stdout.on("data", (chunk) => {
    console.log("[RCON]", chunk.toString().trim());
  });

  rconProcess.stderr.on("data", (chunk) => {
    console.error("[RCON ERROR]", chunk.toString().trim());
  });

  rconProcess.on("error", (err) => {
    console.error("[RCON FAILED TO START]", err);
  });

  return rconProcess;
}

function stopValheimServer(rconProcess, isServerRunning) {
  return new Promise((resolve, reject) => {
    rconProcess = spawn("utils\\rcon.exe", [], {
      windowsHide: true,
      detached: true,
    });
    rconProcess.stdout.on("data", (chunks) => {
      const rconLog = chunks.toString().trim();
      console.log(rconLog);
      resolve(true);
    });
    if (isServerRunning) {
      rconProcess.stdin.write("127.0.0.1:2458\n");
      rconProcess.stdin.write("ChangeMe\n");
      rconProcess.stdin.write("shutdown\n");
    }
    rconProcess.stderr.on("error", (err) => {
      console.log(err);
    });
  });
}

module.exports = { stopValheimServer };
