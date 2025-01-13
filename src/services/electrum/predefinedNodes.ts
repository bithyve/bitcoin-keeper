import { NodeDetail } from 'src/services/wallets/interfaces';

export const predefinedTestnetNodes: NodeDetail[] = [
  {
    id: 333, // sequence 3-x-x; avoids collision w/ own node
    host: 'testnet.qtornado.com',
    port: '51002',
    isConnected: true,
    useKeeperNode: false,
    useSSL: true,
  },
  {
    id: 334,
    host: 'testnet.aranguren.org',
    port: '51002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
  },
];

export const predefinedMainnetNodes: NodeDetail[] = [
  {
    id: 442,
    host: 'electrum.emzy.de',
    port: '50002',
    isConnected: true,
    useKeeperNode: false,
    useSSL: true,
  },
  {
    id: 443,
    host: 'electrum.bitaroo.net',
    port: '50002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
  },
  {
    id: 446,
    host: 'ecdsa.net',
    port: '110',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
  },
  {
    id: 447,
    host: 'electrum.jochen-hoenicke.de',
    port: '50006',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
  },
  {
    id: 448,
    host: 'fulcrum.sethforprivacy.com',
    port: '50002',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
  },
  {
    id: 449,
    host: 'electrum.diynodes.com',
    port: '50022',
    isConnected: false,
    useKeeperNode: false,
    useSSL: true,
  },
];
