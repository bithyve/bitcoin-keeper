import { NetworkType } from 'src/services/wallets/enums';
import { captureError } from 'src/services/sentry';

export const initiateWhirlpoolSocket = (appId: string, network: NetworkType) => {
  try {
    const ws = new WebSocket(`wss://whirlpool-channel.bithyve.com/${appId}`);
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
  } catch (err) {
    captureError(err);
  }
};
