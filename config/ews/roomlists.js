// IMPORTS

const LOG_LEVEL = require("../logger").logLevels,
  { createDefaultRejector } = require('../utils');

// CONSTANTS

const API = {
  _createExchangeService,
  _getRoomLists
};

// EXPORT API

module.exports = {
  'default': fetchRoomLists,
  API
};

// IMPLEMENTATION DETAILS

// Public

function fetchRoomLists({ exchangeWebService, auth, logger }) {
  const exchangeService = API._createExchangeService({ exchangeWebService, auth });
  return API._getRoomLists({ logger }, exchangeService);
}

// Private

function _createExchangeService({ exchangeWebService: ews, auth }) {
  const svcExchange = new ews.ExchangeService(ews.ExchangeVersion.Exchange2016);
  svcExchange.Credentials = new ews.ExchangeCredentials(auth.exchange.username, auth.exchange.password);
  svcExchange.Url = new ews.Uri(auth.exchange.uri);
  return svcExchange;
}

function _getRoomLists({ logger }, exchangeService) {
  return new Promise(function (resolve, reject) {
    logger.log({ level: LOG_LEVEL.info, message: '> RoomLists: Fetching from EWS' });
    exchangeService.GetRoomLists().then(
      (lists) => {
        logger.log({ level: LOG_LEVEL.verbose, message: 'v RoomLists: Received from EWS' });
        resolve(lists.items);
      },
      createDefaultRejector({ logger }, reject)
    );
  });
}
