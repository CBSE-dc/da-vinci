import { type BaseInteraction, EmbedBuilder, type Message } from 'discord.js';

const colors = {
    error: 0xff2056,
    success: 0x00bc7d,
    warning: 0xffb900,
    info: 0x7c86ff,
    neutral: 0x808080
};

export const createEmbed = <T extends 'inter' | 'text'>(
    type: keyof typeof colors,
    _type: T,
    _inter: T extends 'inter' ? BaseInteraction : Message<any>
) => {
    const user =
        _type === 'inter'
            ? (_inter as BaseInteraction).user
            : (_inter as Message<any>).author;

    return new EmbedBuilder()
        .setColor(colors[type])
        .setTimestamp()
        .setFooter({
            text: user.tag ?? 'unknown',
            iconURL: (user.avatarURL() ?? undefined) as string
        });
};
