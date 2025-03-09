import { SlashCommandBuilder } from 'discord.js';
import ApplicationCommand from '../templates/ApplicationCommand.js';
import { createEmbed } from '../lib/embeds.js';

export default new ApplicationCommand({
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies pong!'),
    async execute(interaction): Promise<void> {
        const latency = Date.now() - interaction.createdTimestamp;
        const embed = createEmbed(
            'success',
            'inter',
            interaction
        ).setDescription(`🏓 Pong! Latency is ${latency}ms.`);

        await interaction.reply({
            embeds: [embed]
        });
    }
});
