const { spawn } = require("child_process");
const config = require("../configs/config.js");
const { stdout } = require("process");
const { error } = require("console");

function startValheimServer(serverProcess, isServerRunning) {
  return new Promise((resolve, reject) => {
    serverProcess = spawn("cmd.exe", ["/c", "start_headless_server.bat"], {
      cwd: config.serverPath,
      windowsHide: true,
    });
    serverProcess.stdout.on("data", (chunk) => {
      const serverLogs = chunk.toString().trim();
      console.log(serverLogs);
      if(serverLogs.includes('Am I Host? True')){
        resolve(true);
        isServerRunning = true;
      }
    });
    serverProcess.stderr.on("error",(chunk) =>{
      const serverErrorLogs = chunk.toString().trim();
      console.error(serverErrorLogs);
      reject(error);

    })
  });
}

module.exports = { startValheimServer };
