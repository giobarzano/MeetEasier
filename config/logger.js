const winston = require('winston'),
  exchangeWebService = require("ews-javascript-api"),
  { combine, timestamp, printf } = winston.format;

const npmConfig = winston.config.npm;

// Container with all private functions, which will be exported, to support mocking of functions
const API = {
  _getLogLevel,
  _isHigherOrEqualSeverity
};

module.exports = {
  "default": _createLogger(),
  logLevels: Object.keys(npmConfig.levels).reduce((res, name) => Object.assign(res, { [name]: name }), {}),
  // Export private API for tests
  API
};

function _createLogger() {
  // Only enable EWS-logging if log-level is set to `debug` (it's massive)
  exchangeWebService.EwsLogging.DebugLogEnabled = API._isHigherOrEqualSeverity({ process }, npmConfig.levels.debug);
  // Create logger-instance
  return winston.createLogger({
    level: API._getLogLevel({ process }),
    levels: npmConfig.levels,
    format: combine(
      timestamp(),
      printf((info) => `${info.timestamp} [${ info.level }] ${info.message}`)
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
}

function _getLogLevel({ process }) {
  return process.env.LOG_LEVEL || 'info';
}

function _isHigherOrEqualSeverity({ process }, logLevel) {
  return npmConfig.levels[API._getLogLevel({ process })] >= logLevel;
}
