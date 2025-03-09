import {
    REST,
    type RESTPostAPIApplicationCommandsJSONBody,
    Routes
} from 'discord.js';
import { readdir } from 'node:fs/promises';
import { $e } from './env.js';
import { logger } from './logger.js';
import path from 'node:path';

export default async () => {
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    const commandsFolder = path.resolve(import.meta.dirname, '../commands');
    const commandFiles: string[] = (await readdir(commandsFolder)).filter(
        (file) => file.endsWith('.js') || file.endsWith('.ts')
    );

    for (const file of commandFiles) {
        const command = await import(`../commands/${file}`);
        // if it has default export, then one command, else array
        const hasDefaultExport = Object.keys(command).includes('default');

        if (hasDefaultExport) {
            const commandData = (command.default as any).data.toJSON();
            commands.push(commandData);
        } else {
            for (const cmd of command.commands) {
                const commandData = cmd.data.toJSON();
                commands.push(commandData);
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken($e('TOKEN') as string);

    try {
        logger.info('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands($e('CLIENT_ID') as string), {
            body: commands
        });

        logger.success('Successfully reloaded application (/) commands.');
    } catch (error) {
        logger.error(error);
    }
};
