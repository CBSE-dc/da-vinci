import { AttachmentBuilder } from 'discord.js';
import { getImages } from '../lib/images.js';
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

        if (!fetchedMessage) return;

        const attachments = getImages(fetchedMessage);
        const image = attachments[0];

        if (!image) return;

        try {
            const fetched = await fetch(image.url);
            const imgBlob = fetched.ok ? await fetched.blob() : null;

            if (!imgBlob) return;

            const buffer = Buffer.from(await imgBlob.arrayBuffer());
            const bw = await sharp(buffer).grayscale().toBuffer();
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
