export const initiateWhirlpoolSocket = (appId: string) =>
  new WebSocket(`ws://192.168.0.113:4002/${appId}`);
