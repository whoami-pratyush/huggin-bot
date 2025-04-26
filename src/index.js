const { Client, IntentsBitField, REST } = require("discord.js");
const config = require("../configs/config.js");
const {startValheimServer} = require('../commands/startValheimServer.js')
const {stopValheimServer} = require('../commands/rconCommand.js')

//Process Tracking

const serverState = {
    running: false,
    process: null,
};
const rconState = {
    running: false,
    process: null,
};
const playitState= {
    running : false,
    process : null,
};
//Client Permission

const client = new Client(
{intents : [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMembers
  ]}
);

client.on('ready',()=>{
    console.log(`Logged in successfully as ${client.user.tag}`)
})

client.login(config.botToken).catch(err =>{
    console.log(`Failed to login: ${err}`)
});