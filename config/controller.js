// IMPORTS

const exchangeWebService = require("ews-javascript-api"),
  fetchRooms = require('./ews/rooms').default;

// CONSTANTS

// Container with all private functions, which will be exported, to support mocking of functions

const API = {
  _callEWS,
  _createConnectHandler,
  _createEwsResponseHandler
};

// LOCAL VARIABLES

let _isRunning = false;

// EXPORT API

module.exports = {
  'default': createController,
  // Export private API for tests
  API
};

// IMPLEMENTATION DETAILS

// Public

function createController({ LOG_LEVEL, auth, io, logger }){
  const dependencies = { LOG_LEVEL, auth, exchangeWebService, io, logger };
  // Check and update rooms every 60 seconds
  io.of('/').on('connection', API._createConnectHandler(dependencies));
}

// Private

function _createConnectHandler({ LOG_LEVEL, auth, exchangeWebService, io, logger }) {
  return function _handleConnect(/*socket*/) {
    if (_isRunning) { return; }
    API._callEWS({ LOG_LEVEL, auth, exchangeWebService, io, logger });
    _isRunning = true;
  }
}

function _callEWS({ LOG_LEVEL, auth, exchangeWebService, io, logger }) {
  fetchRooms({ exchangeWebService, auth, logger }, API._createEwsResponseHandler({ LOG_LEVEL, io, logger }));
  setTimeout(() => _callEWS({ LOG_LEVEL, auth, exchangeWebService, io, logger }), 60000);
}

function _createEwsResponseHandler({ LOG_LEVEL, io, logger }) {
  return function _handleEwsResponse(err, result) {
    if (result) {
      if (err) {
        logger.log({ level: LOG_LEVEL.error, message: err });
        return;
      }
      // send data to page
      logger.log({ level: LOG_LEVEL.info, message: 'Sending rooms-response' });
      io.of('/').emit('updatedRooms', result);
    }
    io.of('/').emit('controllerDone', 'done');
  }
}

