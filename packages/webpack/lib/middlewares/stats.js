function createStatsMiddleware(enhancedPromise) {
  return function statsMiddleware(req, res, next) {
    enhancedPromise
      .then((stats) => {
        console.log('got stats', Object.keys(stats));
        res.locals = { ...res.locals, stats };
        next();
      })
      .catch(next);
  };
}

module.exports = { createStatsMiddleware };
