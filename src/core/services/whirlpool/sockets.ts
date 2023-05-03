import { NetworkType } from 'src/core/wallets/enums';

export const initiateWhirlpoolSocket = (appId: string, network: NetworkType) => {
  const ws = new WebSocket(`ws://whirlpool-channel.herokuapp.com/${appId}`);
  ws.onerror = (e) => {
    console.log({ message: e.message });
  };
  ws.onclose = (e) => {
    console.log({ code: e.code, message: e.message, reason: e.reason });
  };
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'client', network })); // send a message
  };
  return ws;
};
