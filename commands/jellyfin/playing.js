const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const { request } = require('undici')
const config = require('../../config.js')

module.exports = {
    data: {
        name: 'playing',
        description: 'displays current movie/show playing, if there is one',
        folder: 'jellyfin'
    },
    async execute (interaction) {
        const jellyfinRequest = await request(
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

        const jfResponse = await jellyfinRequest.body.json()

        if (jfResponse.length === 0 || !jfResponse[0].NowPlayingItem) {
            return interaction.channel.send('Nothing is playing right now.')
        }

        const nowPlaying = jfResponse[0].NowPlayingItem
        const playState = jfResponse[0].PlayState

        // Use the Parent Item's ID if the Item is a tv episode
        const itemId = nowPlaying.Type === 'Episode' ? nowPlaying.ParentId : nowPlaying.Id
        const jellyfinPoster = await request(
            `${config.jellyfin}/Items/${itemId}/Images?imageTypes=Primary`,
            {
                method: 'GET',
                headers: {
                    Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        )
        const images = await jellyfinPoster.body.json()

        const PosterImg = new AttachmentBuilder(images[0].Path.replace('/config', `${config.jellyfinConfigPath}`), { name: 'PosterImg.png' })

        const nowPlayingTitle = nowPlaying.Type === 'Episode' ? `${nowPlaying.SeriesName}: Season ${nowPlaying.ParentIndexNumber} Episode ${nowPlaying.IndexNumber}` : `${nowPlaying.Name} (${nowPlaying.ProductionYear})`
        const embedMessasge = new EmbedBuilder()
            .setColor(0x9901bb)
            .setTitle(`${nowPlayingTitle}`)
            .setURL(nowPlaying.ExternalUrls[0].Url)
            .setThumbnail(`attachment://${PosterImg.name}`)
            .addFields(
                { name: nowPlaying.Type, value: `${nowPlaying.Name} (${nowPlaying.ProductionYear})`, inline: true },
                { name: 'Status', value: playState.IsPaused ? 'Paused' : 'Playing', inline: true },
                { name: 'Overview', value: nowPlaying.Overview }
            )

        await interaction.channel.send({
            embeds: [embedMessasge],
            files: [PosterImg],
            fetchReply: true
        })
    }
}
