module.exports = string =>
  string
    .split('')
    .reduce((acc, val) => {
      const charCode = val.charCodeAt(0);

      if (charCode >= 32 && charCode <= 126) {
        acc += val;
      }

      return acc;
    }, '')
    .trim()
    .replace(/ *\([^)]*\) */g, ' ');
