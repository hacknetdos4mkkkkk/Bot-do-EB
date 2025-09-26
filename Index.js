const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, EmbedBuilder, ChannelType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Coloque seu token e clientId abaixo
const token = 'MTQxODk2NDA0NzQ0NDgzNjM3NA.GfUphB.W_nmf7MFruPThbfCU0nC_80-AM4ggpDv5Q3VFU';
const clientId = '1418964047444836374';
const guildIds = ['1418381665092505602', '1416430866472894628', '1362222750785212578', '1414702483397152850'];
const allowedRoleIds = ['1418065695165386814', '1419385415051247896', '1417935457278234785', '1419483031131000983', '1413854966568714402'];

// ========================
// Comandos Slash (roleatt removido)
// ========================
const comandos = [
  new SlashCommandBuilder()
    .setName('msg')
    .setDescription('Envia uma mensagem no estilo das regras.')
    .addStringOption(option =>
      option.setName('canal').setDescription('ID do canal').setRequired(true))
    .addStringOption(option =>
      option.setName('titulo').setDescription('Título da seção').setRequired(true))
    .addStringOption(option =>
      option.setName('conteudo').setDescription('Conteúdo da mensagem').setRequired(true))
    .addStringOption(option =>
      option.setName('cor').setDescription('Nome da cor: vermelho, azul, verde, etc').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ccanal')
    .setDescription('Cria múltiplos canais com o nome especificado.')
    .addStringOption(option =>
      option.setName('nome').setDescription('Nome base do canal').setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantidade').setDescription('Quantidade de canais a criar').setRequired(true)),

  new SlashCommandBuilder()
    .setName('dall')
    .setDescription('Deleta uma quantidade específica de canais do servidor.')
    .addIntegerOption(option =>
      option.setName('quantidade').setDescription('Quantidade de canais a deletar').setRequired(true)),

  new SlashCommandBuilder()
    .setName('delcat')
    .setDescription('Deleta uma categoria e todos os canais dentro dela.')
    .addStringOption(option =>
      option.setName('categoria').setDescription('ID da categoria a ser deletada').setRequired(true))
]
.map(command => command.toJSON());

// Registrar os comandos para cada guild
const rest = new REST({ version: '10' }).setToken(token);
(async () => {
  for (const guildId of guildIds) {
    try {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: comandos });
      console.log(`Comandos registrados para guild: ${guildId}`);
    } catch (error) {
      console.error(`Erro ao registrar comandos para guild ${guildId}:`, error);
    }
  }
  console.log('Registro de comandos concluído.');
})();

// ========================
// Cores personalizadas
// ========================
const cores = {
  vermelho: 0xFF0000,
  azul: 0x0000FF,
  verde: 0x00FF00,
  amarelo: 0xFFFF00,
  roxo: 0x800080,
  laranja: 0xFFA500,
  cinza: 0x808080,
  preto: 0x000000,
};

// ========================
// Função de atualização automática de apelidos
// ========================
async function atualizarApelidos(guild) {
  try {
    await guild.members.fetch();
    const members = Array.from(guild.members.cache.values());

    const cargos = [
      { id: '1420247206635769856', tag: '[Fe]' },
      { id: '1417554388393922620', tag: '[Mod]' },
      { id: '1417554368575836171', tag: '[Cmt]' },
      { id: '1417554369846448219', tag: '[SCmt]' },
      { id: '1417554371738210424', tag: '[Gen Ex]' },
      { id: '1417554372342186005', tag: '[Gen Div]' },
      { id: '1417554373172658278', tag: '[Gen Bda]' },
      { id: '1417554373785157884', tag: '[Cel]' },
      { id: '1417554374581948546', tag: '[TenCel]' },
      { id: '1417554375622262786', tag: '[Maj]' },
      { id: '1417554376905592902', tag: '[Cap]' },
      { id: '1417554377572352084', tag: '[1° Ten]' },
      { id: '1417554378826584095', tag: '[2° Ten]' },
      { id: '1417554379585753271', tag: '[Asp]' },
      { id: '1417554380747706408', tag: '[St]' },
      { id: '1417554381632438282', tag: '[1° Sgt]' },
      { id: '1417554382639206450', tag: '[2° Sgt]' },
      { id: '1417554383893172307', tag: '[3° Sgt]' },
      { id: '1417554386196103169', tag: '[Cb]' },
      { id: '1417554387357925416', tag: '[Rct]' }
    ];

    const regexTags = /^\[(Fe|Mod|Cmt|SCmt|Gen Ex|Gen Div|Gen Bda|Cel|TenCel|Maj|Cap|1° Ten|2° Ten|Asp|St|1° Sgt|2° Sgt|3° Sgt|Cb|Sd|Rct)\]\s*/;

    for (const member of members) {
      if (member.user.bot) continue;

      let novoApelido = member.displayName;
      let precisaAtualizar = false;

      let tagCorreta = null;
      for (const cargo of cargos) {
        if (member.roles.cache.has(cargo.id)) {
          tagCorreta = cargo.tag;
          break;
        }
      }

      if (tagCorreta) {
        if (!novoApelido.startsWith(tagCorreta)) {
          novoApelido = novoApelido.replace(regexTags, '');
          novoApelido = `${tagCorreta} ${novoApelido}`;
          precisaAtualizar = true;
        }
      } else if (regexTags.test(novoApelido)) {
        novoApelido = novoApelido.replace(regexTags, '');
        precisaAtualizar = true;
      }

      if (precisaAtualizar && member.manageable) {
        try {
          await member.setNickname(novoApelido);
        } catch (err) {
          console.error(`Erro ao atualizar apelido de ${member.user.tag}:`, err);
        }
      }
    }
  } catch (err) {
    console.error(`Erro ao atualizar apelidos em ${guild.name}:`, err);
  }
}

