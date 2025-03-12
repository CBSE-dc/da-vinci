import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed } from '../lib/embeds.js';
import MessageCommand from '../templates/MessageCommand.js';
import { EMOJIS } from '../lib/constants.js';
import { sendBookmarkEmbed } from '../lib/bookmark.js';

export default new MessageCommand({
    name: 'bookmark',
    description: 'Bookmark a message',
    aliases: ['bookmark', 'bm'],
    async execute(message) {
        const repliedMessage = message.reference?.messageId
            ? await message.channel.messages.fetch(message.reference.messageId)
            : null;

        if (!repliedMessage) {
            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        'You must reply to a message to bookmark it.'
                    )
                ]
            });
            return;
        }

        const embed = createEmbed('info', 'text', message).setDescription(
            `Click the button to recieve the bookmarked [message](${message.url}) in your DM's`
        );
        const bookMarkButton = new ButtonBuilder()
            .setCustomId('bookmark')
            .setLabel('Bookmark')
            .setStyle(ButtonStyle.Primary)
            .setEmoji(EMOJIS.bookmarkEmoji);

        // @ts-ignore
        await message.channel.send({
            embeds: [embed],
            components: [
                new ActionRowBuilder().addComponents(bookMarkButton) as any
            ]
        });

        await sendBookmarkEmbed('text', message, repliedMessage);
    }
});
