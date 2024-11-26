import assert from 'assert';

import ElectrumClient from '../../src/services/electrum/client';
import { predefinedTestnetNodes } from 'src/services/electrum/predefinedNodes';

jest.setTimeout(150 * 1000);

afterAll(() => {
  // after all tests we close socket so the test suite can actually terminate
  ElectrumClient.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  try {
    ElectrumClient.setActivePeer(predefinedTestnetNodes);
    await ElectrumClient.connect();
    console.log('Electrum connected');
  } catch (err) {
    console.log('failed to connect to Electrum:', err);
    process.exit(1);
  }
});

describe('Client', () => {
  it('Client can test connection', async () => {
    assert.ok(!(await ElectrumClient.testConnection('testnet.qtornado.com', false, 51002)));
    // assert.ok(await ElectrumClient.testConnection('electrumx-core.1209k.com', false, 50002));
  });

  it('Client can ping', async () => {
    const isActive = await ElectrumClient.ping();
    assert.ok(isActive);
  });

  it('Client can request server features', async () => {
    const features = await ElectrumClient.serverFeatures();
    assert.ok(features.server_version);
    assert.ok(features.protocol_min);
    assert.ok(features.protocol_max);
  });
});
