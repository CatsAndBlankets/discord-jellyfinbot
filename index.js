const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js')
const config = require('./config')

// if the guildInfo json doesn't exist, create a blank one
const jsonPath = 'guildInfo.json'
const jsonFile = {
    general: {
        guildId: '',
        channelId: ''
    },
    suggestion: {
        guildId: '',
        channelId: ''
    }
}
if (fs.existsSync(jsonPath)) {
    console.log('exists')
} else {
    console.log('not exist')

    // write the guild and channel ids to guildInfo json file
    fs.writeFileSync(jsonPath, JSON.stringify(jsonFile, null, 2), function (err) {
        if (err) {
            console.log('something went wrong')
        }
    })
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel
    ]
})

client.commands = new Collection()

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

// Look through every subfolder in the 'command' folder for command files
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        // If there's a data and execute properties in the command file
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
        }
    }
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'))

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    // console.log(event);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

console.log('this is the prefix: ' + config.prefix)

client.login(config.token)
