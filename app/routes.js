const path = require('path'),
  exchangeWebService = require("ews-javascript-api"),
  auth = require('../config/auth'),
  fetchListOfRooms = require('../config/ews/rooms').default,
  logger = require('../config/logger').default;

const LOG_LEVEL = require('../config/logger').logLevels;

module.exports = function(app) {
	// api routes ================================================================
	// returns an array of room objects
	app.get('/api/rooms', function(req, res) {
    fetchListOfRooms({ exchangeWebService, auth, logger }, function(err, rooms) {
      logger.log({ level: LOG_LEVEL.info, message: 'Sending rooms-response' });
			res.json(rooms);
		});
	});

	// returns an array of roomlist objects
	app.get('/api/roomlists', function(req, res) {

		var ews = require('../config/ews/roomlists.js');

		ews(function(err, roomlists) {
      logger.log({ level: LOG_LEVEL.info, message: 'Sending roomlists-response' });
			res.json(roomlists);
		});
	});

	// heartbeat-service to check if server is alive
  app.get('/api/heartbeat', function(req, res) {
    res.json({ status: 'OK' });
  });

	// redirects everything else to our react app
	app.get('*', function(req, res) {
		res.sendFile(path.join(__dirname,'../ui-react/build/','index.html'));
	});

};
