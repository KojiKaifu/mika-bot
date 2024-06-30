const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

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

// Function to start random messages
function startRandomMessages(client) {
    try {
        // Function to send a random message based on the current channel configuration
        const sendRandomMessage = (channelConfig) => {
            if (channelConfig && channelConfig.channelId) {
                const channel = client.channels.cache.get(channelConfig.channelId);
                if (channel) {
                    // Create an action row with a button
                    const confirm = new ButtonBuilder()
                        .setCustomId('confirm')
                        .setLabel('Claim')
                        .setStyle(ButtonStyle.Success);

                    const row = new ActionRowBuilder()
                        .addComponents(confirm);

                    // Send the interaction message with the action row
                    channel.send({
                        content: `Press the button below to claim a $${channelConfig.amount} drop.`,
                        components: [row]
                    });
                } else {
                    console.error('Channel not found:', channelConfig.channelId);
                }
            } else {
                console.error('Invalid or missing channel configuration:', channelConfig);
            }
        };

        // Function to start the interval with a new random interval
        const startRandomTimeout = () => {
            if (!global.randomMessagesActive) return; // Do nothing if messages are stopped

            const channelConfig = readChannelConfig();
            if (!channelConfig) {
                console.error('Invalid channel configuration. Ensure channel.json is correct.');
                return;
            }

            const randomInterval = Math.floor(Math.random() * (channelConfig.maxInterval - channelConfig.minInterval + 1)) + channelConfig.minInterval;
            console.log(`Next drop in ${randomInterval} seconds`);

            // Clear any existing timeout before starting a new one
            clearTimeout(global.timeoutId);

            global.timeoutId = setTimeout(() => {
                sendRandomMessage(channelConfig);
                startRandomTimeout(); // Start a new random timeout after sending a message
            }, randomInterval * 1000); // Convert seconds to milliseconds
        };

        // Initially start the timeout
        startRandomTimeout();

        // Watch for changes in channel configuration and update timeout accordingly
        fs.watchFile(path.join(__dirname, 'channel.json'), (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
                console.log('Channel configuration updated. Restarting interval...');
                clearTimeout(global.timeoutId); // Clear current timeout if any
                startRandomTimeout(); // Start new timeout with updated configuration
            }
        });
    } catch (error) {
        console.error('Error starting random drops:', error);
    }
}

module.exports = { startRandomMessages };
