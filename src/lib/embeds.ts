import { type BaseInteraction, EmbedBuilder } from 'discord.js';

const colors = {
    error: 0xff2056,
    success: 0x00bc7d,
    warning: 0xffb900,
    info: 0x7c86ff,
    neutral: 0x808080
};

export const createEmbed = (
    type: keyof typeof colors,
    interaction: BaseInteraction
) =>
    new EmbedBuilder()
        .setColor(colors[type])
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag ?? 'unknown',
            iconURL: (interaction.user.avatarURL() ?? undefined) as string
        });
