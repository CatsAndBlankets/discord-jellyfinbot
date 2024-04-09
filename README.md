# discord-jellyfinbot
A Discord bot for a local Jellyfin server.

Search through your media library and control your jellyfin server. This is made for my personal use, somethings may not work.

This bot uses custom prefix commands. Adjustments can be made to have it use slash commands, this is just not the direction I wanted to go in.

#### **NOTE: THIS BOT ONLY PROVIDES CONTROLS TO JELLYFIN, NOT DIRECTLY STREAM**

## Bot permissions needed
- Send messages
- Send Embeds
- Send Embeded Links (providing link to provide more info on media when using "playing" command)
- Send Attachments (this is to provide the poster images within jellyfin when using the "playing" command)

(This is a work in progress, I'll get to it later)
## Commands
These are the available commands for this bot:
### Jellyfin
- search
- playing
- audio
- subs

### Media Controls
You can control a Jellyfin session, provided that the session has permissions to do so.
- play
- pause
- stop
- next
- previous

### Utilities
These functions are meant to facilitate setting up the bot
- setchannel
- help -- provides an embed message that lists out commands in the jellyfin and media controls section.
- reload
- setchannel


## Docker
The docker image will first need to be built before creating a docker container. This can be done by using:
```
docker compose build t discord-jellyfinbot .
```

while in the github folder. Once the image has been created, you can use the template below to make the docker container:

```
services:
  buttertoast:
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