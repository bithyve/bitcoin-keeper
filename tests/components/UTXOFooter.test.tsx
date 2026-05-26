/**
 * Task 6.1 — UTXOFooter: "Donate Dust" item renders only when doNotSpendUTXOs.length > 0
 */
jest.mock('src/components/KeeperText', () => {
  const React = require('react');
  return ({ children }) => React.createElement('span', null, children);
});

jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBuildNumber: () => '100',
  getSystemName: () => 'iOS',
  getUniqueId: () => 'mocked-device-id',
  getManufacturer: () => Promise.resolve('MockedManufacturer'),
}));

jest.mock('src/assets/images/send-green.svg', () => 'SendGreen');
jest.mock('src/assets/images/send-white.svg', () => 'SendWhite');

jest.mock('src/services/wallets/operations/utils', () => ({
  getPurpose: jest.fn(),
}));

jest.mock('idx', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('src/context/Localization/LocContext', () => {
  const React = require('react');
  const mockTranslations = { wallet: { selectToSend: 'Select to Send', donateDust: 'Donate Dust' } };
  return {
    LocalizationContext: React.createContext({ translations: mockTranslations }),
  };
});

import React from 'react';
import { render } from 'src/utils/test-utils';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';

const mockWallet = { entityKind: 'WALLET', derivationDetails: { xDerivationPath: "m/84'/0'/0'" } };
const spendableUTXO = { txId: 'tx1', vout: 0, value: 10000, address: 'a1', height: 100, spendability: 'spendable' };
const doNotSpendUTXO = { txId: 'tx2', vout: 0, value: 300, address: 'a2', height: 101, spendability: 'doNotSpend' };

describe('UTXOFooter — Donate Dust conditional rendering', () => {
  it('6.1.1 — renders Donate Dust button when doNotSpendUTXOs has entries', () => {
    const { getByTestId } = render(
      <UTXOFooter
        setEnableSelection={jest.fn()}
        enableSelection={false}
        wallet={mockWallet}
        utxos={[spendableUTXO]}
        doNotSpendUTXOs={[doNotSpendUTXO]}
        onDonateDust={jest.fn()}
      />
    );
    expect(getByTestId('btn_Donate Dust')).toBeTruthy();
  });

  it('6.1.2 — does NOT render Donate Dust button when doNotSpendUTXOs is empty', () => {
    const { queryByTestId } = render(
      <UTXOFooter
        setEnableSelection={jest.fn()}
        enableSelection={false}
        wallet={mockWallet}
        utxos={[spendableUTXO]}
        doNotSpendUTXOs={[]}
        onDonateDust={jest.fn()}
      />
    );
    expect(queryByTestId('btn_Donate Dust')).toBeNull();
  });

  it('6.1.3 — does NOT render Donate Dust button when doNotSpendUTXOs is not provided', () => {
    const { queryByTestId } = render(
      <UTXOFooter
        setEnableSelection={jest.fn()}
        enableSelection={false}
        wallet={mockWallet}
        utxos={[spendableUTXO]}
      />
    );
    expect(queryByTestId('btn_Donate Dust')).toBeNull();
  });
});
