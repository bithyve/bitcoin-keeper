jest.mock('src/components/KeeperText', () => {
  return ({ children }) => <span>{children}</span>;
});

import React from 'react';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import NodeSettings from '../../src/screens/AppSettings/Node/NodeSettings';
import { render, waitFor, within } from '@testing-library/react-native';

let mockNodes = [];
let mockNavigationDispatch = jest.fn();
let mockAppDispatch = jest.fn();
const mockTranslations = {
  common: {
    disconnectingFromServer: 'Disconnect',
    disconnectingFromServerText: 'Disconnect text',
    cancel: 'Cancel',
  },
  settings: {
    nodeSettings: 'Server Settings',
    manageElectrumServersSubtitle: 'Manage your saved Electrum servers',
    noNodeWarning1: 'Please add a server to use the app.',
    noNodeWarning2: 'Please connect to any server to use the app.',
    addNewNode: 'Add New Node',
  },
  error: {
    ConnectedTo: 'Connected to',
    disconnectedFrom: 'Disconnected from',
    failedToDiConnect: 'Disconnect failed',
  },
};

jest.mock('src/context/Localization/LocContext', () => {
  const React = require('react');

  return {
    LocalizationContext: React.createContext({}),
  };
});

jest.mock('@gluestack-ui/themed-native-base', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Box: ({ children, ...props }) => <View {...props}>{children}</View>,
    useColorMode: () => ({ colorMode: 'light', toggleColorMode: jest.fn() }),
  };
});

jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    navigate: jest.fn((screen) => screen),
  },
  useNavigation: () => ({
    dispatch: mockNavigationDispatch,
  }),
}));

jest.mock('src/store/hooks', () => ({
  useAppDispatch: () => mockAppDispatch,
}));

jest.mock('src/hooks/useToastMessage', () => () => ({
  showToast: jest.fn(),
}));

jest.mock('src/store/reducers/login', () => ({
  electrumClientConnectionExecuted: jest.fn((payload) => payload),
  electrumClientConnectionInitiated: jest.fn(() => ({ type: 'INIT' })),
}));

jest.mock('src/store/sagaActions/bhr', () => ({
  updateAppImage: jest.fn((payload) => payload),
}));

jest.mock('src/services/electrum/client', () => ({
  ELECTRUM_CLIENT: {
    isClientConnected: false,
  },
}));

jest.mock('src/services/electrum/node', () => ({
  __esModule: true,
  default: {
    getAllNodes: jest.fn(() => mockNodes),
    nodeConnectionStatus: jest.fn((node) => node.isConnected),
    disconnect: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    connectToSelectedNode: jest.fn(),
  },
}));

jest.mock('src/components/ScreenWrapper', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

jest.mock('src/components/KeeperModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('src/components/WalletHeader', () => ({
  __esModule: true,
  default: ({ title, subTitle }) => {
    const { Text, View } = require('react-native');

    return (
      <View>
        <Text>{title}</Text>
        <Text>{subTitle}</Text>
      </View>
    );
  },
}));

jest.mock('src/components/Buttons', () => ({
  __esModule: true,
  default: ({ primaryText }) => {
    const { Text } = require('react-native');

    return <Text>{primaryText}</Text>;
  },
}));

jest.mock('src/components/EmptyListIllustration', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');

    return <Text>EmptyList</Text>;
  },
}));

jest.mock('src/components/WarningNote', () => ({
  __esModule: true,
  default: ({ noteText }) => {
    const { Text } = require('react-native');

    return <Text>{noteText}</Text>;
  },
}));

jest.mock('src/components/AppActivityIndicator/ActivityIndicatorView', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../src/screens/AppSettings/Node/components/ServerItem', () => ({
  __esModule: true,
  default: ({ item }) => {
    const { Text } = require('react-native');

    return <Text>{item.host}</Text>;
  },
}));

jest.mock('src/assets/images/toast_error.svg', () => () => null);
jest.mock('src/assets/images/icon_tick.svg', () => () => null);
jest.mock('src/assets/images/downgradetopleb.svg', () => () => null);
jest.mock('src/assets/images/downgradetoplebDark.svg', () => () => null);

const { ELECTRUM_CLIENT: mockElectrumClient } = jest.requireMock('src/services/electrum/client');

const renderNodeSettings = () =>
  render(
    <LocalizationContext.Provider value={{ translations: mockTranslations }}>
      <NodeSettings />
    </LocalizationContext.Provider>
  );

describe('NodeSettings', () => {
  beforeEach(() => {
    mockNodes = [];
    mockElectrumClient.isClientConnected = false;
    mockNavigationDispatch.mockClear();
    mockAppDispatch.mockClear();
  });

  it('renders the disconnected warning inside the list footer when saved servers exist', async () => {
    mockNodes = [{ id: '1', host: 'electrum.example.com', port: '50002', isConnected: false }];

    const screen = renderNodeSettings();

    await waitFor(() => expect(screen.getByText('electrum.example.com')).toBeTruthy());

    expect(
      within(screen.getByTestId('server-settings-warning-footer')).getByText(
        mockTranslations.settings.noNodeWarning2
      )
    ).toBeTruthy();
    expect(screen.queryByText(mockTranslations.settings.noNodeWarning1)).toBeNull();
  });

  it('keeps the empty-state warning outside the list footer when no servers exist', async () => {
    const screen = renderNodeSettings();

    await waitFor(() => expect(screen.getByText(mockTranslations.settings.noNodeWarning1)).toBeTruthy());

    expect(screen.queryByTestId('server-settings-warning-footer')).toBeNull();
    expect(screen.queryByText(mockTranslations.settings.noNodeWarning2)).toBeNull();
  });
});
