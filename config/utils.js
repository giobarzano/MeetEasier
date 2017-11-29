// Container with all private functions, which will be exported, to support mocking of functions
const API = {
  _createDefaultRejector
};

// Export API

module.exports = {
  createDefaultRejector: ({ LOG_LEVEL, logger }, reject) => API._createDefaultRejector({ LOG_LEVEL, logger }, reject),
  // Export private API for tests
  API
};

function _createDefaultRejector({ LOG_LEVEL, logger }, reject) {
  return (err) => {
    logger.log({
      level: LOG_LEVEL.error,
      message: err
    });
    reject && reject(err);
    return err;
  };
}
