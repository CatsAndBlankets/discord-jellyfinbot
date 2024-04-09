FROM node:latest

# config vars
ENV TOKEN=
ENV DISCORD_CLIENTID=
ENV DISCORD_OWNER=
ENV DISCORD_CO_OWNER=
ENV JELLYFIN=
ENV JELLYFIN_TOKEN=
ENV JELLYFIN_USER=
ENV JELLYFIN_DEVICE=
ENV JELLYFIN_CONFIGPATH=
ENV PREFIX=
ENV EMBED_COLOR=

# Create the bot's directory
RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
RUN npm install

COPY . /usr/src/bot

# Start the bot.
CMD ["node", "index.js"]