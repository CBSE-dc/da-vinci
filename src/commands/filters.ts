import {
    ApplicationCommandType,
    AttachmentBuilder,
    ContextMenuCommandBuilder
} from 'discord.js';
import ApplicationCommand from '../templates/ApplicationCommand.js';
import { createEmbed } from '../lib/embeds.js';
import { getImages } from '../lib/images.js';
import sharp from 'sharp';

export default new ApplicationCommand({
    data: new ContextMenuCommandBuilder()
        .setName('Black and White')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        await interaction.deferReply();

        // @ts-ignore
        const images = getImages(interaction.targetMessage);
        const hasImage = images.length > 0;

        if (!hasImage) {
            await interaction.editReply({
                embeds: [
                    createEmbed('error', interaction).setDescription(
                        'You need to provide an image to rotate.'
                    )
                ]
            });
            return;
        }

        const image = images[0]!;
        try {
            const fetched = await fetch(image.url);
            const imgBlob = fetched.ok ? await fetched.blob() : null;

            if (!imgBlob) return;

            const buffer = Buffer.from(await imgBlob.arrayBuffer());
            const bw = await sharp(buffer).grayscale().toBuffer();
            const attachment = new AttachmentBuilder(bw, {
                name: 'bw.png'
            });

            await interaction.editReply({
                files: [attachment]
            });
        } catch (error) {
            await interaction.editReply({
                embeds: [
                    createEmbed('error', interaction).setDescription(
                        'Failed to rotate the image.'
                    )
                ]
            });
        }
    }
});
