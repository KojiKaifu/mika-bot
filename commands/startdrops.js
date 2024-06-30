const { SlashCommandBuilder } = require('discord.js');
const { startRandomMessages } = require('../randomMessages'); // Import startRandomMessages from randomMessages.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startdrops')
        .setDescription('Start sending random drops'),
    async execute(interaction) {
        global.randomDropsActive = true;
        startRandomMessages(); // Call the function to start random drops
        await interaction.reply({ content: 'Random drops started.', ephemeral: true });
    },
};
