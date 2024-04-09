# discord-jellyfinbot
A Discord bot for a local Jellyfin server.

Search through your media library and control your jellyfin server. This bot uses custom prefix commands. Adjustments can be made to have it use slash commands by replacing the "data" sections of each command with the SlashCommandBuilder stuff. The [discordjs.guide](https://discordjs.guide/) site provides a really nice walkthrough to getting start on making a bot with slash commands, this is just not the direction I wanted to go in.

### **Disclaimers:** 
- This is made for my personal use, somethings may not work.
- **THIS BOT ONLY PROVIDES CONTROLS TO JELLYFIN, NOT DIRECTLY STREAM**



## Bot permissions needed
- Send messages
- Send Embeds
- Send Embeded Links (providing link to provide more info on media when using "playing" command)
- Send Attachments (this is to provide the poster images within jellyfin when using the "playing" command)
- View channels (to set the command channel or the suggestion channel and stuff)

(This is a work in progress, I'll get to it later)
## Commands
These are the available commands for this bot:

<table>
    <tr>
        <th>Command</th>
        <th>Description</th>
        <th>Example (assuming "." is the prefix)</th>
    </tr>
    <tr>
        <td>search </td>
        <td>start a search through the jellyfin library</td>
        <td>.search Nope -- would look for movies and tv shows that have nope in the name</td>
    </tr>
    <tr>
        <td>suggest (not made yet) </td>
        <td>suggests a movie or tv show in the suggestion channel</td>
        <td>.suggest Nope -- would open a menu to select the correct "Nope" title to put in suggestion channel</td>
    </tr>
    <tr>
        <td>playing</td>
        <td>display what's currently playing on jellyfin device</td>
        <td></td>
    </tr>
    <tr>
        <td>audio</td>
        <td>change the media's audio (if option is available)</td>
        <td></td>
    </tr>
    <tr>
        <td>subs</td>
        <td>change the media's subtitles (if options are available)</td>
        <td></td>
    </tr>
    <tr>
        <td>play or pause</td>
        <td>both play or pause current media</td>
        <td></td>
    </tr>
    <tr>
        <td>stop</td>
        <td>completely stops the media currently playing</td>
        <td></td>
    </tr>
    <tr>
        <td>next</td>
        <td>skips to the next tv episode</td>
        <td></td>
    </tr>
    <tr>
        <td>previous</td>
        <td>skips to the previous tv episode</td>
        <td></td>
    </tr>
    <tr>
        <td>setchannel</td>
        <td>designates channel to listen for commands</td>
        <td>
            .setchannel -- sets current channel to listen for commands
            <br>
            <br>
            .setchannel suggest -- sets current channel to accept suggestions
            <br>
            <br>
            .setchannel all -- sets current channel to list for commands and suggestions
        </td>
    </tr>
    <tr>
        <td>help</td>
        <td>provides embed message that lists out commands above</td>
        <td></td>
    </tr>
    <tr>
        <td>reload</td>
        <td>resets the cache for a command (this is primarily used when making changes to a command)</td>
        <td>
            .reload setchannel -- reset the cache for .setchannel
            <br>
            <br>
            if an error occurs while reloading the command, you will need to restart the whole bot    
        </td>
    </tr>

</table>



## Docker Container
The docker image will first need to be built before creating a docker container. This can be done by using:
```
docker compose build t discord-jellyfinbot .
```

while in the github folder. Once the image has been created, you can use the template below to make the docker container:

### **Docker Compose (recommended):**
```
discord-jellyfinbot:
    container_name: discord-jellyfinbot
    image: discord-jellyfinbot
    environment:
        - TOKEN={BOT TOKEN HERE}
        - PREFIX={PREFIX HERE}
        - EMBED_COLOR={COLOR HEX CODE}
        - DISCORD_OWNER={DISCORD USER ID CODE}
        - DISCORD_CO_OWNER={DISCORD USER ID CODE}
        - JELLYFIN={JELLYFIN URL}
        - JELLYFIN_TOKEN={JELLYFIN API TOKEN}
        - JELLYFIN_USER={JELLYFIN USER ID}
        - JELLYFIN_DEVICE={JELLYFIN DEVICE}
        - JELLYFIN_CONFIGPATH={ACTUAL PATHWAY TO JELLYFIN CONFIG}
    restart: unless-stopped
```

### **Docker:**
```
docker run -d \
    --name discord-jellyfinbot \
    --restart unless-stopped \
    -e TOKEN={BOT TOKEN} \
    -e PREFIX={PREFIX HERE} \
    -e EMBED_COLOR={COLOR HEX CODE} \
    -e DISCORD_OWNER={DISCORD USER ID CODE} \
    -e DISCORD_CO_OWNER={DISCORD USER ID CODE} \
    -e JELLYFIN={JELLYFIN URL} \
    -e JELLYFIN_TOKEN={JELLYFIN API TOKEN} \
    -e JELLYFIN_USER={JELLYFIN USER ID} \
    -e JELLYFIN_DEVICE={JELLYFIN DEVICE} \
    -e JELLYFIN_CONFIGPATH={ACTUAL PATHWAY TO JELLYFIN CONFIG} \
    discord-jellyfinbot
```

# Roadmap
- add option to get token with username and password
- suggestion command so others can suggest media to add into jellyfin server
- flesh out the way the bot responses to commands (so that it doesn't look like the bot is ignoring you when you've successfully completed a command)
- control permissions so only one person can control the bot at a time
- making sure that all api calls can be proxied (or something so that you can make API calls to jellyfin docker if it's on the same network as the bot)


# Resources
These are some of the sites I used to make this bot
- https://api.jellyfin.org/
- https://discordjs.guide/
- [Discord.js v14 Tutorial: Creating a Prefix Handler and Your First Prefix Command (Part : 3)](https://www.youtube.com/watch?v=sqnOSSB6o00) -- I didn't actually, but I can't find the reddit post at the moment