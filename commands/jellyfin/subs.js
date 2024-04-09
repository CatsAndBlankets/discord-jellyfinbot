/* eslint-disable prefer-const */
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js')
const { request } = require('undici')
const config = require('../../config.js')
const helper = require('../../helper_functions.js')

module.exports = {
    data: {
        name: 'subs',
        description: 'displays options to change subtitles for the media currently playing (if any)',
        folder: 'jellyfin'
    },
    async execute (interaction) {
        const session = await helper.getSession()
        const sessionId = session.Id
        const playState = session.PlayState
        const nowPlaying = session.NowPlayingItem

        if (sessionId === 0) {
            return await interaction.channel.send(":thinking: The media player ain't on")
        }

        // get request to API to find audio and subtitle info
        const itemInfoRequest = await request(
            `${config.jellyfin}/Items?ids=${nowPlaying.Id}&fields=MediaStreams`,
            {
                method: 'GET',
                headers: {
                    Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }
        )

        const { Items } = await itemInfoRequest.body.json()
        const mediaStreams = Items[0].MediaStreams
        let subtitleTracks = []
        let subtitleEmbed = ''

        for (const i of mediaStreams) {
            if (i.Type === 'Subtitle') {
                if (subtitleTracks.length <= 10) {
                    subtitleTracks.push({
                        DisplayTitle: i.DisplayTitle,
                        Index: i.Index,
                        Set: i.Index === playState.SubtitleStreamIndex
                    })
                    subtitleEmbed += i.DisplayTitle + '\n'
                }
            }
        }

        // adding in "none" option to turn off subtitles
        subtitleTracks.push({
            DisplayTitle: 'None',
            Index: -1,
            Set: playState.SubtitleStreamIndex === -1
        })
        subtitleEmbed += 'None' + '\n'

        if (subtitleTracks.length === 1) {
            return await interaction.channel.send(`There are no subtitles for this ${nowPlaying.Type.toLowerCase()}`)
        }

        const subtitle = new StringSelectMenuBuilder()
            .setCustomId('subtitle')
            .setPlaceholder('select something')
            .addOptions(
                subtitleTracks.map((mediaStreams) => {
                    return {
                        label: mediaStreams.DisplayTitle,
                        description: mediaStreams.DisplayTitle,
                        value: `${mediaStreams.Index}|${mediaStreams.DisplayTitle}`
                    }
                })
            )

        const subtitleControl = new ActionRowBuilder()
            .addComponents(subtitle)

        const back = new ButtonBuilder()
            .setCustomId('back')
            .setLabel('Wait, I fucked up')
            .setStyle(ButtonStyle.Primary)

        const backButton = new ActionRowBuilder()
            .addComponents(back)

        const embedMessage = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('Subtitles')
            .setDescription(`Here are the subtitles for this ${nowPlaying.Type}:\n` + subtitleEmbed)

        // console.log(embedMessage);
        const response = await interaction.channel.send({
            embeds: [embedMessage],
            components: [subtitleControl]
        })

        // collect interaction when a selection is made
        const selectCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 })
        // collect interaction when a button is pressed
        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 })

        selectCollector.on('collect', async i => {
            if (i.customId === 'subtitle') {
                console.log(i)
                let track = ''
                if (i.values[0].split('|')[0] === 'none') {
                    track = -1
                } else {
                    track = i.values[0].split('|')[0]
                }

                await request(
                    `${config.jellyfin}/Sessions/${sessionId}/Command`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                            'Content-Type': 'application/json',
                            Accept: 'application/json'
                        },
                        body: JSON.stringify({
                            Name: 'SetSubtitleStreamIndex',
                            Arguments: {
                                Index: track
                            }
                        })
                    }
                )
            }
            const embedUpdate = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Subtitles')
                .setDescription(`${i.values[0].split('|')[1]} was selected`)

            i.update({ embeds: [embedUpdate], components: [backButton] })
        })

        buttonCollector.on('collect', async i => {
            if (i.customId === 'back') {
                const command = interaction.client.commands.get('subs')
                await command.execute(interaction)
                i.deferUpdate()
                i.deleteReply()
            }
        })
    }
}
