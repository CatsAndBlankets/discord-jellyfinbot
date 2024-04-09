const { Events } = require('discord.js')
const config = require('../config.js')
const guildInfo = require('../guildInfo.json')

module.exports = {
    name: Events.MessageCreate,
    async execute (message) {
        // console.log(message)
        // don't process if the message doesn't have the prefix or the message is from a bot
        if (!message.content.startsWith(config.prefix) || message.author.bot) return

        // don't process if the message is in the wrong server or channel AND it's not to use the "setchannel" command.
        if ((message.guildId !== guildInfo.general.guildId || message.channelId !== guildInfo.general.channelId) && (message.content.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase() !== 'setchannel')) return

        const args = message.content.slice(config.prefix.length).trim().split(/ +/)
        console.log('args: ' + args)
        const commandName = args.shift().toLowerCase()

        const command = message.client.commands.get(commandName)

        console.log('command: ' + JSON.stringify(command))

        try {
            await command.execute(message, args)
        } catch (error) {
            console.error(error)
            if (message.replied || message.deferred) {
                await message.channel.send({ content: 'There was an error while executing this command!' })
            } else {
                await message.channel.send({ content: "This ain't a command bro" })
            }
        }
    }
}
