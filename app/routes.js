const path = require('path');

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


function createRoutes({ LOG_LEVEL, getRooms, getRoomListNames, logger }) {
  const dependencies = { LOG_LEVEL, getRooms, getRoomListNames, logger };
  return [
    { method: 'get', path: '/api/heartbeat', handler: API._createHeartbeatHandler(dependencies) },
    { method: 'get', path: '/api/rooms',     handler: API._createRoomsHandler(dependencies) },
    { method: 'get', path: '/api/roomlists', handler: API._createRoomListsHandler(dependencies) },
    { method: 'get', path: '*',              handler: API._createDefaultHandler(dependencies) }
  ];
}

function _createRoomsHandler({ LOG_LEVEL, getRooms, logger }) {
  return function _handleRooms(req, res) {
    logger.log({ level: LOG_LEVEL.info, message: '< Rooms: Sending cache to client' });
    res.json(getRooms());
  };
}

function _createRoomListsHandler({ LOG_LEVEL, getRoomListNames, logger }) {
  return function _handleRoomLists(req, res) {
    logger.log({ level: LOG_LEVEL.info, message: '< RoomLists: Sending cache to client' });
    res.json(getRoomListNames());
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
