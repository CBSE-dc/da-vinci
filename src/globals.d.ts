import type { Client, Collection } from 'discord.js';
import type ApplicationCommand from './templates/ApplicationCommand.js';
import type MessageCommand from './templates/MessageCommand.js';

interface DiscordClient extends Client {
    commands: Collection<string, ApplicationCommand>;
    msgCommands: Collection<string, MessageCommand>;
}

declare global {
    var client: DiscordClient;

    type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
}
