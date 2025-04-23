const { exec, execFile } = require('child_process');
const readline = require('readline');
const path = require('path');  // Add this line to import the path module


let serverProcess;


function startServer() {
    const serverPath = 'C:/Program Files (x86)/Steam/steamapps/common/Valheim dedicated server';
    const batPath = path.join(serverPath, 'start_headless_server.bat');
    const playitPath = 'C:/Program Files/playit_gg/bin/playit.exe';
  
    serverProcess = exec(`"${batPath}"`, { cwd: serverPath });
    portForward = execFile(playitPath)
  
    serverProcess.stdout.on('data', (data) => {
      console.log(data);
      // You can also send this to Discord channel if needed
    });
  
    serverProcess.stderr.on('data', (data) => {
      console.error(data);
    });
  
    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      serverProcess = null;
    });
  }

startServer()