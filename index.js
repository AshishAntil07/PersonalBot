const fs = require('fs');
const rgb = require('./utils/rgb');
const afk = require('./utils/afk');
const Insta = require('@androz2091/insta.js');

const client = new Insta.Client();

// cleaning runtime_logs.log
fs.writeFileSync('./logs/runtime_logs.log', '');

function logger(...message){
  console.log(...message);

  fs.appendFileSync('./logs/runtime_logs.log', message.join(' ') + '\n');
}

process.on('uncaughtException', (err) => {
  logger(`\n${'Uncaught Exception!'}\n${err.stack}\n`);

  process.exit(1);
});

(async () => {
  const { green, yellow, blue, red, cyan, bgGreen, bgRed, bold } = (await import('chalk')).default;
  const orange = rgb(255, 165, 0);


  // On connection to Instagram.
  client.on('connected', () => {
    logger(`\n${bgGreen('Connected to Instagram!')}\n  ${bold(orange('As:'))} ${client.user.username}\n`);
  })

  const greet = ['hello', 'hi', 'aur basanti', 'hey', 'hola', 'namaste', 'hlo'];

  let isBotInteraction = false;

  client.on('messageCreate', (message) => {
    
    // On Message, log to console. format -> [MESSAGE] <time> <username>
    logger(`\n${cyan('[MESSAGE] ')} ${green(Date.now())} ${message.author.username}`);

    
    const chatMessage = [new Date()]+' '+message.author.username+' '+message.content;

    // Save to /chat/<username>.txt, if exists. else make file.
    fs.existsSync(`./chats/${message.chat.name || message.chat.id}.txt`) || fs.writeFileSync(`./chats/${message.chat.name || message.chat.id}.txt`, '');
    fs.appendFileSync(`./chats/${message.chat.name || message.chat.id}.txt`, `${chatMessage}\n`);

    // On successfully saving to file, log to console.
    logger(`${yellow('[INFO]')} Saved to file!\n`);

    // If message is from bot or from owner, return.
    if (message.author.id === client.user.id && !isBotInteraction) {

      // message from owner and not bot. unset afk
      afk.unset(message.chat.id);

      if(message.content === 'SET AFK' || message.content === 'SET AFK!') {
        const isGlobal = message.content.includes('!');

        if(isGlobal){
          afk.set('GLOBAL');
        } else {
          afk.set(message.chat.id);
        }

        // log to console
        logger(`${orange('[INFO]')} AFK set!`);

        message.chat.send('AFK set'+isGlobal?'!':'');
      }
      return;
    };

    // return if it's the first message in the chat.
    if (message.chat.messages.clone().array().length === 1) return;


    // If author is not bot or owner, reply to the interaction.

    isBotInteraction = true;
    // if chat in afk, reply with afk message.
    if (afk.isAFK(message.chat.id)) {
      logger(`${red('[INFO]')} Replying to afk!`);
      message.chat.send('I am afk. I will reply when I am back.');
      return;
    }

    // greeting
    if (greet.includes(message.content?.toLowerCase())) {
      logger(`${blue('[INFO]')} Replying to greeting!`);
      message.chat.send(greet[Math.floor(Math.random() * greet.length)+' '+message.author.username]);
    }
  });

  logger(`${yellow('Logging in...')}\n`);
  client.login(process.env.INSTA_ACCOUNT_USERNAME, process.env.INSTA_PASSWORD);
})();