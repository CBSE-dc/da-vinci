import { type BaseInteraction, Events } from 'discord.js';
import Event from '../templates/Event.js';
import { getImages, rotate } from '../lib/images.js';

export default new Event({
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (!interaction.isButton()) return;

        await interaction.deferUpdate();

        try {
            if (!interaction.customId.endsWith(interaction.user.id)) {
                await interaction.followUp({
                    content: `This button is not for you! <@${interaction.user.id}>`,
                    flags: ['Ephemeral']
                });
                return;
            }

            if (
                interaction.customId.startsWith('rotate-') ||
                // @ts-ignore
                interaction.targetMessage
            ) {
                if (interaction.customId.startsWith('rotate-delete')) {
                    await interaction.message.delete();
                    return;
                }

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
            console.error(error);
        }
    }
});
