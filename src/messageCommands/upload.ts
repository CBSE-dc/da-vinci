import { fetchImage, getImages } from '../lib/images.js';
import MessageCommand from '../templates/MessageCommand.js';
import { createEmbed } from '../lib/embeds.js';
import { $e } from '../lib/env.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const BASEURL = new URL('https://api.imgbb.com/1/upload');

export default new MessageCommand({
    name: 'upload',
    description: 'Rotate an image',
    aliases: ['upload', 'up'],
    async execute(message) {
        const repliedId = message.reference?.messageId;

        const fetchedMessage = repliedId
            ? await message.channel.messages.fetch(repliedId)
            : null;

        if (!fetchedMessage) {
            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        'Please reply to a message with an image to upload'
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
                        'The replied message does not contain any images'
                    )
                ]
            });
            return;
        }

        const fetched = await fetchImage(image.url);
        if (!fetched) {
            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        'An error occurred while fetching the image'
                    )
                ]
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', fetched.blob, 'image.png');

            const UPLOAD = new URL(BASEURL);
            UPLOAD.searchParams.set('key', $e('IMGBB_API_KEY'));
            UPLOAD.searchParams.set('name', image.name + new Date().getTime());

            const response = await fetch(UPLOAD.href, {
                method: 'POST',
                body: formData
            });

            let data = (await response.json()) as any;
            // @ts-ignore
            if (!data?.data) {
                await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'An error occurred while uploading the image'
                        )
                    ]
                });
                return;
            }

            // @ts-ignore
            if (data.status !== 200) {
                await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'An error occurred while uploading the image'
                        )
                    ]
                });
                return;
            }

            // @ts-ignore
            data = data.data as any;

            const { url, display_url, height, width } = data;

            const urlButton = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('View')
                .setURL(url);
            const actionRow = new ActionRowBuilder().addComponents(urlButton);

            await message.reply({
                embeds: [
                    createEmbed('success', 'text', message)
                        .setImage(display_url)
                        .setDescription(
                            `Uploaded image with dimensions ${width}x${height}`
                        )
                ],
                // @ts-ignore
                components: [actionRow]
            });
        } catch (error) {
            console.log(error);

            await message.reply({
                embeds: [
                    createEmbed('error', 'text', message).setDescription(
                        'An error occurred while uploading the image'
                    )
                ]
            });
        }
    }
});
