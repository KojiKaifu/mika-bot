const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

// Define the ID of the role that can edit balances
const allowedRoleId = '1138528870673416383';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('editbalance')
        .setDescription('Edit user balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose balance to edit')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount to add (positive) or set (negative to subtract)')
                .setRequired(true)),
    async execute(interaction) {
        // Check if user has the allowed role
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const userId = interaction.options.getUser('user').id;
        const amount = interaction.options.getInteger('amount');

        try {
            const currencyData = JSON.parse(fs.readFileSync('currency.json', 'utf8'));

            // Fetch current balance
            let currentBalance = currencyData[userId] ? currencyData[userId].currency : 0;

            // Update balance
            currentBalance += amount;

            // Ensure balance doesn't go below 0
            if (currentBalance < 0) {
                currentBalance = 0;
            }

            // Update currency data
            currencyData[userId] = {
                username: interaction.options.getUser('user').username,
                currency: currentBalance
            };

            // Save updated currency data
            fs.writeFileSync('currency.json', JSON.stringify(currencyData, null, 2));

            await interaction.reply(`Successfully updated ${interaction.options.getUser('user').username}'s balance to ${currentBalance}.`);
        } catch (error) {
            console.error('Error editing balance:', error);
            await interaction.reply({ content: 'There was an error while editing the balance.', ephemeral: true });
        }
    },
};
