// IMPORTS

const _ = require('lodash'),
  exchangeWebService = require("ews-javascript-api"),
  fetchRooms = require('./ews/rooms').default,
  fetchRoomLists = require('../config/ews/roomlists.js').default,
  { createDefaultRejector } = require('./utils');

// CONSTANTS

const POLLING_INTERVAL = 60000;

// Local variables

const _cachedRooms = [],
  _cachedRoomLists = [];

// Container with all private functions, which will be exported, to support mocking of functions

const API = {
  _fetchData,
  _getRooms,
  _getRoomLists,
  _getRoomListNames,
  _startPolling
};

// LOCAL VARIABLES

let _timeoutRoomLists = null;

// EXPORT API

module.exports = {
  'default': initController,
  getRooms: () => API._getRooms(),
  getRoomLists: () => API._getRoomLists(),
  getRoomListNames: () => API._getRoomListNames(),
  // Export private API for tests
  API
};

// IMPLEMENTATION DETAILS

// Public

function initController({ LOG_LEVEL, auth, logger }) {
  const dependencies = { LOG_LEVEL, auth, exchangeWebService, logger };
  _timeoutRoomLists = API._startPolling(dependencies);
}

// Private

function _startPolling({ LOG_LEVEL, exchangeWebService, auth, logger }) {
  return _pollData();

  function _pollData() {
    API._fetchData({ LOG_LEVEL, exchangeWebService, auth, logger }, _cachedRoomLists,
      'v RoomLists: Putting response from EWS into cache', fetchRoomLists
    ).then((roomLists) => API._fetchData({ LOG_LEVEL, exchangeWebService, auth, logger }, _cachedRooms,
      'v Rooms: Putting response from EWS into cache', fetchRooms, { args: [roomLists] })
    );
    return setTimeout(() => {
      _pollData();
    }, POLLING_INTERVAL);
  }
}

function _fetchData({ LOG_LEVEL, exchangeWebService, auth, logger }, targetList, finishedMessage, fetchHandler,
    options = { args: [] }) {
  return fetchHandler({ exchangeWebService, auth, logger }, ...options.args).then(
    (result) => {
      targetList.splice(0, targetList.length, ...result);
      logger.log({ level: LOG_LEVEL.info, message: finishedMessage });
      return result;
    },
    createDefaultRejector({ logger })
  );
}

function _getRooms() {
  // Only return a copy (Don't let anyone mess with the cache)
  return _.cloneDeep(_cachedRooms);
}

function _getRoomLists() {
  // Only return a copy (Don't let anyone mess with the cache)
  return _.cloneDeep(_cachedRoomLists);
}

function _getRoomListNames() {
  const roomListNames = _cachedRoomLists.map((roomList) => roomList.Name);
  roomListNames.sort();
  return roomListNames;
}
