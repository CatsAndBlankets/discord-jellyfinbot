const config = require('../../config.js')
const helper = require('../../helper_functions.js')
const { request } = require('undici')

module.exports = {
    data: {
        name: 'stop',
        description: 'stops the stream entirely',
        folder: 'mediacontrols'
    },
    async execute (interaction) {
        // get session ID
        const sessionId = await helper.getSession('Id')

        if (sessionId === 0) {
            return await interaction.channel.send(":thinking: media player isn't on")
        }

        const command = 'Stop'
        // call API to implement command
        await request(
            `${config.jellyfin}/Sessions/${sessionId}/Playing/${command}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `MediaBrowser Token="${config.jellyfinToken}"`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }
            }
        )
    }
}
