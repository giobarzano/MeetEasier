const exchangeWebService = require("ews-javascript-api"),
  fetchListOfRooms = require('./ews/rooms').default,
  auth = require('./auth'),
  logger = require('./logger').default;

const LOG_LEVEL = require('./logger').logLevels;

module.exports = function (io){
  let isRunning = false;

  // Check and update rooms every 60 seconds -----------------------------------
    io.of('/').on('connection', function(socket) {
      if (!isRunning) {
        (function callEWS(){
          fetchListOfRooms({ exchangeWebService, auth, logger }, function(err, result) {
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
          });
          setTimeout(callEWS, 60000);
        })();
      }
      isRunning = true;
    });
};
