// IMPORTS

const express                                     = require('express'),
      IoServer                                    = require('socket.io'),
      exchangeWebService                          = require("ews-javascript-api"),
      auth                                        = require('./config/auth'),
      { "default": logger, logLevels: LOG_LEVEL } = require('./config/logger'),
      createRoutes                                = require('./app/routes.js').default,
      initController                              = require('./config/controller.js').default,
      { getRooms, getRoomListNames } = require('./config/controller.js');

// CONSTANTS

const POLLING_INTERVAL = 60000;

// Container with all private functions, which will be exported, to support mocking of functions

const API = {
  _bindEvents,
  _createApp,
  _init,
  _setRoutes,
  _setupServer,
  _startRoomsPush,
  _startServer
};

// EXPORT API

module.exports = {
  API
};

// INITIALIZATION

_init();

// IMPLEMENTATION DETAILS

function _init() {
  const dependencies = { LOG_LEVEL, exchangeWebService, auth, express, getRooms, getRoomListNames, logger, process,
    IoServer };
  API._bindEvents(dependencies);
  initController(dependencies);
  const app = API._setupServer(dependencies, createRoutes(dependencies));
  API._startServer(dependencies, app, process.env.PORT);
}

function _bindEvents({ process }) {
  // Print proper stacktrace on unhandled promise rejection
  process.on('unhandledRejection', (err) => console.log(err));
}

function _createApp({ express }) {
  return express();
}

function _setupServer({ express }, routes) {
  const app = API._createApp({ express });
  // Use public folder for js, css, imgs, etc
  app.use(express.static('static'));
  app.use(express.static(`${__dirname}/ui-react/build`));
  // Set routes
  API._setRoutes(app, routes);
  return app;
}

function _startServer({ LOG_LEVEL, logger, IoServer }, app, port = 8080) {
  const server = app.listen(port, function() {
    // call controller functions -------------------------------------------------
    const io = IoServer.listen(server);
    API._startRoomsPush({ LOG_LEVEL, logger }, io);
    // log something so we know the server is working correctly
    logger.log({ level: LOG_LEVEL.info, message: 'now we are cooking.' });
  });
}

function _setRoutes(app, routes) {
  routes.forEach((routeConfig) => {
    app[routeConfig.method](routeConfig.path, routeConfig.handler);
  });
}

function _startRoomsPush({ LOG_LEVEL, logger }, io) {
  _pushRooms();

  function _pushRooms() {
    logger.log({ level: LOG_LEVEL.info, message: '< Rooms: Pushing update to client' });
    io.of('/').emit('updatedRooms', getRooms());
    io.of('/').emit('controllerDone', 'done');
    setTimeout(_pushRooms, POLLING_INTERVAL);
  }
}
