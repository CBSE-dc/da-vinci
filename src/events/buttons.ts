import { type BaseInteraction, Events } from 'discord.js';
import Event from '../templates/Event.js';
import { getImages, rotate } from '../lib/images.js';
import { createEmbed } from '../lib/embeds.js';
import { logger } from '../lib/logger.js';
import { sendBookmarkEmbed } from '../lib/bookmark.js';

const parseDiscordUrl = (url: string) => {
    const urlObject = new URL(url);
    const path = urlObject.pathname;
    const parts = path.split('/');
    return {
        guildID: parts[2],
        channelID: parts[3],
        messageID: parts[4]
    };
};

export default new Event({
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (!interaction.isButton()) return;

        await interaction.deferUpdate();

        try {
            if (
                interaction.message.author.id === interaction.client.user?.id &&
                interaction.message.embeds.length > 0
            ) {
                const bmEmbedRegex =
                    /Click the button to recieve the bookmarked \[message\]\((.*)\) in your DM's/;

                const msgURL = interaction.message.embeds[0]?.description
                    ?.match(bmEmbedRegex)
                    ?.at(1);

                if (msgURL) {
                    const { messageID } = parseDiscordUrl(msgURL);

                    if (messageID) {
                        const message =
                            await interaction.channel?.messages.fetch(
                                messageID
                            );
                        if (message) {
                            await sendBookmarkEmbed(
                                'inter',
                                interaction,
                                message
                            );
                            return;
                        }
                    }
                }
            }

            if (!interaction.customId.endsWith(interaction.user.id)) {
                await interaction.followUp({
                    embeds: [
                        createEmbed(
                            'error',
                            'inter',
                            interaction
                        ).setDescription(
                            `This button is not for you! <@${interaction.user.id}>`
                        )
                    ],
                    flags: ['Ephemeral']
                });
                return;
            }

            if (interaction.customId.startsWith('delete')) {
                await interaction.message.delete();
                return;
            }

            if (
                interaction.customId.startsWith('rotate-') ||
                // @ts-ignore
                interaction.targetMessage
            ) {
                // @ts-ignore
                const images = getImages(interaction.message);
                if (!images || images.length === 0) return;
                const img = images[0]!;

                const rotated = await rotate(
                    img,
                    interaction.customId.split('-')[1] === 'left' ? -90 : 90
                );

                if (!rotated) return;

                await interaction.message.edit({
                    files: [rotated],
                    components: interaction.message.components
                });
            }
        } catch (error) {
            logger.error(error);
        }
    }
});
