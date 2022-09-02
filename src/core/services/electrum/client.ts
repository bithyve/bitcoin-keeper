import ElectrumClient from 'electrum-client';
import * as bitcoinJS from 'bitcoinjs-lib';
import reverse from 'buffer-reverse';
const net = require('./net');
const tls = require('./tls');

export const testElectrumClient = async () => {
  const client = new ElectrumClient(net, tls, 50002, '35.177.105.175', 'tls');
  const ver = await client.initElectrum({ client: 'bitcoin-keeper', version: '1.4' });
  return client;
};

export const getBalanceByAddress = async (
  address: string = '1FxFfPngpPi8CGhjqRzsJMMDaSG8HbaTzX'
) => {
  const client = await testElectrumClient();
  const script = bitcoinJS.address.toOutputScript(address);
  const hash = bitcoinJS.crypto.sha256(script);
  const reversedHash = Buffer.from(reverse(hash));
  const balance = await client.blockchainScripthash_getBalanceBatch([reversedHash.toString('hex')]);
  balance.addr = address;
};
