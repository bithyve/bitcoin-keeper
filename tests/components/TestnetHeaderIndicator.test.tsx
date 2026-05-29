jest.mock('src/utils/utilities', () => ({
  capitalizeEachWord: (text: string) =>
    text
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
}));

jest.mock('src/components/KeeperText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ children, testID = undefined, ...props }) => <Text testID={testID}>{children}</Text>;
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ dispatch: jest.fn(), goBack: jest.fn() }),
  useFocusEffect: jest.fn(),
  CommonActions: { navigate: jest.fn() },
}));

jest.mock('src/hooks/useUaiStack', () => ({
  __esModule: true,
  default: () => ({ uaiStack: [] }),
  uaiPriorityMap: {},
}));

jest.mock('src/hooks/useSignerMap', () => ({
  __esModule: true,
  default: () => ({ signerMap: {} }),
}));

jest.mock('src/hooks/useToastMessage', () => ({
  __esModule: true,
  default: () => ({ showToast: jest.fn() }),
}));

jest.mock('src/components/ThemedColor/ThemedColor', () => ({
  __esModule: true,
  default: () => '#000',
}));

jest.mock('src/components/ThemedSvg.tsx/ThemedSvg', () => {
  return () => null;
});

jest.mock('src/assets/images/header-notification-simple-icon.svg', () => () => null);
jest.mock('src/assets/images/header-notifications-dot-icon.svg', () => () => null);
jest.mock('src/assets/images/x.svg', () => () => null);

jest.mock('src/store/reducers/cachedTxn', () => ({
  cachedTxSnapshot: {},
}));

jest.mock('src/store/sagaActions/uai', () => ({
  uaiActioned: jest.fn(),
  uaisSeen: jest.fn(),
}));

jest.mock('src/store/sagaActions/bhr', () => ({
  backupAllSignersAndVaults: jest.fn(),
}));

jest.mock('src/store/reducers/send_and_receive', () => ({
  setStateFromSnapshot: jest.fn(),
}));

jest.mock('src/store/reducers/uai', () => ({
  setRefreshUai: jest.fn(),
}));

jest.mock('src/screens/Home/Notifications/NotificationsCenter', () => ({
  getUaiContent: jest.fn(),
}));

jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBuildNumber: () => '100',
  getSystemName: () => 'iOS',
  getUniqueId: () => 'mocked-device-id',
  getManufacturer: () => Promise.resolve('MockedManufacturer'),
}));

import React from 'react';
import { render } from 'src/utils/test-utils';
import HomeScreenHeader from 'src/components/HomeScreenHeader';
import { NetworkType } from 'src/services/wallets/enums';

const basePreloadedState = {
  settings: {
    bitcoinNetworkType: NetworkType.MAINNET,
    themeMode: 'LIGHT',
  },
  cachedTxn: { snapshots: {} },
  uai: { refreshUai: false },
};

describe('HomeScreenHeader — testnet title suffix', () => {
  it('4.1 renders "Wallets (Testnet)" when titleSuffix is passed', () => {
    const { getByTestId } = render(
      <HomeScreenHeader
        colorMode="light"
        title="Wallets"
        titleSuffix=" (Testnet)"
        circleIconWrapper={null}
      />,
      { preloadedState: basePreloadedState }
    );
    const textEl = getByTestId('text_home_current_plan');
    const content = Array.isArray(textEl.props.children)
      ? textEl.props.children.join('')
      : String(textEl.props.children ?? '');
    expect(content).toContain('(Testnet)');
  });

  it('4.2 renders "Keys (Testnet)" when titleSuffix is passed', () => {
    const { getByTestId } = render(
      <HomeScreenHeader
        colorMode="light"
        title="Keys"
        titleSuffix=" (Testnet)"
        circleIconWrapper={null}
      />,
      { preloadedState: basePreloadedState }
    );
    const textEl = getByTestId('text_home_current_plan');
    const content = Array.isArray(textEl.props.children)
      ? textEl.props.children.join('')
      : String(textEl.props.children ?? '');
    expect(content).toContain('(Testnet)');
  });

  it('4.5 renders "Wallets" without "(Testnet)" when titleSuffix is undefined', () => {
    const { getByTestId } = render(
      <HomeScreenHeader
        colorMode="light"
        title="Wallets"
        titleSuffix={undefined}
        circleIconWrapper={null}
      />,
      { preloadedState: basePreloadedState }
    );
    const textEl = getByTestId('text_home_current_plan');
    const content = Array.isArray(textEl.props.children)
      ? textEl.props.children.join('')
      : String(textEl.props.children ?? '');
    expect(content).not.toContain('Testnet');
  });

  it('4.5 renders "Keys" without "(Testnet)" when titleSuffix is undefined', () => {
    const { getByTestId } = render(
      <HomeScreenHeader
        colorMode="light"
        title="Keys"
        titleSuffix={undefined}
        circleIconWrapper={null}
      />,
      { preloadedState: basePreloadedState }
    );
    const textEl = getByTestId('text_home_current_plan');
    const content = Array.isArray(textEl.props.children)
      ? textEl.props.children.join('')
      : String(textEl.props.children ?? '');
    expect(content).not.toContain('Testnet');
  });
});
