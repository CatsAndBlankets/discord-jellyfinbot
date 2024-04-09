const config = require('../../config.js')

module.exports = {
    data: {
        name: 'reload',
        description: 'resets the command cache',
        folder: 'utility'
    },
    async execute (interaction, args) {
        if (interaction.author.id !== config.owner) {
            return interaction.channel.send("You're not me, so you can't use this.")
        }

        const commandName = args[0]
        const command = interaction.client.commands.get(commandName)

        if (!command) {
            return interaction.channel.send({ content: 'this is not a command' })
        }

        delete require.cache[require.resolve(`../${command.data.folder}/${command.data.name}.js`)]

        try {
            interaction.client.commands.delete(command.data.name)
            const newCommand = require(`../${command.data.folder}/${command.data.name}.js`)
            interaction.client.commands.set(newCommand.data.name, newCommand)
            await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`)
        } catch (error) {
            console.error(error)
            await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``)
        }
    }
}
