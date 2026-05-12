// Polyfill `toReversed` for Node versions that don't implement it (e.g., older v18)
if (typeof Array.prototype.toReversed !== 'function') {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value: function toReversed() {
      return Array.prototype.slice.call(this).reverse();
    },
    configurable: true,
    writable: true,
  });
}

const { getDefaultConfig } = require('@expo/metro-config');
module.exports = getDefaultConfig(__dirname);