// ========================
// Interações de Slash Commands (restantes)
// ========================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userRoles = interaction.member.roles.cache;
  const hasPermission = allowedRoleIds.some(roleId => userRoles.has(roleId));
  if (!hasPermission) {
    return interaction.reply({
      content: '❌ Você não tem permissão para usar este comando!',
      ephemeral: true
    });
  }

  if (interaction.commandName === 'msg') {
    const canalId = interaction.options.getString('canal');
    const titulo = interaction.options.getString('titulo');
    const conteudo = interaction.options.getString('conteudo');
    const cor = interaction.options.getString('cor').toLowerCase();

    const canal = await client.channels.fetch(canalId).catch(() => null);
    if (!canal || !canal.isTextBased()) {
      return interaction.reply({ content: 'Canal inválido.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(conteudo)
      .setColor(cores[cor] || 0xffffff);

    await canal.send({ embeds: [embed] });
    await interaction.reply({ content: 'Mensagem enviada com sucesso!', ephemeral: true });
  }

  if (interaction.commandName === 'ccanal') {
    const nomeBase = interaction.options.getString('nome');
    const quantidade = interaction.options.getInteger('quantidade');
    const guild = interaction.guild;
    let criados = 0;

    for (let i = 1; i <= quantidade; i++) {
      try {
        await guild.channels.create({
          name: `${nomeBase}-${i}`,
          type: ChannelType.GuildText,
        });
        criados++;
      } catch (err) {
        console.error(`Erro ao criar canal ${nomeBase}-${i}:`, err);
      }
    }
    await interaction.reply({ content: `✅ ${criados} canais criados com sucesso!`, ephemeral: true });
  }

  if (interaction.commandName === 'dall') {
    const quantidade = interaction.options.getInteger('quantidade');
    const guild = interaction.guild;

    const canais = guild.channels.cache.filter(channel =>
      channel.type === ChannelType.GuildText ||
      channel.type === ChannelType.GuildVoice ||
      channel.type === ChannelType.GuildNews ||
      channel.type === ChannelType.GuildStageVoice ||
      channel.type === ChannelType.GuildForum
    );

    const canaisOrdenados = canais.sort((a, b) => b.createdTimestamp - a.createdTimestamp);
    if (quantidade > canaisOrdenados.size) {
      return interaction.reply({
        content: `❌ Só existem ${canaisOrdenados.size} canais disponíveis para deletar!`,
        ephemeral: true
      });
    }

    let deletados = 0;
    const canaisParaDeletar = canaisOrdenados.first(quantidade);
    for (const canal of canaisParaDeletar.values()) {
      try {
        await canal.delete();
        deletados++;
      } catch (err) {
        console.error(`Erro ao deletar canal ${canal.name}:`, err);
      }
    }
    await interaction.reply({ content: `🗑️ ${deletados} canais deletados com sucesso!`, ephemeral: true });
  }

  if (interaction.commandName === 'delcat') {
    const categoriaId = interaction.options.getString('categoria');
    const guild = interaction.guild;
    await interaction.deferReply({ ephemeral: true });

    try {
      const categoria = guild.channels.cache.get(categoriaId);
      if (!categoria || categoria.type !== ChannelType.GuildCategory) {
        return interaction.editReply({ content: '❌ Categoria não encontrada ou ID inválido!' });
      }

      const canaisNaCategoria = guild.channels.cache.filter(canal => canal.parentId === categoriaId);
      let canaisDeletados = 0;
      for (const canal of canaisNaCategoria.values()) {
        try {
          await canal.delete();
          canaisDeletados++;
        } catch (err) {
          console.error(`Erro ao deletar canal ${canal.name}:`, err);
        }
      }
      await categoria.delete();
      await interaction.editReply({
        content: `✅ Categoria "${categoria.name}" deletada com sucesso!\n🗑️ ${canaisDeletados} canais também foram deletados.`
      });
    } catch (error) {
      console.error('Erro no comando delcat:', error);
      await interaction.editReply({ content: '❌ Erro ao deletar a categoria. Verifique permissões do bot.' });
    }
  }
});

// ========================
// Bot pronto + loop de atualização automática
// ========================
client.on('ready', () => {
  console.log(`✅ Bot ${client.user.tag} está online e pronto!`);
  console.log(`🏆 Conectado em ${client.guilds.cache.size} servidores`);

  client.guilds.cache.forEach(guild => {
    // Atualiza apelidos a cada 5 segundos (ajuste se necessário)
    setInterval(() => atualizarApelidos(guild), 5000);
  });
});

// Fazer login do bot
client.login(token);
