const {Client, IntentsBitField} = require('discord.js')
require('dotenv').config();


const token = process.env.TOKEN

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) =>{
    console.log(`${c.user.displayName} is ready`)
})

client.login(token);