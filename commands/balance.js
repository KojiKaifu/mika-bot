const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your currency balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check the balance for')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const userId = interaction.options.getUser('user')?.id || interaction.user.id;
            const member = interaction.guild.members.cache.get(interaction.user.id);

            // Check if the member has the required role (adjust 'roleId' with your actual role ID)
            const roleId = 'YOUR_ROLE_ID_HERE'; // Replace with your role ID
            if (!member.roles.cache.has(roleId) && interaction.options.getUser('user')) {
                await interaction.reply({ content: 'You do not have permission to check other users\' balances.', ephemeral: true });
                return;
            }

            // Fetch balance from currency.json
            const balance = await fetchBalance(userId);

            if (userId === interaction.user.id) {
                await interaction.reply(`Your current balance is ${balance} currency.`);
            } else {
                const userOption = interaction.options.getUser('user');
                await interaction.reply(`${userOption.username}'s current balance is ${balance} currency.`);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
            await interaction.reply({ content: 'There was an error while fetching the balance.', ephemeral: true });
        }
    },
};

// Function to fetch balance from currency.json
async function fetchBalance(userId) {
    try {
        const data = fs.readFileSync('currency.json', 'utf8');
        const currencyData = JSON.parse(data);
        
        // Check if the user's data exists
        if (currencyData[userId]) {
            return currencyData[userId].currency;
        } else {
            return 0; // Default to 0 if user data doesn't exist
        }
    } catch (error) {
        console.error('Error reading currency balances:', error);
        return 0;
    }
}
