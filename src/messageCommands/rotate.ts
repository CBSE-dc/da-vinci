import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getImages, rotate } from '../lib/images.js';
import MessageCommand from '../templates/MessageCommand.js';
import { createEmbed } from '../lib/embeds.js';

export default new MessageCommand({
    name: 'rotate',
    description: 'Rotate an image',
    aliases: ['rotate', 'rt'],
    async execute(message, args) {
        const repliedId = message.reference?.messageId;

        const fetchedMessage = repliedId
            ? await message.channel.messages.fetch(repliedId)
            : null;

        if (!fetchedMessage) {
            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        'No image found in the replied message.'
                    )
                ]
            });
            return;
        }

        const attachments = getImages(fetchedMessage);
        const image = attachments[0];

        if (!image) {
            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        'No image found in the replied message.'
                    )
                ]
            });
            return;
        }

        const angle = Number.parseInt(args[0] ?? '-90');

        const leftButton = new ButtonBuilder()
            .setCustomId(`rotate-left-${message.author.id}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji('↪');

        const rightButton = new ButtonBuilder()
            .setCustomId(`rotate-right-${message.author.id}`)
            .setStyle(ButtonStyle.Primary)
            .setEmoji({
                name: '↩'
            });

        const deleteButton = new ButtonBuilder()
            .setCustomId(`rotate-delete-${message.author.id}`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑');

        const row = new ActionRowBuilder().addComponents(
            leftButton,
            rightButton,
            deleteButton
        );

        try {
            const rotated = await rotate(image, angle);
            if (!rotated) return;

            // @ts-ignore
            await message.channel.send({
                files: [rotated],
                components: [row]
            });
        } catch (error) {
            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        'An error occurred while rotating the image'
                    )
                ]
            });
        }
    }
});
