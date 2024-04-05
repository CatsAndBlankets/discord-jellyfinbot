/* eslint-disable no-unneeded-ternary */
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } = require('discord.js')
const { request } = require('undici')
const config = require('./config.js')

module.exports = {
    async playMedia (sessionId, itemId) {
        // post to API to play media
        await request(
            `${config.jellyfin}/Sessions/${sessionId}/Playing?playCommand=PlayNow&itemIds=${itemId}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }
        )
    },
    async getSession (item) {
        const sessionRequest = await request(
            `${config.jellyfin}/Sessions?deviceId=${config.jellyfinDevice}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }
        )

        const result = await sessionRequest.body.json()

        if (!result.length) {
            return 0
        }

        if (!item) {
            return result[0]
        }

        return result[0][item]
    },
    chunking (actionRow, mapItems, bits, placeholder) {
        // Create an array of the items divided into 25 item slices
        const chunks = []
        let i = 0
        while (i < mapItems.length) {
            chunks.push(mapItems.slice(i, (i += bits)))
        }

        chunks.forEach((mapItems, i) => {
            actionRow.push(
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`mapItems-${i}`)
                        .setPlaceholder(placeholder ? `${placeholder}` : `(${mapItems[0].label} - ${mapItems[mapItems.length - 1].label})`)
                        .addOptions(mapItems)
                )
            )
        })
    },
    async getSeasons (interaction, tvshowId, tvName) {
        console.log('TVNAME: ' + tvName)
        const jellyfinRequest = await request(
            `${config.jellyfin}/Shows/${tvshowId}/Seasons?isMissing=false`,
            {
                method: 'GET',
                headers: {
                    Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }
        )

        const { Items } = await jellyfinRequest.body.json()

        // Season select menu
        const select = new StringSelectMenuBuilder()
            .setCustomId('select')
            .addOptions(
                Items.map((Items, index) => {
                    return {
                        label: `${Items.Name} (${Items.ProductionYear})`,
                        description: Items.Id,
                        value: `${Items.Id}|${Items.Name} (${Items.ProductionYear})`,
                        default: index === 0 ? true : false // the first item in the list will be the default selection
                    }
                })
            )

        // confirm and cancel buttons
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)

        const back = new ButtonBuilder()
            .setCustomId('back')
            .setLabel('Back')
            .setStyle(ButtonStyle.Secondary)

        // assembling the action rows
        const selectRows = new ActionRowBuilder()
            .addComponents(select)
        const confirmationRow = new ActionRowBuilder()
            .addComponents(confirm)
            .addComponents(cancel)
            .addComponents(back)

        // create an embed that lists out the shows found
        let results = ''
        let selection = 'nothing'
        for (const [index, item] of Items.entries()) {
            results += `${item.Name} (${item.ProductionYear})\n`
            if (index === 0) {
                selection = `${item.Id}|${item.Name} (${item.ProductionYear})` // set selection value to the first item in the list
            }
        }

        const embedMessage = new EmbedBuilder()
            .setColor(0x9901bb)
            .setTitle('Search Results')
            .setDescription("Here's what I found: ")
            .addFields(
                { name: 'Seasons:', value: results }
            )

        const response = await interaction.channel.send({ embeds: [embedMessage], components: [selectRows, confirmationRow] })

        // collect interaction when an item is selected
        const selectCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 })

        // collect interaction when a button is pressed
        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 })

        // update the selection information when user chooses item in select menu
        selectCollector.on('collect', async i => {
            selection = i.values[0]
            i.deferUpdate() // don't do anything when a selection is made
        })

        // when a button has been pressed, which if it's the 'confirm' or 'cancel' button
        buttonCollector.on('collect', async i => {
            if (i.customId === 'confirm') {
                await i.deferUpdate()
                await i.deleteReply()

                const seasonId = selection.split('|')[0]
                // initialize a new button command
                await this.getEpisodes(interaction, seasonId, tvshowId, tvName)
            } else if (i.customId === 'cancel') {
                await i.deferUpdate()
                await i.deleteReply()
            } else if (i.customId === 'back') {
                await i.deferUpdate()
                await i.deleteReply()

                // initialize a new button command
                const command = interaction.client.commands.get('search')
                await command.execute(interaction, tvName)
            }
        })
    },
    async getEpisodes (interaction, seasonId, tvshowId, tvName) {
        console.log('TVNAME: ep ' + tvName)
        const jellyfinRequest = await request(
            `${config.jellyfin}/Shows/${tvshowId}/Episodes?seasonId=${seasonId}&isMissing=false`,
            {
                method: 'GET',
                headers: {
                    Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }
        )

        const { Items } = await jellyfinRequest.body.json()

        // Since there's a possibility of there being more than 25 episodes, we may need to create multiple select menus
        // eslint-disable-next-line prefer-const
        let actionRows = []

        const episodes = Items.map((episode) => ({
            label: `EP ${episode.IndexNumber}`,
            value: episode.Id
        }))

        this.chunking(actionRows, episodes, 25)

        // confirm and cancel buttons
        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Confirm')
            .setStyle(ButtonStyle.Success)

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)

        const back = new ButtonBuilder()
            .setCustomId('back')
            .setLabel('Back')
            .setStyle(ButtonStyle.Secondary)

        // assembling the action row for buttons
        actionRows.push(
            new ActionRowBuilder()
                .addComponents(confirm)
                .addComponents(cancel)
                .addComponents(back)
        )

        // create an embed that lists out the shows found
        let results = ''
        let selection = 'nothing'
        for (const [index, item] of Items.entries()) {
            results += `EP ${item.IndexNumber}: ${item.Name}\n`
            // console.log(item.IndexNumber);
            if (index === 0) {
                selection = `${item.Id}` // set selection value to the first movie in the list
            }
        }

        const embedMessage = new EmbedBuilder()
            .setColor(0x9901bb)
            .setTitle('Search Results')
            .setDescription("Here's what I found: ")
            .addFields(
                { name: 'Episodes:', value: results }
            )

        const response = await interaction.channel.send({ embeds: [embedMessage], components: actionRows })

        // collect interaction when an item is selected
        const selectCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 })

        // collect interaction when a button is pressed
        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 })

        // update the selection information when user chooses item in select menu
        selectCollector.on('collect', async i => {
            selection = i.values[0]
            i.deferUpdate() // don't do anything when a selection is made
        })

        // when a button has been pressed, which if it's the 'confirm' or 'cancel' button
        buttonCollector.on('collect', async i => {
            if (i.customId === 'confirm') {
                await i.deferUpdate()
                await i.deleteReply()
                // initialize a new button command
                const sessionId = await this.getSessionId()
                if (sessionId === 0) {
                    return interaction.channel.send(":thinking: media player isn't on")
                }
                await this.playMedia(sessionId, selection.split('|')[0])
            } else if (i.customId === 'cancel') {
                await i.deferUpdate()
                await i.deleteReply()
            } else if (i.customId === 'back') {
                await i.deferUpdate()
                await i.deleteReply()

                // initialize a new button command
                this.getSeasons(interaction, tvshowId, tvName)
            }
        })
    }
}
