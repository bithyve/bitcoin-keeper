/**
 * @fileOverview adapter for ReactNative TCP module
 * This module mimics the nodejs tls api and is intended to work in RN environment.
 * @see https://github.com/Rapsssito/react-native-tcp-socket
 */

import TcpSocket from 'react-native-tcp-socket';

/**
 * Constructor function. Mimicking nodejs/tls api
 *
 * @constructor
 */
function connect(config, callback) {
  const rejectUnauthorized = config.rejectUnauthorized !== false;

  return TcpSocket.connectTLS(
    {
      port: config.port,
      host: config.host,
      // Keep both flags for compatibility across react-native-tcp-socket variants.
      rejectUnauthorized,
      tlsCheckValidity: rejectUnauthorized,
      servername: config.servername || config.host,
    },
    callback
  );
}

module.exports.connect = connect;
