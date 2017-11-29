const path = require('path'),
  fetchRooms = require('../config/ews/rooms').default,
  fetchRoomLists = require('../config/ews/roomlists.js').default;

const API = {
  _createDefaultHandler,
  _createHeartbeatHandler,
  _createRoomListsHandler,
  _createRoomsHandler
};

module.exports = {
  'default': createRoutes,
  // Export private API for tests
  API
};


function createRoutes({ LOG_LEVEL, exchangeWebService, auth, logger }) {
  const dependencies = { LOG_LEVEL, exchangeWebService, auth, logger };
  return [
    { method: 'get', path: '/api/heartbeat', handler: API._createHeartbeatHandler(dependencies) },
    { method: 'get', path: '/api/rooms',     handler: API._createRoomsHandler(dependencies) },
    { method: 'get', path: '/api/roomlists', handler: API._createRoomListsHandler(dependencies) },
    { method: 'get', path: '*',              handler: API._createDefaultHandler(dependencies) }
  ];
}

function _createRoomsHandler({ LOG_LEVEL, exchangeWebService, auth, logger }) {
  return function _handleRooms(req, res) {
    fetchRooms({ exchangeWebService, auth, logger }, function(err, rooms) {
      logger.log({ level: LOG_LEVEL.info, message: 'Sending rooms-response' });
      res.json(rooms);
    });
  };
}

function _createRoomListsHandler({ LOG_LEVEL, logger }) {
  return function _handleRoomLists(req, res) {
    fetchRoomLists(function(err, roomlists) {
      logger.log({ level: LOG_LEVEL.info, message: 'Sending roomlists-response' });
      res.json(roomlists);
    });
  };
}

function _createHeartbeatHandler({}) {
  return function _handleHeartbeat(req, res) {
    res.json({ status: 'OK' });
  }
}

function _createDefaultHandler() {
  return function _handleDefault(req, res) {
    res.sendFile(path.join(__dirname,'../ui-react/build/','index.html'));
  }
}
