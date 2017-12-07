export default {
  toLabel: string => string
    .replace('-', ' ')
    .replace(/(^|\s)([a-z])/g, m => m.toUpperCase()),
};