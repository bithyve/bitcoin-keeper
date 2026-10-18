// CI-only entrypoint for native module persistence. No product source is rewritten.
const path = require('node:path');
const { observe } = require('./bundle_observer.cjs');
const base = require('../../metro.config');
const enhance = base.server?.enhanceMiddleware;
module.exports = {
  ...base,
  projectRoot: path.resolve(__dirname, '../..'),
  server: {
    ...base.server,
    enhanceMiddleware(middleware, server) {
      const inner = enhance ? enhance(middleware, server) : middleware;
      return (req, res, next) => {
        const mode = process.env.KEEPER_PROBE_MODE;
        if (!['startup', 'bridge'].includes(mode)) throw new Error('UNREVIEWED_PROBE_MODE');
        if (/^\/index\.bundle(?=\?|$)/.test(req.url)) {
          observe(req, res, path.join(process.env.RUNNER_TEMP, 'keeper-native-private', `${mode}-served.json`));
        }
        if (mode === 'bridge') {
          req.url = req.url.replace(/^\/index\.(bundle|map)(?=\?|$)/,
            '/.github/native/prerequisite_probe.$1');
        }
        return inner(req, res, next);
      };
    },
  },
};
