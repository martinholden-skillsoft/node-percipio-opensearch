const _ = require('lodash');
const moment = require('moment');

/**
 * Convert and ISO Duration value to a friendly display string
 *
 * @param {string} isoDuration - The ISO duration string
 * @param {string} [units=minutes] - A valid moment unit [hours|minutes|seconds|milliseconds]
 * @param {boolean} [roundDown=false] - Round down the value to whole number
 * @param {string} [prefix=''] - A prefix string to add
 * @example
 * // returns '15 minutes'
 * getFriendlyDuration('PT0H15M0S')
 * @example
 * // returns '1.5 hours'
 * getFriendlyDuration('PT1H30M5S', 'hours', true);
 * @returns {string} Friendly duration string
 */
const getFriendlyDuration = (isoDuration, units, roundDown, prefix) => {
  // Check if valid units option
  const unit = /^(hours|minutes|seconds|milliseconds)$/.test(units) ? units : 'minutes';
  // Check if we are rounding the value
  const rounddown = _.isBoolean(roundDown) ? roundDown : false;

  let value = moment.duration(isoDuration).as(unit);

  if (rounddown) {
    value = Math.round(value);
  }

  return value !== 0 ? `${_.isNil(prefix) ? '' : prefix}${value} ${unit}` : '';
};

/**
 * Return a Markdown text to indicate the modality
 *
 * @param {object} request - Percipio parameters for /search-content
 * @returns
 */
const getModalityMarkdown = (request) => {
  let modalityString = '';

  if (_.isObject(request) && request.modality) {
    // READ, WATCH, LISTEN, PRACTICE

    switch (_.upperCase(request.modality).substring(0, 4)) {
      case 'READ': // READ
        modalityString = ' that you can *READ ABOUT*';
        break;
      case 'WATC': // WATCH
        modalityString = ' that you can *WATCH*';
        break;
      case 'LIST': // LISTEN
        modalityString = ' that you can *LISTEN TO*';
        break;
      case 'PRAC': // PRACTICE
        modalityString = ' that you can *PRACTICE WITH*';
        break;
      default:
        break;
    }
  }
  return modalityString;
};

module.exports = {
  getFriendlyDuration,
  getModalityMarkdown,
};
