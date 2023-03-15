export const baseServer = (onion: boolean, mainnet: boolean) => {
  if (onion) {
    if (mainnet) return 'udkmfc5j6zvv3ysavbrwzhwji4hpyfe3apqa6yst7c7l32mygf65g4ad.onion:80';
    return 'y5qvjlxvbohc73slq4j4qldoegyukvpp74mbsrjosnrsgg7w5fon6nyd.onion:80';
  }
  if (mainnet) return 'pool.whirl.mx:8080';
  return 'pool.whirl.mx:8081';
};

export const getAPIEndpoints = (onion: boolean, mainnet: boolean) => {
  const server = baseServer(onion, mainnet);

  return {
    server,
    ws_connect: `ws://${server}/ws/connect`,
    check_output: `http://${server}/rest/checkOutput`,
    register_output: `http://${server}/rest/registerOutput`,
    pools: `http://${server}/rest/pools`,
    tx0_data: `http://${server}/rest/tx0/v1`,
    tx0_push: `http://${server}/rest/tx0/push`,
  };
};
