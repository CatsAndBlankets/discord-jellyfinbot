const config = require('../../config.js')
const jsonPath = '../../guildInfo.json'
const jsonFile = require(jsonPath)
const fs = require('fs')
const path = require('path')

module.exports = {
    data: {
        name: 'setchannel',
        description: 'dictates the channel the bot will process commands from',
        folder: 'utility'
    },
    async execute (interaction, args) {
        console.log(args)
        if (interaction.author.id !== config.owner) {
            return interaction.channel.send("You're not the owner, so you can't use this.")
        }
        console.log(JSON.stringify(jsonFile))
        // no arguments will set the channel to listen to commands
        if (args.length === 0) {
            jsonFile.general.channelId = interaction.channelId
            jsonFile.general.guildId = interaction.guildId
        } else if (args[0] === 'suggest') {
            jsonFile.suggestion.channelId = interaction.channelId
            jsonFile.suggestion.guildId = interaction.guildId
        } else if (args[0] === 'all') {
            jsonFile.general.channelId = interaction.channelId
            jsonFile.general.guildId = interaction.guildId
            jsonFile.suggestion.channelId = interaction.channelId
            jsonFile.suggestion.guildId = interaction.guildId
        } else {
            interaction.channel.send('invalid command')
        }

        // write the guild and channel ids to guildInfo json file
        fs.writeFile(path.join(__dirname, jsonPath), JSON.stringify(jsonFile, null, 2), function writeJSON (err) {
            if (err) return console.log(err)
            console.log(JSON.stringify(jsonFile))
            console.log('writing to ' + jsonPath)
        })

        await interaction.channel.send(`channel set to <#${interaction.channelId}>`)
    }
}
