const { tor } = require('../rest/RestClient');

/**
 * Wrapper for react-native-tor mimicking Socket class from NET package
 */
class TorSocket {
  constructor() {
    this._socket = false;
    this._listeners = {};
  }

  setTimeout() {}

  setEncoding() {}

  setKeepAlive() {}

  setNoDelay() {}

  on(event, listener) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(listener);
  }

  removeListener(event, listener) {
    this._listeners[event] = this._listeners[event] || [];
    const newListeners = [];

    let found = false;
    for (const savedListener of this._listeners[event]) {
      // eslint-disable-next-line eqeqeq
      if (savedListener === listener) {
        // found our listener
        found = true;
        // we just skip it
      } else {
        // other listeners should go back to original array
        newListeners.push(savedListener);
      }
    }

    if (found) {
      this._listeners[event] = newListeners;
    } else {
      // something went wrong, lets just cleanup all listeners
      this._listeners[event] = [];
    }
  }

  connect(port, host, callback) {
    console.log('connecting TOR socket...', host, port);
    (async () => {
      console.log('starting tor...');
      try {
        await tor.startIfNotStarted();
      } catch (e) {
        console.warn('Could not bootstrap TOR', e);
        await tor.stopIfRunning();
        this._passOnEvent('error', 'Could not bootstrap TOR');
        return false;
      }
      console.log('started tor');
      const iWillConnectISwear = tor.createTcpConnection(
        { target: host + ':' + port, connectionTimeout: 15000 },
        (data, err) => {
          if (err) {
            console.log('TOR socket onData error: ', err);
            // this._passOnEvent('error', err);
            return;
          }
          this._passOnEvent('data', data);
        }
      );

      try {
        this._socket = await Promise.race([
          iWillConnectISwear,
          new Promise((resolve) => setTimeout(resolve, 21000)),
        ]);
      } catch (e) {}

      if (!this._socket) {
        console.log('connecting TOR socket failed'); // either sleep expired or connect threw an exception
        await tor.stopIfRunning();
        this._passOnEvent('error', 'connecting TOR socket failed');
        return false;
      }

      console.log('TOR socket connected:', host, port);
      setTimeout(() => {
        this._passOnEvent('connect', true);
        callback();
      }, 1000);
    })();
  }

  _passOnEvent(event, data) {
    this._listeners[event] = this._listeners[event] || [];
    for (const savedListener of this._listeners[event]) {
      savedListener(data);
    }
  }

  emit(event, data) {}

  end() {
    console.log('trying to close TOR socket');
    if (this._socket && this._socket.close) {
      console.log('trying to close TOR socket SUCCESS');
      return this._socket.close();
    }
  }

  destroy() {}

  write(data) {
    if (this._socket && this._socket.write) {
      try {
        return this._socket.write(data);
      } catch (error) {
        console.log('this._socket.write() failed so we are issuing ERROR event', error);
        this._passOnEvent('error', error);
      }
    } else {
      console.log('TOR socket write error, socket not connected');
      this._passOnEvent('error', 'TOR socket not connected');
    }
  }
}

module.exports.Socket = TorSocket;
