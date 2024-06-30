const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stopdrops')
        .setDescription('Stop sending random drops'),
    async execute(interaction) {
        global.randomDropsActive = false;
        clearTimeout(global.timeoutId); // Clear any existing timeout
        await interaction.reply({ content: 'Random drops stopped.', ephemeral: true });
    },
};
