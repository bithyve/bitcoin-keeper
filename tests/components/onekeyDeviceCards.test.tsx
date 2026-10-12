import React from 'react';
import { act, create } from 'react-test-renderer';
import SignerList from 'src/screens/Home/components/Keys/SignerList';

const mockSigner = {
  id: 'shared-key',
  type: 'ONEKEY',
  signerName: 'OneKey',
  extraData: {
    bleConnectId: 'pro-address',
    oneKeyDevices: [
      { serialNo: 'PRO-SERIAL', bleConnectId: 'pro-address', name: 'Pro' },
      { serialNo: 'PRO2-SERIAL', bleConnectId: 'pro2-address', name: 'Pro 2' },
    ],
  },
};
jest.mock('src/hooks/useSigners', () => () => ({ signers: [mockSigner] }));
jest.mock('src/hooks/useIndicatorHook', () => ({ useIndicatorHook: () => ({}) }));
jest.mock('@realm/react', () => ({ useQuery: () => [{}] }));
jest.mock('src/storage/realm/utils', () => ({ getJSONFromRealmObject: (value) => value }));
jest.mock('src/utils/utilities', () => ({ getKeyUID: (signer) => signer.id }));
jest.mock('src/hardware', () => ({ getSignerDescription: () => '', getSignerNameFromType: () => 'OneKey' }));
jest.mock('src/screens/Vault/SigningDeviceIcons', () => ({ SDIcons: () => ({ Icon: null }) }));
jest.mock('src/screens/Vault/HardwareModalMap', () => ({ __esModule: true, default: () => null, InteracationMode: {} }));
jest.mock('src/screens/AddSigner/SignerCard', () => 'SignerCard');
jest.mock('@gluestack-ui/themed-native-base', () => ({ Box: 'Box', useColorMode: () => ({ colorMode: 'light' }) }));
jest.mock('@react-navigation/native', () => ({ CommonActions: { navigate: (name, params) => ({ name, params }) } }));

test('same-key devices have separate cards and navigate with the selected serial', () => {
  const dispatch = jest.fn();
  let view;
  act(() => { view = create(<SignerList navigation={{ dispatch }} />); });
  const cards = view.root.findAllByType('SignerCard');
  expect(cards.map((card) => card.props.name)).toEqual(['Pro', 'Pro 2']);
  expect(cards.map((card) => card.props.subtitle)).toEqual(['Serial: PRO-SERIAL', 'Serial: PRO2-SERIAL']);
  act(() => cards[0].props.onCardSelect());
  act(() => cards[1].props.onCardSelect());
  expect(dispatch.mock.calls.map(([action]) => action.params)).toEqual([
    { signerId: 'shared-key', oneKeyDeviceId: 'PRO-SERIAL' },
    { signerId: 'shared-key', oneKeyDeviceId: 'PRO2-SERIAL' },
  ]);
  act(() => view.unmount());
});
