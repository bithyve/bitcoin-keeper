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
  return TcpSocket.connectTLS(
    {
      port: config.port,
      host: config.host,
      tlsCheckValidity: config.rejectUnauthorized,
    },
    callback
  );
}

module.exports.connect = connect;
