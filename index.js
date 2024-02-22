const fs = require('fs');
const rgb = require('./utils/rgb');
const afk = require('./utils/afk');
const Insta = require('@androz2091/insta.js');
const { exec } = require('child_process');

require('dotenv').config();

const client = new Insta.Client();

// cleaning runtime_logs.log and create logs directory if not present.
fs.existsSync('./logs/') || fs.mkdirSync('./logs/');
fs.writeFileSync('./logs/runtime_logs.log', '')

function logger(...message){
  console.log(...message);

  fs.appendFileSync('./logs/runtime_logs.log', message.join(' ') + '\n');
}

process.on('uncaughtException', (err) => {
  logger(`\n${'Uncaught Exception: '+err.name}\n${err.message}\n${err.stack}\n`);

  process.exit(1);
});

(async () => {
  const { green, yellow, blue, blueBright, red, cyan, bgGreen, bgRed, bold } = (await import('chalk')).default;
  const orange = rgb(255, 165, 0);

  const BOT_PREFIX = process.env.BOT_PREFIX || '[BOT] ';
  const COMMAND_PREFIX = process.env.COMMAND_PREFIX || '!';


  // On connection to Instagram.
  client.on('connected', () => {
    logger(`\n${bgGreen('Connected to Instagram!')}\n  ${bold(orange('As:'))} ${client.user.username}\n`);
  })

  const greet = ['Hello', 'Hi', 'Aur Basanti', 'Hey', 'Hola', 'Namaste', 'Hlo'];


  client.on('messageCreate', (message) => {
    
    const chatMessage = `[`+new Date()+`]`+' '+message.author.username+' '+message.content;

    // Save to /chat/<username>.txt, if exists. else make file.
    fs.existsSync(`./chats/${message.chat.name || message.chat.id}.txt`) || fs.writeFileSync(`./chats/${message.chat.name || message.chat.id}.txt`, '');
    fs.appendFileSync(`./chats/${message.chat.name || message.chat.id}.txt`, `${chatMessage}\n`);

    // On successfully saving to file, log to console.
    logger(`${yellow('[INFO]')} Saved to file!\n`);

    // If message is from bot or from owner.
    if (message.author.id === client.user.id && message.content.startsWith(BOT_PREFIX)) return;

    // On Message, log to console. format -> [MESSAGE] <chat.name || chat.id> <time> <username>
    logger(`\n${cyan('[MESSAGE] ')} ${blueBright(message.chat.name || message.chat.id)} ${green(Date.now())} ${message.author.username}`);

    if(message.author.id === client.user.id){
      if(afk.isAFK(message.chat.id)){
        logger(`${orange('[INFO]')} Unsetting AFK from ${message.chat.id}!`);
        // message from owner and not bot. unset afk
        afk.unset(message.chat.id);
      }


      // for commands

      if(!message.content.startsWith(COMMAND_PREFIX)) return;

      const command = message.content.slice(COMMAND_PREFIX.length).split(' ')[0].toUpperCase();  

      if(command === 'SET-AFK' || command === 'GSET-AFK') {
        const isGlobal = command.startsWith('G');

        if(isGlobal){
          afk.set('GLOBAL');
        } else {
          afk.set(message.chat.id);
        }

        // log to console
        logger(`${orange('[INFO]')} AFK set!`);

        message.chat.sendMessage(BOT_PREFIX+'AFK set'+(isGlobal?'!':''));
      }
      return;
    }

    // return if it's the first message in the chat.
    if (message.chat.messages.clone().array().length === 1) return;


    // If author is not bot or owner, reply to the interaction.

    // if chat in afk, reply with afk message.
    if (afk.isAFK(message.chat.id)) {
      logger(`${red('[INFO]')} Replying to afk!`);
      message.chat.sendMessage(BOT_PREFIX+'I am afk. I will reply when I am back.');
      return;
    }

    // greeting
    if (message.content && containsSubstrings(message.content, greet, false)) {
      logger(`${blue('[INFO]')} Replying to greeting!`);
      message.chat.sendMessage(BOT_PREFIX+greet[Math.floor(Math.random() * greet.length)]+' '+message.author.username);
    }else if(containsSubstrings(message.content, ['thik hai', 'theek hai', 'ok'], false)){
      logger(`${blue('[INFO]')} Replying to "ok"!`);
      message.chat.sendMessage(BOT_PREFIX+':)');
    }
  });

  logger(`${yellow('Logging in...')}\n`);
  // console.log(process.env.INSTA_ACCOUNT_USERNAME, process.env.INSTA_PASSWORD)
  client.login(process.env.INSTA_ACCOUNT_USERNAME, process.env.INSTA_PASSWORD);
})();

/**
 * This function returns if any from a list of substrings is in the given string.
 * @param {String} str The string to search in
 * @param {Object} arr The array of substrings to search in given string
 * @param {Boolean} matchCase Whether to match case or not.
 * @returns {Boolean}
 */
const containsSubstrings = (str, arr, matchCase=false) => {
  let found=false;
  arr.every(elem => {
    if((!matchCase?str.toLowerCase():str).includes(!matchCase?elem.toLowerCase():elem)){
      found=true
      return false
    }
    return true
  })
  return found
}