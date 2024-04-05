const secret = require('./secret.js') // remove this and replace secret variables with " " if making your own bot

module.exports = {
    token: process.env.TOKEN || secret.token,
    clientId: secret.clientId, // The bot's application id
    color: process.env.EMBED_COLOR || secret.color,
    owner: process.env.DISCORD_OWNER || secret.owner,
    coowner: process.env.DISCORD_CO_OWNER || secret.coowner,
    jellyfin: process.env.JELLYFIN || 'http://localhost:8096',
    jellyfinToken: process.env.JELLYFIN_TOKEN || secret.jellyfinToken,
    jellyfinUser: process.env.JELLYFIN_USER || secret.jellyfinUser,
    jellyfinDevice: process.env.JELLYFIN_DEVICE || secret.jellyfinDevice,
    jellyfinConfigPath: process.env.JELLYFIN_CONFIGPATH || secret.jellyfinConfigPath,
    prefix: process.env.PREFIX || '.'
}
