function rgb(red, green, blue) {
  const open = `\u001b[38;2;${red};${green};${blue}m`;
  const close = '\u001b[39m';
  return function(text) {
      return `${open}${text}${close}`;
  };
}

module.exports = rgb;