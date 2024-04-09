module.exports = {
    token: process.env.TOKEN || '',
    clientId: process.env.DISCORD_CLIENTID || '', // The bot's application id
    color: process.env.EMBED_COLOR || '',
    owner: process.env.DISCORD_OWNER || '',
    coowner: process.env.DISCORD_CO_OWNER || '',
    jellyfin: process.env.JELLYFIN || 'http://localhost:8096',
    jellyfinToken: process.env.JELLYFIN_TOKEN || '',
    jellyfinUser: process.env.JELLYFIN_USER || '',
    jellyfinDevice: process.env.JELLYFIN_DEVICE || '',
    jellyfinConfigPath: process.env.JELLYFIN_CONFIGPATH || '',
    prefix: process.env.PREFIX || '.'
}
