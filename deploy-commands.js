const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // Optional: Set if you want to register commands for a specific guild

const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        if (guildId) {
            // Register commands for a specific guild if guildId is provided
            await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
            console.log(`Successfully reloaded guild (/) commands for guild ID: ${guildId}.`);
        } else {
            // Register commands globally
            await rest.put(Routes.applicationCommands(clientId), { body: commands });
            console.log('Successfully reloaded global application (/) commands.');
        }
    } catch (error) {
        console.error(error);
    }
})();
