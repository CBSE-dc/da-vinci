import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type User,
    type BaseInteraction,
    type Message
} from 'discord.js';
import { createEmbed } from './embeds.js';
import { EMOJIS } from './constants.js';

export const sendBookmarkEmbed = async (
    type: 'text' | 'inter',
    _inter: Message | BaseInteraction,
    bmMessage: Message
) => {
    // @ts-ignore
    const author = (type === 'text' ? _inter.author : _inter.user) as User;

    const bookmarkEmbed = createEmbed('info', type, _inter)
        .setDescription(
            (bmMessage.content.length === 0
                ? bmMessage.embeds[0]?.description
                : bmMessage.content) ?? 'No content'
        )
        .addFields([
            {
                name: 'Author',
                value: bmMessage.author.tag,
                inline: true
            },
            {
                name: 'Channel',
                value: bmMessage.channel.toString(),
                inline: true
            }
        ]);

    if (bmMessage.embeds.length > 0) {
        const embed = bmMessage.embeds[0];

        if (embed?.title) bookmarkEmbed.setTitle(embed.title);
        if (embed?.url) bookmarkEmbed.setURL(embed.url);
        if (embed?.thumbnail) bookmarkEmbed.setThumbnail(embed.thumbnail.url);
        if (embed?.image) bookmarkEmbed.setImage(embed.image.url);
    }

    const deleteButton = new ButtonBuilder()
        .setCustomId(`delete-${author.id}`)
        .setLabel('Delete')
        .setStyle(ButtonStyle.Danger)
        .setEmoji(EMOJIS.binIcon);
    const actionRow = new ActionRowBuilder().addComponents(deleteButton);

    return await author.send({
        embeds: [bookmarkEmbed],
        files: bmMessage.attachments.map((attachment) => attachment.url),
        components: [actionRow as any]
    });
};
