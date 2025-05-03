const{SlashCommandBuilder} = require('discord.js')
const{startVahleimServer} = require('./startValheimServer')

module.exports = {
    start : new SlashCommandBuilder()
                .setName('StartServer')
                .setDescription('Starts the server if the Host Machine is online'),
                async execute(interaction){
                    await interaction.reply('Starting the server it might take few minutes');
                    startVahleimServer()
                }
}