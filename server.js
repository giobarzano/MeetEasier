// IMPORTS

const express                                     = require('express'),
      IoServer                                    = require('socket.io'),
      exchangeWebService                          = require("ews-javascript-api"),
      auth                                        = require('./config/auth'),
      { "default": logger, logLevels: LOG_LEVEL } = require('./config/logger'),
      createRoutes                                = require('./app/routes.js').default,
      createController                            = require('./config/controller.js').default;

// CONSTANTS

// Container with all private functions, which will be exported, to support mocking of functions

const API = {
  _bindEvents,
  _createApp,
  _init,
  _setRoutes,
  _setupServer,
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
  const dependencies = { LOG_LEVEL, exchangeWebService, auth, express, logger, process, IoServer };
  API._bindEvents(dependencies);
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

function _startServer({ LOG_LEVEL, auth, IoServer, logger }, app, port = 8080) {
  const server = app.listen(port, function() {
    // call controller functions -------------------------------------------------
    const io = IoServer.listen(server);
    // controller if using room lists
    createController({ LOG_LEVEL, auth, io, logger });
    // log something so we know the server is working correctly
    console.log('now we are cooking.');
  });
}

function _setRoutes(app, routes) {
  routes.forEach((routeConfig) => {
    app[routeConfig.method](routeConfig.path, routeConfig.handler);
  });
}
