const { join } = require('path');

module.exports = {
  mixins: [
    join(__dirname, 'logger'),
    join(__dirname, 'doctor'),
    join(__dirname, 'web-vitals'),
  ],
};
