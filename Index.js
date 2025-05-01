const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = 'SEU_TOKEN_AQUI';

// Cargos com permissão para setar/remover "membro"
const cargosPermissaoMembro = ['1322946577144352861', '1322946694567956572'];

// Cargo Coronel (permite gerenciar Adjunto)
const cargoCoronelID = '1322946577144352861';

// Cargos para serem atribuídos/removidos
const cargoAdjuntoID = '1322946694567956572';
const cargoMembroID = '1322946870418473031';

client.on('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(' ');
  const comando = args[0];
  const membro = message.mentions.members.first();

  // Verificação para todos os comandos que exigem menção
  if ((comando === '+setmembro' || comando === '+rtmembro' || comando === '+setadj' || comando === '+rtadj') && !membro) {
    return message.reply('Mencione um usuário válido.');
  }

  // +setmembro
  if (comando === '+setmembro') {
    const autorizado = cargosPermissaoMembro.some(id => message.member.roles.cache.has(id));
    if (!autorizado) return message.reply('Você não tem permissão para usar esse comando.');

    try {
      await membro.roles.add(cargoMembroID);
      message.reply(`Cargo de membro adicionado para ${membro.user.username}.`);
    } catch (error) {
      console.error(error);
      message.reply('Erro ao adicionar o cargo.');
    }
  }

  // +rtmembro
  if (comando === '+rtmembro') {
    const autorizado = cargosPermissaoMembro.some(id => message.member.roles.cache.has(id));
    if (!autorizado) return message.reply('Você não tem permissão para usar esse comando.');

    try {
      await membro.roles.remove(cargoMembroID);
      message.reply(`Cargo de membro removido de ${membro.user.username}.`);
    } catch (error) {
      console.error(error);
      message.reply('Erro ao remover o cargo.');
    }
  }

  // +setadj
  if (comando === '+setadj') {
    if (!message.member.roles.cache.has(cargoCoronelID)) {
      return message.reply('Você não tem permissão para usar esse comando.');
    }

    try {
      await membro.roles.add(cargoAdjuntoID);
      message.reply(`Cargo de adjunto adicionado para ${membro.user.username}.`);
    } catch (error) {
      console.error(error);
      message.reply('Erro ao adicionar o cargo.');
    }
  }

  // +rtadj
  if (comando === '+rtadj') {
    if (!message.member.roles.cache.has(cargoCoronelID)) {
      return message.reply('Você não tem permissão para usar esse comando.');
    }

    try {
      await membro.roles.remove(cargoAdjuntoID);
      message.reply(`Cargo de adjunto removido de ${membro.user.username}.`);
    } catch (error) {
      console.error(error);
      message.reply('Erro ao remover o cargo.');
    }
  }
});

client.login(process.env.TOKEN);
    
