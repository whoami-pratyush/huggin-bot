const { spawn } = require('child_process');
const configs = require('../configs/config.js')

const test = null;

function startVahleimServer(serverProcess) {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('bash', ['./start_server_bepinex.sh'],
      {
        windowsHide:true,
        cwd: configs.serverPath,
        detached: true
      }
    );
    
    serverProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      reject(true);
    });
    
    serverProcess.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
    
    resolve(true);
  });
};

module.exports = {
  startVahleimServer
};