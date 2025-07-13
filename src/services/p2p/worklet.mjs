import Hyperswarm from 'hyperswarm';
import {
  GET_KEYS,
  GET_PEERS,
  JOIN_PEER,
  ON_CONNECTION,
  ON_ERROR,
  ON_MESSAGE,
  RPC_KEY,
  RPC_KEY_RECEIVED,
  SEND_MESSAGE,
} from './rpc-commands.mjs';
import RPC from 'bare-rpc';
import b4a from 'b4a';

import { Buffer } from 'buffer';
import config from 'src/utils/service-utilities/config';
global.Buffer = Buffer;

const { IPC } = BareKit;

let keyPair;
const connections = new Map();

const RELAY_PUB_KEY = config.RELAY_PEER_PUB_KEY;

const rpc = new RPC(IPC, (req, error) => {
  try {
    const data = b4a.toString(req.data);
    console.log('REQ', req.command, data);
    if (req.command === RPC_KEY_RECEIVED) {
    } else if (req.command === GET_KEYS) {
      req.reply(JSON.stringify(getKeys()));
    } else if (req.command === GET_PEERS) {
      req.reply(JSON.stringify(getPeers()));
    } else if (req.command === SEND_MESSAGE) {
      sendMessage(data);
    } else if (req.command === JOIN_PEER) {
      joinPeer(data);
    }

    if (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

const swarm = new Hyperswarm({
  seed: Buffer.from(Bare.argv[0], 'hex'),
});

keyPair = swarm.keyPair;

swarm.on('connection', (conn, info) => {
  console.log(`JOINING info.publicKey.toString('hex')`);

  connections.set(info.publicKey.toString('hex'), conn);

  console.log(`connected to ${info.publicKey.toString('hex')}`);
  const req = rpc.request(ON_CONNECTION);
  req.send(
    JSON.stringify({
      publicKey: info.publicKey.toString('hex'),
    })
  );

  conn.on('data', (data) => {
    console.log(`received: ${data.toString()}`);
    const req = rpc.request(ON_MESSAGE);
    req.send(
      JSON.stringify({
        data: data.toString(),
        publicKey: info.publicKey.toString('hex'),
      })
    );
  });

  conn.on('error', (err) => {
    console.error(`connection error:`, err);
    const req = rpc.request(ON_ERROR);
    req.send(
      JSON.stringify({
        err,
      })
    );
  });
});

const getKeys = () => {
  return {
    publicKey: swarm.keyPair.publicKey.toString('hex'),
    secretKey: swarm.keyPair.secretKey.toString('hex'),
  };
};

const getPeers = () => {
  return JSON.stringify(Array.from(swarm.peers.entries()));
};

const joinPeer = async (pubKey) => {
  swarm.joinPeer(Buffer.from(pubKey, 'hex'));
  await swarm.flush();
  console.log(`joinpeer ${pubKey}`);
};

const sendMessage = async (payload) => {
  console.log('sendMessage', payload);
  const relayConn = connections.get(RELAY_PUB_KEY);
  if (relayConn) {
    relayConn.write(payload);
  } else {
    console.error(`No connection found for publicKey: ${payload.pubKey}`);
  }
};

const req = rpc.request(RPC_KEY);
req.send(
  JSON.stringify({
    publicKey: swarm.keyPair.publicKey.toString('hex'),
    secretKey: swarm.keyPair.secretKey.toString('hex'),
  })
);

const d = swarm.join(swarm.keyPair.publicKey, { server: true, client: false });
await swarm.join(Buffer.from(RELAY_PUB_KEY, 'hex'), { client: true, server: true });
await swarm.flush();

// const replyBuffer = await req.reply()
// console.log(replyBuffer.toString())

// IPC.write(JSON.stringify({
//   publicKey: swarm.keyPair.publicKey.toString('hex'),
//   secretKey: swarm.keyPair.secretKey.toString('hex'),
// }));
