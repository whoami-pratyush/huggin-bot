const { exec } = require('child_process');
const { error } = require('console');

function checkServerStatus() {
    return new Promise((resolve) => {
        exec('pidof valheim_server.x86_64', (error, stdout) => {
            resolve(!error);
        });
    });
}

module.exports = {
    checkServerStatus,
}