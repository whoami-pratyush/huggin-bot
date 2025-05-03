const { spawn } = require('child_process');
const configs = require('../configs/config.js');

function startValheimServer(interaction) {
  return new Promise((resolve, reject) => {
    const serverProcess = spawn('bash', ['./start_server_bepinex.sh'], {
      windowsHide: true,
      cwd: configs.serverPath,
      detached: true,
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`stdout: ${output}`);
      if (output.includes('Am I Host')) {
        interaction.editReply('Server is on');
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
  startValheimServer,
};
