const {} = require("dotenv").config();

const config = {
  botToken: process.env.BOT_TOKEN,
  cleintID: process.env.CLIENT_ID,
  guildID: process.env.GUILD_ID,
  rconPath: process.env.RCON_PATH,
  serverPath: process.env.SERVER_PATH,
  playitPath: process.env.PLAYIT_PATH,
};

module.exports = config;