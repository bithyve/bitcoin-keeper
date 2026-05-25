jest.mock('react-native-tcp-socket', () => ({
  connectTLS: jest.fn(),
}));

const TcpSocket = require('react-native-tcp-socket');
const tlsAdapter = require('../../src/services/electrum/tls');

describe('electrum tls adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses strict TLS defaults and host as servername', () => {
    const callback = jest.fn();
    const socket = { id: 'strict-socket' };
    TcpSocket.connectTLS.mockReturnValue(socket);

    const result = tlsAdapter.connect(
      {
        host: 'electrum.example.com',
        port: 50002,
      },
      callback
    );

    expect(TcpSocket.connectTLS).toHaveBeenCalledWith(
      {
        host: 'electrum.example.com',
        port: 50002,
        rejectUnauthorized: true,
        tlsCheckValidity: true,
        servername: 'electrum.example.com',
      },
      callback
    );
    expect(result).toBe(socket);
  });

  it('respects explicit rejectUnauthorized false and custom servername', () => {
    const callback = jest.fn();

    tlsAdapter.connect(
      {
        host: '127.0.0.1',
        port: 50002,
        rejectUnauthorized: false,
        servername: 'node.example.com',
      },
      callback
    );

    expect(TcpSocket.connectTLS).toHaveBeenCalledWith(
      {
        host: '127.0.0.1',
        port: 50002,
        rejectUnauthorized: false,
        tlsCheckValidity: false,
        servername: 'node.example.com',
      },
      callback
    );
  });
});
