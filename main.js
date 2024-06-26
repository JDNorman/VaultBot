//CONSTANTS AND SETUP -------------------------------------------------\\

//discord requires
const { ActionRowBuilder, messageLink } = require('discord.js');
const { ActivityType } = require('discord.js');
const { ButtonBuilder } = require('discord.js');
const { ButtonStyle } = require('discord.js');
const { Client } = require('discord.js');
const { Collection } = require('discord.js');
const { CommandInteraction } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { Events } = require('discord.js');
const { Intents } = require('discord.js');
const { IntentsBitField } = require('discord.js');
const { MessageActionRow } = require('discord.js');
const { MessageAttachment } = require('discord.js');
const { MessageButton } = require('discord.js');
const { MessageCollector } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { MessageMentions } = require('discord.js');
const { MessageSelectMenu } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { Permissions } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

//config requires
const { token } = require('./config.json');
const { chatid } = require('./config.json');
const { commandsid } = require('./config.json');
const { vualtid } = require('./config.json');

//other setup
const fs = require('node:fs');
const path = require('node:path');
const readline = require('readline');
const { DateTime } = require('luxon');
const mineflayer = require('mineflayer');
const { channel } = require('node:diagnostics_channel');

//CONSTANTS AND SETUP -------------------------------------------------//
//
//
//
//INTENTS SETUP -------------------------------------------------------\\

const myIntents = new IntentsBitField();

myIntents.add(
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessages,   
    IntentsBitField.Flags.DirectMessageTyping,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildInvites,  
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages, 
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.Guilds, 
    IntentsBitField.Flags.GuildScheduledEvents,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildWebhooks, 
    IntentsBitField.Flags.MessageContent,
)

const client = new Client({ 
    intents: myIntents,
});

//INTENTS SETUP -------------------------------------------------------//
//
//
//
//APPLICATION FILEPATH SETUP ------------------------------------------\\

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
// Set a new item in the Collection with the key as the command name and the value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } 
  else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

//APPLICATION FILEPATH SETUP ------------------------------------------//
//
//
//
//APPLICATION COMMANDS SETUP ------------------------------------------\\

client.on("ready", async () => {
    try {
      await client.application.commands.set([]);
      console.log('Slash commands registered!');
    } catch (error) {
      console.error(error);
    }
    console.log(`Logged in as ${client.user.tag}!`);
    
    //Activity type
    client.user.setActivity('/help', { type: ActivityType.Listening });
    
  });

//APPLICATION COMMANDS SETUP ------------------------------------------//
//
//
//
//PREFIX COMMAND HANDLER SETUP ----------------------------------------\\

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) {
      return;
    }
  
    const command = interaction.client.commands.get(interaction.commandName);
  
    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
  
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
  
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
  
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }

  });

//PREFIX COMMAND HANDLER SETUP ----------------------------------------//
//
//
//
//MINEFLAYER SETUP -----------------------------------------------------\\

// load discord.js
const options = {
    host: '47.32.247.54',
    port: 25566
}

class MCBot {

  // Constructor
  constructor(username) {
      this.username = username;
      this.host = botArgs["host"];
      this.port = botArgs["port"];

      this.initBot();
  }

  // Init bot instance
  initBot() {
      this.bot = mineflayer.createBot({
          "username": this.username,
          "host": this.host,
          "port": this.port,
      });

      this.initEvents()
  }

  // Init bot events
  initEvents() {
      this.bot.on('login', () => {
          let botSocket = this.bot._client.socket;
          console.log(`[${this.username}] Logged in to ${botSocket.server ? botSocket.server : botSocket._host}`);
      });

      this.bot.on('end', (reason) => {
          console.log(`[${this.username}] Disconnected: ${reason}`);
  
          if (reason == "disconnect.quitting") {
              return
          }
  
          // Attempt to reconnect
          setTimeout(() => this.initBot(), 5000);
      });

      this.bot.on('spawn', async () => {
          console.log(`[${this.username}] Spawned in`);
          this.bot.chat("Hello!");
  
          await this.bot.waitForTicks(60);
          this.bot.chat("Goodbye");
          this.bot.quit();
      });

      this.bot.on('error', (err) => {
          if (err.code == 'ECONNREFUSED') {
              console.log(`[${this.username}] Failed to connect to ${err.address}:${err.port}`)
          }
          else {
              console.log(`[${this.username}] Unhandled error: ${err}`);
          }
      });

      client.once('ready', (c) => {
        const chat_channel = client.channels.cache.get(chatid)
        if (!channel) {
          console.log(`I could not find the channel (${chat_channel})!`);
        }
      });

      client.on('messageCreate', (msg) => {
        if (msg.channel.id !== channel.id) return;
        if (msg.author.id === client.user.id) return;
        this.bot.chat(`${msg.author.username}: ${msg.content}`);
      });

      this.bot.on('chat', (username, msg) => {
        
      })

  }
}



// // redirect in-game messages to discord channel
// bot.on('chat', (username, message) => {
//     const chat_channel = client.channels.cache.get(chatid)

//     // ignore messages from the bot itself
//     if (username === bot.username) return

//     chat_channel.send(`${username}: ${message}`)
// })

bot.on('kicked', console.log)
bot.on('error', console.log)

//MINEFLAYER SETUP -----------------------------------------------------//
//
//
//
//PROGRAM END ----------------------------------------------------------\\

//Token
client.login(token);

//Exports
module.exports = { client };

//PROGRAM END ----------------------------------------------------------//