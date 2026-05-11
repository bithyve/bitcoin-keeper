import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import HomeScreen from 'src/screens/Home/HomeScreen';

const mockNavigationDispatch = jest.fn();

jest.mock('@gluestack-ui/themed-native-base', () => {
  const React = require('react');
  const { TouchableOpacity, View } = require('react-native');

  return {
    Box: ({ children }) => <View>{children}</View>,
    Checkbox: ({ isChecked, onChange, testID }) => (
      <TouchableOpacity testID={testID} onPress={() => onChange(!isChecked)} />
    ),
    useColorMode: () => ({ colorMode: 'light' }),
  };
});

jest.mock('src/components/KeeperText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ children }) => <Text>{children}</Text>;
});
jest.mock('src/context/Localization/LocContext', () => {
  const React = require('react');
  return {
    LocalizationContext: React.createContext({
      translations: {
        common: {
          continue: 'Continue',
          skip: 'Skip',
        },
        home: {
          backupModalTitle: 'Confirm your Recovery Key',
          backupModalSubTitle: 'To make sure your Recovery Key is not lost, you need to confirm it.',
          backupModalDesc: 'Backup description',
          backupModalRiskDesc: 'Risk description',
          backupModalSkipAcknowledge: 'I understand the risks',
        },
        wallet: {
          homeWallets: 'Wallets',
          keys: 'Keys',
          concierge: 'Concierge',
          more: 'More',
        },
        buyBTC: {
          acquire: 'Acquire',
        },
      },
    }),
  };
});

jest.mock('src/screens/Home/InititalAppController', () => () => null);
jest.mock('src/components/HomeScreenHeader', () => () => null);
jest.mock('src/components/CircleIconWrapper', () => () => null);
jest.mock('src/components/MenuFooter', () => () => null);
jest.mock('src/screens/Home/components/Wallet/HomeWallet', () => () => null);
jest.mock('src/screens/Home/components/Keys/ManageKeys', () => () => null);
jest.mock('src/screens/Home/components/Settings/keeperSettings', () => () => null);
jest.mock('src/screens/Home/components/buyBtc/BuyBtc', () => () => null);
jest.mock('src/screens/Home/components/ConciergeComponent', () => () => null);
jest.mock('src/components/ThemedSvg.tsx/ThemedSvg', () => () => null);
jest.mock('src/components/ThemedColor/ThemedColor', () => () => '#000');
jest.mock('src/services/sentry', () => ({
  SentryErrorBoundary: (Component) => Component,
}));
jest.mock('src/assets/images/toast_error.svg', () => 'ToastErrorIcon');
jest.mock('src/assets/images/icon_tick.svg', () => 'TickIcon');

jest.mock('src/components/KeeperModal', () => {
  const React = require('react');
  const { TouchableOpacity, View, Text } = require('react-native');

  return function MockKeeperModal(props) {
    if (!props.visible) return null;
    const Content = props.Content || (() => null);

    return (
      <View>
        <Content />
        {props.secondaryButtonText ? (
          <TouchableOpacity
            testID="btn_mock_secondary_modal"
            disabled={props.secondaryDisable}
            accessibilityState={{ disabled: props.secondaryDisable }}
            onPress={props.secondaryCallback}
          >
            <Text>{props.secondaryButtonText}</Text>
          </TouchableOpacity>
        ) : null}
        {props.buttonText ? (
          <TouchableOpacity testID="btn_mock_primary_modal" onPress={props.buttonCallback}>
            <Text>{props.buttonText}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };
});

jest.mock('src/hooks/useWallets', () => () => ({ wallets: [] }));
jest.mock('src/hooks/useToastMessage', () => () => ({ showToast: jest.fn() }));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));
jest.mock('src/store/reducers/bhr', () => ({
  resetRealyWalletState: jest.fn(() => ({ type: 'RESET_RELAY_WALLET_STATE' })),
  setHomeToastMessage: jest.fn((payload) => ({ type: 'SET_HOME_TOAST_MESSAGE', payload })),
}));
jest.mock('src/store/hooks', () => ({
  useAppSelector: (selector) =>
    selector({
      bhr: {
        relayWalletUpdate: false,
        relayWalletError: false,
        realyWalletErrorMessage: null,
        homeToastMessage: { message: null, isError: false },
      },
      account: {
        recoveryKeyBackedUpByAppId: {},
      },
    }),
}));
jest.mock('@realm/react', () => ({
  useQuery: jest.fn(() => []),
}));
jest.mock('src/storage/realm/dbManager', () => ({
  __esModule: true,
  default: {
    getObjectByIndex: jest.fn(() => ({ id: 'app-1' })),
  },
}));
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: jest.fn((payload) => ({ type: 'RESET', payload })),
  },
  useFocusEffect: (callback) => callback(),
  useNavigation: () => ({
    dispatch: mockNavigationDispatch,
    navigate: jest.fn(),
  }),
}));

describe('HomeScreen', () => {
  it('gates skip behind the risk acknowledgement checkbox', () => {
    const { getByTestId, queryByTestId } = render(<HomeScreen route={{ params: {} }} />);

    const skipButton = getByTestId('btn_mock_secondary_modal');
    expect(skipButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(getByTestId('checkbox_backup_skip_acknowledgement'));

    expect(getByTestId('btn_mock_secondary_modal').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(getByTestId('btn_mock_secondary_modal'));

    expect(queryByTestId('btn_mock_secondary_modal')).toBeNull();
    expect(mockNavigationDispatch).not.toHaveBeenCalled();
  });
});
