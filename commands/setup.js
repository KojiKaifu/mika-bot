const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// Define the ID of the role that can edit balances
const allowedRoleId = '1138528870673416383';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Set the channel for random messages')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to send messages to').setRequired(true)),
    async execute(interaction) {
        try {
            // Check if the user has the required roles
            if (!interaction.member.roles.cache.has(allowedRoleId)) {
                await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
                return;
            }

            const channel = interaction.options.getChannel('channel');

            // Read existing channel data
            let channelConfig = {};
            try {
                const data = fs.readFileSync('channel.json', 'utf8');
                channelConfig = JSON.parse(data);
            } catch (error) {
                console.error('Error reading channel.json:', error);
            }

            // Update or set the channel ID in channelConfig
            channelConfig.channelId = channel.id;

            // Save the updated channelConfig to file
            fs.writeFileSync('channel.json', JSON.stringify(channelConfig, null, 2));

            await interaction.reply(`Channel set to ${channel.name}`);
        } catch (error) {
            console.error('Error setting up channel:', error);
            await interaction.reply({ content: 'There was an error while setting up the channel.', ephemeral: true });
        }
    },
};

// Function to check if the user has the required roles
function hasPermission(interaction) {
    // Define your role IDs here that are allowed to use the setup command
    const allowedRoleIds = ['YOUR_ROLE_ID_HERE'];

    // Check if the user has any of the allowed roles
    return interaction.member.roles.cache.some(role => allowedRoleIds.includes(role.id));
}
