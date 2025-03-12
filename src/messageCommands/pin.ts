import { createEmbed } from '../lib/embeds.js';
import MessageCommand from '../templates/MessageCommand.js';
import { EMOJIS } from '../lib/constants.js';
import { ChannelType } from 'discord.js';

export const commands = [
    new MessageCommand({
        name: 'pin',
        description: 'Pins a message',
        aliases: ['pin'],
        async execute(message) {
            if (
                message.channel.type === ChannelType.DM ||
                message.channel.type === ChannelType.GroupDM
            ) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'This command can only be used in servers.'
                        )
                    ]
                });
            }

            if (!message.member) return;

            const repliedMessage = message.reference?.messageId;

            if (!repliedMessage) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'You need to reply to a message to pin it.'
                        )
                    ]
                });
            }

            const messageToPin =
                await message.channel.messages.fetch(repliedMessage);

            if (!messageToPin) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'The message you replied to does not exist.'
                        )
                    ]
                });
            }

            const hasPermission = message.channel.permissionsFor(
                message.member
            );

            if (!hasPermission?.has('ManageMessages')) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'You do not have the required permissions to pin messages.'
                        )
                    ]
                });
            }

            try {
                await messageToPin.pin();
                await message.react(EMOJIS.pin);
                return;
            } catch (error) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'An error occurred while trying to pin the message.'
                        )
                    ]
                });
            }
        }
    }),
    new MessageCommand({
        name: 'unpin',
        description: 'Unpins a message',
        aliases: ['unpin'],
        async execute(message) {
            if (
                message.channel.type === ChannelType.DM ||
                message.channel.type === ChannelType.GroupDM
            ) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'This command can only be used in servers.'
                        )
                    ]
                });
            }

            if (!message.member) return;

            const repliedMessage = message.reference?.messageId;

            if (!repliedMessage) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'You need to reply to a message to unpin it.'
                        )
                    ]
                });
            }

            const messageToUnpin =
                await message.channel.messages.fetch(repliedMessage);

            if (!messageToUnpin) {
                return await message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'The message you replied to does not exist.'
                        )
                    ]
                });
            }

            const hasPermission = message.channel.permissionsFor(
                message.member
            );

            if (!hasPermission?.has('ManageMessages')) {
                return message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'You do not have the required permissions to unpin messages.'
                        )
                    ]
                });
            }

            try {
                await messageToUnpin.unpin();
                await message.react(EMOJIS.pin);
                return;
            } catch (error) {
                return message.reply({
                    embeds: [
                        createEmbed('error', 'text', message).setDescription(
                            'An error occurred while trying to unpin the message.'
                        )
                    ]
                });
            }
        }
    })
];
