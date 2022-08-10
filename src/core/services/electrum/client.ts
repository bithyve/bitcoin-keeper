import ElectrumClient from 'electrum-client';
import net from 'react-native-tcp';

export const testElectrumClient = async () => {
  const client = new ElectrumClient(net, false, 60001, 'btc.electroncash.dk', 'tcp');
  const ver = await client.initElectrum({ client: 'bluewallet', version: '1.4' });
  const balance = await client.blockchainScripthash_getBalance(
    '716decbe1660861c3d93906cb1d98ee68b154fd4d23aed9783859c1271b52a9c'
  );
  console.log({ ver, balance });
};
