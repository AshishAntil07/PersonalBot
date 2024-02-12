const afkFor = {};

/**
 * Set AFK for the chat.
 * @param { Number | String } user The chat ID to set afk on, or 'GLOBAL' to set afk for all chats.
 */
function set(user){
  afkFor[user] = true;
  if(user==='GLOBAL'){
    for(let user in afkFor){
      afkFor[user] = true;
    }
  }
}

/**
 * Unset AFK for the chat.
 * @param { Number | String } user The chat ID to unset afk on, or 'GLOBAL' to unset afk for all chats.
 */
function unset(user){
  afkFor[user] = false;
  if(user==='GLOBAL'){
    for(let user in afkFor){
      afkFor[user] = false;
    }
  }
}


/**
 * Check afk for chats.
 * @param { Number } user The chat ID to check if afk.
 * @returns { void }
 */
function isAFK(user){
  return afkFor[user] || afkFor['GLOBAL'];
}

module.exports = {
  set,
  unset,
  isAFK
}