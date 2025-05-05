const valheimServer = {
  isRunning: false,
  process: null,
};
const rconClient = {
  isRunning: false,
  process: null,
  cooldown: false,

};

module.exports = { valheimServer, rconClient };
