import * as bitcoin from 'bitcoinjs-lib';
import assert from 'assert';
import ElectrumClient from 'electrum-client';

jest.setTimeout(150 * 1000);

const hardcodedPeers = [{ host: 'electrum1.bluewallet.io', ssl: '443' }];

const hardcodedTestnetPeers = [{ host: '35.177.46.45', ssl: '50002' }];

describe('Client', () => {
  it('can connect and query to mainnet', async () => {
    for (const peer of hardcodedPeers) {
      const client = new ElectrumClient(
        global.net,
        global.tls,
        peer.ssl || peer.tcp,
        peer.host,
        peer.ssl ? 'tls' : 'tcp'
      );

      try {
        await client.connect();
        await client.server_version('2.7.11', '1.4');
      } catch (e) {
        client.reconnect = client.keepAlive = () => {}; // dirty hack to make it stop reconnecting
        client.close();
        throw new Error('bad connection: ' + JSON.stringify(peer) + ' ' + e.message);
      }

      let addr4elect = 'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej';
      let script = bitcoin.address.toOutputScript(addr4elect);
      let hash = bitcoin.crypto.sha256(script);
      let reversedHash = Buffer.from(hash.reverse());
      const start = +new Date();
      let balance = await client.blockchainScripthash_getBalance(reversedHash.toString('hex'));
      const end = +new Date();
      end - start > 1000 &&
        console.warn(peer.host, 'took', (end - start) / 1000, 'seconds to fetch balance');
      assert.ok(balance.confirmed > 0);
      client.close();
    }
  });

  it('can connect and query to testnet', async () => {
    for (const peer of hardcodedTestnetPeers) {
      const client = new ElectrumClient(
        global.net,
        global.tls,
        peer.ssl || peer.tcp,
        peer.host,
        peer.ssl ? 'tls' : 'tcp'
      );

      try {
        await client.connect();
        await client.server_version('2.7.11', '1.4');
      } catch (e) {
        client.reconnect = client.keepAlive = () => {}; // dirty hack to make it stop reconnecting
        client.close();
        throw new Error('bad connection: ' + JSON.stringify(peer) + ' ' + e.message);
      }

      let addr4elect = 'tb1qk37mycd4vxer4u3ef5kkfj7nqkpvde0yqe03pn';
      let script = bitcoin.address.toOutputScript(addr4elect, bitcoin.networks.testnet);
      let hash = bitcoin.crypto.sha256(script);
      let reversedHash = Buffer.from(hash.reverse());
      const start = +new Date();
      let balance = await client.blockchainScripthash_getBalance(reversedHash.toString('hex'));
      const end = +new Date();
      end - start > 1000 &&
        console.warn(peer.host, 'took', (end - start) / 1000, 'seconds to fetch balance');
      assert.ok(balance.confirmed > 0);
      client.close();
    }
  });
});
