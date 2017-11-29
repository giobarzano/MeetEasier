module.exports.default = function (callback) {

  // modules -------------------------------------------------------------------
  var ews = require("ews-javascript-api");
  var auth = require("../auth.js");
  var logger = require("../logger").default;
  var LOG_LEVEL = require("../logger").logLevels;

  // ews -----------------------------------------------------------------------
  var exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2016);
  exch.Credentials = new ews.ExchangeCredentials(auth.exchange.username, auth.exchange.password);
  exch.Url = new ews.Uri(auth.exchange.uri);

  // get roomlists from EWS and return sorted array of room list names
  logger.log({ level: LOG_LEVEL.info, message: 'Fetching room lists' });
  exch.GetRoomLists().then(
    (lists) => {
      logger.log({ level: LOG_LEVEL.verbose, message: 'Received room lists' });

      var roomLists = [];
      lists.items.forEach(function (item, i, array) {
        roomLists.push(item.Name);
      });
      callback(null, roomLists.sort());
    },
    (err) => {
      logger.log({
        level: LOG_LEVEL.error,
        message: err
      });
      return err;
    }
  );
};
