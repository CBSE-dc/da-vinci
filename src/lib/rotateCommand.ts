import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    ContextMenuCommandBuilder
} from 'discord.js';
import ApplicationCommand from '../templates/ApplicationCommand.js';
import { createEmbed } from '../lib/embeds.js';
import { getImages, rotate } from '../lib/images.js';

export default (angle: number) =>
    new ApplicationCommand({
        data: new ContextMenuCommandBuilder()
            .setName(`Rotate ${angle}deg`)
            .setType(ApplicationCommandType.Message),
        async execute(interaction): Promise<void> {
            await interaction.deferReply();

            // @ts-ignore
            const images = getImages(interaction.targetMessage);
            const hasImage = images.length > 0;

            if (!hasImage) {
                await interaction.editReply({
                    embeds: [
                        createEmbed(
                            'error',
                            'inter',
                            interaction
                        ).setDescription(
                            'You need to provide an image to rotate.'
                        )
                    ]
                });
                return;
            }

            const leftButton = new ButtonBuilder()
                .setCustomId(`rotate-left-${interaction.user.id}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji('↪');

            const rightButton = new ButtonBuilder()
                .setCustomId(`rotate-right-${interaction.user.id}`)
                .setStyle(ButtonStyle.Primary)
                .setEmoji({
                    name: '↩'
                });

            const deleteButton = new ButtonBuilder()
                .setCustomId(`rotate-delete-${interaction.user.id}`)
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑');

            const row = new ActionRowBuilder().addComponents(
                leftButton,
                rightButton,
                deleteButton
            );

            const image = images[0]!;
            try {
                const attachment = await rotate(image, angle);

                if (!attachment) {
                    await interaction.editReply({
                        embeds: [
                            createEmbed(
                                'error',
                                'inter',
                                interaction
                            ).setDescription('Failed to fetch the image.')
                        ]
                    });
                    return;
                }

                await interaction.editReply({
                    files: [attachment],
                    // @ts-ignore
                    components: [row]
                });
            } catch (error) {
                await interaction.editReply({
                    embeds: [
                        createEmbed(
                            'error',
                            'inter',
                            interaction
                        ).setDescription('Failed to rotate the image.')
                    ]
                });
            }
        }
    });
