import assert from 'assert';
import ElectrumClient from '../../src/services/electrum/client';
import { predefinedTestnetNodes } from '../../src/services/electrum/predefinedNodes';
import * as bitcoinJS from 'bitcoinjs-lib';

jest.mock('src/store/store', () => ({
  store: {
    getState: () => ({
      settings: {
        bitcoinNetwork: 'testnet',
      },
    }),
  },
}));

beforeAll(async () => {
  try {
    ElectrumClient.setActivePeer(predefinedTestnetNodes);
    await ElectrumClient.connect();
  } catch (err) {
    console.log('failed to connect to Electrum:', err);
    process.exit(1);
  }
});

afterAll(() => {
  ElectrumClient.forceDisconnect();
});

describe('ElectrumClient', () => {
  describe('Connection Tests', () => {
    it('should test connection successfully', async () => {
      const result = await ElectrumClient.testConnection(predefinedTestnetNodes[0]);
      assert.ok(result.connected);
    });

    it('should fail connection when node is unreachable', async () => {
      const unreachableNode = { ...predefinedTestnetNodes[0], host: 'invalid.host' };
      const result = await ElectrumClient.testConnection(unreachableNode);
      assert.ok(!result.connected);
      assert.ok(result.error);
    });

    it('should reconnect to the next peer when connection fails', async () => {
      ElectrumClient.setActivePeer(predefinedTestnetNodes);
      ElectrumClient.forceDisconnect();
      const result = await ElectrumClient.reconnect();
      assert.ok(result.connected);
      assert.ok(result.connectedTo);
    });
  });

  describe('Ping Tests', () => {
    it('should ping successfully', async () => {
      const isActive = await ElectrumClient.ping();
      assert.ok(isActive);
    });
  });

  describe('Feature Tests', () => {
    it('should retrieve server features', async () => {
      const features = await ElectrumClient.serverFeatures();
      assert.ok(features.server_version);
      assert.ok(features.protocol_min);
      assert.ok(features.protocol_max);
    });
  });

  describe('UTXO and History Tests', () => {
    it('should sync UTXOs by address', async () => {
      const addresses = [
        'tb1qd2u9tvuqzadgeh02vppd33e7u2fatuwrw7h4q5',
        'tb1qwdm8hdyvv5jn05qq858lgnk50heucvxvqtl4sx',
      ];
      const utxos = await ElectrumClient.syncUTXOByAddress(addresses, bitcoinJS.networks.testnet);
      assert.ok(Object.keys(utxos).length > 0);
    });

    it('should sync history by address', async () => {
      const addresses = [
        'tb1qd2u9tvuqzadgeh02vppd33e7u2fatuwrw7h4q5',
        'tb1qwdm8hdyvv5jn05qq858lgnk50heucvxvqtl4sx',
      ];
      const history = await ElectrumClient.syncHistoryByAddress(
        addresses,
        bitcoinJS.networks.testnet
      );
      assert.ok(Object.keys(history.historyByAddress).length > 0);
      assert.ok(history.txids.length > 0);
    });
  });

  describe('Transaction Tests', () => {
    it('should estimate fee', async () => {
      const fee = await ElectrumClient.estimateFee(1);
      assert.ok(fee > 0);
    });

    it('should fetch transactions by ID', async () => {
      const txids = [
        '24913105c497b4bb4ccf81b03857c8306aba0e58ccde792d981f6c18efdb24b8',
        '9a15008af30580039bc7a07d36c3544902a2e1618ad31f4dda94fe0044a8dcce',
      ];
      const transactions = await ElectrumClient.getTransactionsById(txids);
      assert.ok(Object.keys(transactions).length === txids.length);
      assert.deepStrictEqual(transactions[txids[0]].txid, txids[0]);
      assert.deepStrictEqual(transactions[txids[1]].txid, txids[1]);
    });
  });
});
