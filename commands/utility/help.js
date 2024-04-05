const { EmbedBuilder } = require('discord.js')
const config = require('../../config.js')

module.exports = {
    data: {
        name: 'help',
        description: 'lists out the commands, duh',
        folder: 'utility'
    },
    async execute (interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x9901bb)
            .setTitle('Command Menu')
            .setDescription('Here are the commands that I got set up so far: ')
            .addFields(
                { name: 'Commands:', value: `${config.prefix}search -- search for a movie or show\n${config.prefix}playing -- see what's playing right now\n${config.prefix}audio -- change the language the movie/show is in\n${config.prefix}subs -- change the subtitles for the movie/show\n${config.prefix}help -- lists out the commands, duh`, inline: true },
                { name: 'Media Controls:', value: `${config.prefix}play OR ${config.prefix}pause -- Play/pause (obvi)\n${config.prefix}stop -- Stop the stream entirely\n${config.prefix}next -- Play the next episode\n${config.prefix}previous -- Play the previous episode`, inline: true }
            )

        await interaction.channel.send({ embeds: [embed] })
    }
}
