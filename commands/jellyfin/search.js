const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');
const { request } = require('undici');
const config = require('../../config.js');
const helper = require('../../helper_functions.js');

module.exports = {
    data: {
        name: 'search',
        description: 'starts a search for a movie or tv series',
        folder: 'jellyfin'
    },
    async execute(interaction, args) {
        console.log(args);
        let arguments = '';
        for (const i of args) {
            if (args.length == 1) {
                arguments = i;
            } else {
                arguments += i + ' ';
            }
        }

        const jellyfinRequest = await request(
            `${config.jellyfin}/Search/Hints?searchTerm=${arguments}&includeItemTypes=Movie&includeItemTypes=Series`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `MediaBrowser Token="${config.jellyfinToken}"`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        const { SearchHints } = await jellyfinRequest.body.json();

        if (!SearchHints.length) {
            return interaction.channel.send("Hm :thinking:, I couldn't find anything");
        }

        // create an embed that lists out the movies and tvshows found
        let movies = '';
        let tvshows = '';
        for (const item of SearchHints) {
            if (item.Type == 'Movie') {
                movies += item.Name + '\n';
            } else if (item.Type == 'Series') {
                tvshows += item.Name + '\n';
            }
        }


        const embedMessage = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('Search Results')
            .setDescription("Here's what I found: ");

        // Only add in the movie and tv section if search found something
        if (movies.length > 0) {
            embedMessage.addFields({ name: 'Movies:', value: movies, inline: true });
        }
        if (tvshows.length > 0) {
            embedMessage.addFields({ name: 'TV Shows:', value: tvshows, inline: true });
        }


        // Since there's a possibility of there being more than 25 items, we may need to create multiple select menus
        let action_rows = [];

        let items = SearchHints.map((item) => ({
            label: `${item.Name}`,
            value: `${item.Id}|${item.Type}`,
        }));


        helper.chunking(action_rows, items, 25);

        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary);
        
        action_rows.push(
            new ActionRowBuilder()
                .addComponents(cancel)
        );

        const response = await interaction.channel.send({ embeds: [embedMessage], components: action_rows });

        // collect interaction when an item is selected
        const selectCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000 });

        // collect interaction when a button is pressed
        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });


        // update the selection information when user chooses item in select menu
        selectCollector.on('collect', async i => {
            selection = i.values[0];

            if (selection.split("|")[1] === 'Series') {

                helper.getSeasons(interaction, selection.split("|")[0], [arguments]);

            } else if (selection.split("|")[1] === 'Movie') {
                // get the sessionId and then play the media
                const sessionId = await helper.getSession("Id");

                if (sessionId == 0) {
                    return interaction.channel.send(":thinking: media player isn't on");
                }
                await helper.playMedia(sessionId, selection.split("|")[0]);
            }

            await i.deferUpdate();
            await i.deleteReply();
        });


        // when a button has been pressed, which if it's the 'confirm' or 'cancel' button
        buttonCollector.on('collect', async i => {
            if (i.customId === 'cancel') {
                await i.deferUpdate();
                await i.deleteReply();
            }
        });
    }
};