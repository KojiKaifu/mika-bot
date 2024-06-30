const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { startRandomMessages } = require('./randomMessages');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const token = process.env.DISCORD_TOKEN;

// Create a collection for commands
client.commands = new Collection();

// Load command files
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log('Bot is online!');

    // Initialize global variable to control message sending
    global.randomMessagesActive = true;

    // Start sending random messages
    startRandomMessages(client);
});

client.on('interactionCreate', async (interaction) => {
    // Handle commands
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }

    // Handle buttons
    if (interaction.isButton()) {
        if (interaction.customId === 'collect_currency' && !interaction.user.bot) {
            try {
                // Load user currency data
                const currencyData = JSON.parse(fs.readFileSync('currency.json', 'utf8'));

                // Read channel configuration for amount
                const channelConfig = readChannelConfig();
                if (!channelConfig) {
                    console.error('Invalid channel configuration. Ensure channel.json is correct.');
                    return;
                }

                // Update user's currency
                if (!currencyData[interaction.user.id]) {
                    currencyData[interaction.user.id] = { username: interaction.user.username, currency: 0 };
                }
                currencyData[interaction.user.id].currency += channelConfig.amount; // Use channelConfig.amount here

                // Save updated currency data
                fs.writeFileSync('currency.json', JSON.stringify(currencyData, null, 2));

                // Inform the user about the update
                await interaction.reply({ content: `You have collected ${channelConfig.amount}!`, ephemeral: true });
            } catch (error) {
                console.error('Error updating currency:', error);
                await interaction.reply({ content: 'There was an error while collecting reward.', ephemeral: true });
            }
        }

        if (interaction.customId === 'confirm' && !interaction.user.bot) {
            try {
                // Defer the interaction first
                await interaction.deferReply({ ephemeral: true });

                // Load user currency data
                const currencyData = JSON.parse(fs.readFileSync('currency.json', 'utf8'));

                // Read channel configuration for amount
                if (!channelConfig) {
                    console.error('Invalid channel configuration. Ensure channel.json is correct.');
                    return;
                }

                // Award currency based on channelConfig.amount
                if (!currencyData[interaction.user.id]) {
                    currencyData[interaction.user.id] = { username: interaction.user.username, currency: 0 };
                }
                currencyData[interaction.user.id].currency += channelConfig.amount;

                // Save updated currency data
                fs.writeFileSync('currency.json', JSON.stringify(currencyData, null, 2));

                // Edit the reply to inform the user
                await interaction.editReply({ content: `You have claimed a $${channelConfig.amount} drop!`, components: [] });
            } catch (error) {
                console.error('Error claiming reward:', error);
                await interaction.followUp({ content: 'There was an error while claiming the reward.', ephemeral: true });
            }
        }
    }
});

client.login(token);

// Function to read channel configuration
function readChannelConfig() {
    try {
        const filePath = path.join(__dirname, 'channel.json');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading channel.json:', error);
        return null;
    }
}

module.exports = client; // Export the client
