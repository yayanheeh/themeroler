export default {
  toLabel: string => string
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace('color', '')
    .trim(),

  toId: string => string
    .replace(/\s+/, '-')
    .toLowerCase(),

  capitalize: string => string
    .replace(/^([a-z])/, m => m.toUpperCase()),

  capitalizeAll: string => string
    .replace(/(^|\s)([a-z])/g, m => m.toUpperCase()),

};
