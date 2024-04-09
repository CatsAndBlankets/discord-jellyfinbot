const config = require('../../config.js')
const jsonPath = '../../guildInfo.json'
const jsonFile = {
    guildId: '',
    channelId: ''
}
const fs = require('fs')
const path = require('path')

module.exports = {
    data: {
        name: 'setchannel',
        description: 'dictates the channel the bot will process commands from',
        folder: 'utility'
    },
    async execute (interaction) {
        if (interaction.author.id !== config.owner) {
            return interaction.channel.send("You're not the owner, so you can't use this.")
        }

        jsonFile.channelId = interaction.channelId

        jsonFile.guildId = interaction.guildId

        console.log(interaction)

        await fs.writeFile(path.join(__dirname, jsonPath), JSON.stringify(jsonFile, null, 2), function writeJSON (err) {
            if (err) return console.log(err)
            console.log(JSON.stringify(jsonFile))
            console.log('writing to ' + jsonPath)
        })

        await interaction.channel.send(`channel set to <#${interaction.channelId}>`)
    }
}
