const { SlashCommandBuilder } = require('discord.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testbutton')
        .setDescription('Creates a button'),
        async execute(interaction) {
            const target = interaction.options.getUser('target');
            const reason = interaction.options.getString('reason') ?? 'No reason provided';
    
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Claim')
                .setStyle(ButtonStyle.Success);
    
            const row = new ActionRowBuilder()
                .addComponents(confirm);
    
            await interaction.reply({
                content: `Press the button below to claim a $50 drop`,
                components: [row],
            });
        },
};
