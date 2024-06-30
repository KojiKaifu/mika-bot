const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// Define the ID of the role that can edit balances
const allowedRoleId = '1138528870673416383';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setconfig')
        .setDescription('Set configuration for random messages')
        .addIntegerOption(option =>
            option.setName('interval')
                .setDescription('Default interval in seconds between random messages')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('min')
                .setDescription('Minimum interval in seconds')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('max')
                .setDescription('Maximum interval in seconds')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of currency to give in random messages')
                .setRequired(true)),
    async execute(interaction) {
        try {
            // Check if the user has the required role
            if (!interaction.member.roles.cache.has(allowedRoleId)) {
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }

            // Read existing channel configuration
            let channelConfig = {};
            try {
                const data = fs.readFileSync('channel.json', 'utf8');
                channelConfig = JSON.parse(data);
            } catch (error) {
                console.error('Error reading channel.json:', error);
            }

            // Update configuration based on user input
            const interval = interaction.options.getInteger('interval');
            const minInterval = interaction.options.getInteger('min');
            const maxInterval = interaction.options.getInteger('max');
            const amount = interaction.options.getInteger('amount');

            // Validate intervals
            if (minInterval >= maxInterval) {
                await interaction.reply({ content: 'Minimum interval must be less than maximum interval.', ephemeral: true });
                return;
            }

            // Update channelConfig with new interval and amount
            channelConfig.interval = interval;
            channelConfig.minInterval = minInterval;
            channelConfig.maxInterval = maxInterval;
            channelConfig.amount = amount;

            // Save the updated channelConfig to file
            fs.writeFileSync('channel.json', JSON.stringify(channelConfig, null, 2));

            await interaction.reply(`Configuration updated: Default Interval set to ${interval} seconds, Min Interval set to ${minInterval}, Max Interval set to ${maxInterval}, Amount set to ${amount}.`);
        } catch (error) {
            console.error('Error setting configuration:', error);
            await interaction.reply({ content: 'There was an error while setting the configuration.', ephemeral: true });
        }
    },
};
