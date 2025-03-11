import { AttachmentBuilder } from 'discord.js';
import { fetchImage, getImages } from '../lib/images.js';
import MessageCommand from '../templates/MessageCommand.js';
import sharp from 'sharp';
import { createEmbed } from '../lib/embeds.js';

export default new MessageCommand({
    name: 'blackwhite',
    description: 'Apply a black and white filter to an image',
    aliases: ['blackwhite', 'bw'],
    async execute(message) {
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

        try {
            const fetched = await fetchImage(image.url);
            if (!fetched) {
                await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'Failed to fetch the image.'
                        )
                    ]
                });
                return;
            }

            const bw = await sharp(await fetched.getBuffer())
                .grayscale()
                .toBuffer();
            const attachment = new AttachmentBuilder(bw, {
                name: 'bw.png'
            });

            // @ts-ignore
            await message.channel.send({
                files: [attachment]
            });
        } catch (error) {
            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        "'An error occurred while applying filter'"
                    )
                ]
            });
        }
    }
});
