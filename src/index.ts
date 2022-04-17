import Discord, { MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js'
import { DiscordTogether } from 'discord-together'

const token = process.env.TOKEN || ''
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] })
const together = new DiscordTogether(client)

client.on('ready', () => {
  console.log('Ready!')
})

client.on('messageCreate', async message => {
  if (message.author.bot) return
  if (message.guild?.ownerId !== message.author.id) return
  if (message.content === 'panel') {
    const activities = Object.keys(together.applications)

    const panel = new MessageSelectMenu()
      .setCustomId('select')
      .setPlaceholder('Select Activitie')
      .addOptions(activities.filter(v => !v.includes('dev')).map(v => {
        return { label: v.replace(/\b[a-z]/, letter => letter.toUpperCase()), value: v }
      }))
    const row = new MessageActionRow()
      .addComponents(panel)
    const embed = new MessageEmbed()
      .setTitle('Activities')
      .setDescription('Select activitie')
      .setColor('#7289da')
      .setImage('https://media.discordapp.net/attachments/906450321444831233/965075047612035162/image.png')
    message.channel.send({ embeds: [embed], components: [row] })
  }
})

client.on('interactionCreate', async I => {
  if (!I.member) return
  if (!I.guildId) return
  if (!I.isSelectMenu()) return
  if (I.customId !== 'select') return

  const [select] = I.values
  if (!select) return I.reply({ content: 'Select activitie!', ephemeral: true })

  const guild = client.guilds.cache.get(I.guildId)
  const member = guild?.members.cache.get(I.member?.user.id)
  const voiceChannel = await member?.voice.channel
  if (!voiceChannel) return I.reply({ content: 'You are not in voice channel', ephemeral: true })

  const { code } = await together.createTogetherCode(voiceChannel.id, select)
  const embed = new MessageEmbed()
    .setTitle('Activites!')
    .setDescription(code)
  return I.reply({ embeds: [embed], ephemeral: true })
})

client.login(token)
