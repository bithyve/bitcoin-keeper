/* eslint-disable no-console */
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import ElectrumCli from 'electrum-client';

// const reverse = require('buffer-reverse');

const ELECTRUM_CLIENT_CONFIG = {
  predefinedTestnetPeers: [{ host: '35.177.46.45', ssl: '50002' }],
  predefinedPeers: [
    // peers for production server goes here.
  ],
  maxConnectionAttempt: 5,
  reconnectDelay: 1000, // 1 second
};
export default class ElectrumClient {
  public static electrumClient;

  public static isClientConnected = false;

  public static currentPeerIndex = Math.floor(
    Math.random() * ELECTRUM_CLIENT_CONFIG.predefinedPeers.length
  );

  public static connectionAttempt = 0;

  public static async connect() {
    const peer = await ElectrumClient.getNextPeer();
    try {
      ElectrumClient.electrumClient = new ElectrumCli(
        global.net,
        global.tls,
        peer.ssl || peer.tcp,
        peer.host,
        peer.ssl ? 'tls' : 'tcp'
      ); // tcp or tls

      ElectrumClient.electrumClient.onError = (error) => {
        console.log('Electrum mainClient.onError():', error.message);

        if (ElectrumClient.isClientConnected) {
          if (ElectrumClient.electrumClient.close) ElectrumClient.electrumClient.close();

          ElectrumClient.isClientConnected = false;
          console.log('Error: Close the connection');
          setTimeout(ElectrumClient.connect, ELECTRUM_CLIENT_CONFIG.reconnectDelay);
        }
      };
      console.log('Initiate electrum server');
      const ver = await ElectrumClient.electrumClient.initElectrum({
        client: 'bitcoin-keeper',
        version: '1.4',
      });
      console.log('Connection to electrum server is established', { ver });
      if (ver && ver[0]) {
        console.log(`ver : ${ver}`);
        ElectrumClient.isClientConnected = true;
      }
    } catch (error) {
      ElectrumClient.isClientConnected = false;
      console.log('Bad connection:', JSON.stringify(peer), error);
    }

    if (ElectrumClient.isClientConnected) return ElectrumClient.isClientConnected;
    return ElectrumClient.reconnect();
  }

  public static async reconnect() {
    console.log('Trying to reconnect');
    ElectrumClient.connectionAttempt += 1;

    // close the connection before attempting again
    if (ElectrumClient.electrumClient.close) ElectrumClient.electrumClient.close();

    if (ElectrumClient.connectionAttempt >= ELECTRUM_CLIENT_CONFIG.maxConnectionAttempt) {
      console.log('Could not find the working electrum server. Please try again later.');
      return ElectrumClient.isClientConnected; // false
    }
    console.log(`Reconnection attempt #${ElectrumClient.connectionAttempt}`);
    await new Promise((resolve) => {
      setTimeout(resolve, ELECTRUM_CLIENT_CONFIG.reconnectDelay); // attempts reconnection after 1 second
    });
    return ElectrumClient.connect();
  }

  public static getCurrentPeer() {
    const isTestnet = config.NETWORK_TYPE === NetworkType.TESTNET;
    return isTestnet
      ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers[ElectrumClient.currentPeerIndex]
      : ELECTRUM_CLIENT_CONFIG.predefinedPeers[ElectrumClient.currentPeerIndex];
  }

  public static getNextPeer() {
    const isTestnet = config.NETWORK_TYPE === NetworkType.TESTNET;
    ElectrumClient.currentPeerIndex += 1;
    if (
      ElectrumClient.currentPeerIndex >
      (isTestnet
        ? ELECTRUM_CLIENT_CONFIG.predefinedTestnetPeers.length - 1
        : ELECTRUM_CLIENT_CONFIG.predefinedPeers.length - 1)
    )
      ElectrumClient.currentPeerIndex = 0; // reset(out of bounds)

    const peer = ElectrumClient.getCurrentPeer();
    return peer;
  }
}
