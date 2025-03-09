import 'dotenv/config';
import { Client, Collection, Partials } from 'discord.js';
import { $e } from './lib/env.js';
import { logger } from './lib/logger.js';
import deployGlobalCommands from './lib/deployGlobalCommands.js';
import type ApplicationCommand from './templates/ApplicationCommand.js';
import type Event from './templates/Event.js';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type MessageCommand from './templates/MessageCommand.js';

// sync commands
await deployGlobalCommands();

// client setup
global.client = Object.assign(
    new Client({
        intents: ['Guilds', 'GuildMessages', 'MessageContent'],
        partials: [Partials.Message]
    }),
    {
        commands: new Collection<string, ApplicationCommand>(),
        msgCommands: new Collection<string, MessageCommand>()
    }
);

// commands setup
const commandsFolder = path.resolve(path.join(import.meta.dirname, 'commands'));
const commandFiles: string[] = (await readdir(commandsFolder)).filter(
    (file) => file.endsWith('.js') || file.endsWith('.ts')
);
for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    const hasDefaultExport = Object.keys(command).includes('default');

    if (hasDefaultExport) {
        client.commands.set(command.default.data.name, command.default);
    } else {
        for (const cmd of command.commands) {
            client.commands.set(cmd.data.name, cmd);
        }
    }
}

const messageCommandsFolder = path.resolve(
    path.join(import.meta.dirname, 'messageCommands')
);
const msgCommandFiles: string[] = (await readdir(messageCommandsFolder)).filter(
    (file) => file.endsWith('.js') || file.endsWith('.ts')
);
for (const file of msgCommandFiles) {
    const command = await import(`./messageCommands/${file}`);
    const hasDefaultExport = Object.keys(command).includes('default');

    if (hasDefaultExport) {
        client.msgCommands.set(command.name, command.default);
    } else {
        for (const cmd of command.commands) {
            client.msgCommands.set(cmd.data.name, cmd);
        }
    }
}

// events setup
const eventFolder = path.resolve(path.join(import.meta.dirname, 'events'));
const eventFiles: string[] = (await readdir(eventFolder)).filter(
    (file) => file.endsWith('.js') || file.endsWith('.ts')
);

for (const file of eventFiles) {
    const event: Event = (await import(`./events/${file}`)).default as Event;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// basic setup
client.on('ready', () => {
    logger.success(`Logged in as ${client.user?.tag ?? 'Unknown'}`);
});

// login
const TOKEN = $e('TOKEN');

await client.login(TOKEN);
