import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { CommonActions } from '@react-navigation/native';
import { ViewRecoveryKeyScreen } from 'src/screens/BackupWallet/ViewRecoveryKeyScreen';

const mockNavigationDispatch = jest.fn();

jest.mock('@gluestack-ui/themed-native-base', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    Box: ({ children }) => <View>{children}</View>,
    View: ({ children }) => <View>{children}</View>,
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
          confirm: 'Confirm',
          skip: 'Skip',
        },
        home: {
          backupModalTitle: 'Confirm your Recovery Key',
        },
        BackupWallet: {
          recoveryConfirmDesc1: 'desc 1',
          recoveryConfirmDesc2: 'desc 2',
          recoveryKeyConfirmDialog: 'Recovery Key confirmed',
          recoveryKeyConfirmDialogSubTitle: 'Done',
        },
      },
    }),
  };
});

jest.mock('src/components/ScreenWrapper', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children }) => <View>{children}</View>;
});
jest.mock('src/components/WalletHeader', () => () => null);
jest.mock('src/components/ThemedColor/ThemedColor', () => () => '#000');
jest.mock('src/components/Modal/ModalWrapper', () => () => null);
jest.mock('src/components/SeedWordBackup/ConfirmSeedWord', () => () => null);
jest.mock('src/components/AppActivityIndicator/ActivityIndicatorView', () => () => null);
jest.mock('src/components/KeeperModal', () => () => null);

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (selector) =>
    selector({
      settings: {
        themeMode: 'LIGHT',
      },
    }),
}));
jest.mock('src/store/sagaActions/bhr', () => ({
  backupAllSignersAndVaults: jest.fn(() => ({ type: 'BACKUP_ALL_SIGNERS_AND_VAULTS' })),
  seedBackedUp: jest.fn(() => ({ type: 'SEED_BACKED_UP' })),
}));
jest.mock('src/store/reducers/account', () => ({
  setRecoveryKeyBackedUp: jest.fn((payload) => ({ type: 'SET_RECOVERY_KEY_BACKED_UP', payload })),
}));
jest.mock('src/store/reducers/bhr', () => ({
  setAutomaticCloudBackup: jest.fn((payload) => ({ type: 'SET_AUTOMATIC_CLOUD_BACKUP', payload })),
  setBackupAllFailure: jest.fn((payload) => ({ type: 'SET_BACKUP_ALL_FAILURE', payload })),
  setBackupAllSuccess: jest.fn((payload) => ({ type: 'SET_BACKUP_ALL_SUCCESS', payload })),
}));
jest.mock('src/store/hooks', () => ({
  useAppSelector: (selector) =>
    selector({
      bhr: {
        backupAllFailure: false,
        backupAllSuccess: false,
      },
    }),
}));
jest.mock('@realm/react', () => ({
  useQuery: jest.fn(() => [
    {
      id: 'app-1',
      primaryMnemonic:
        'abandon ability able about above absent absorb abstract absurd abuse access accident',
    },
  ]),
}));
jest.mock('src/storage/realm/utils', () => ({
  getJSONFromRealmObject: (value) => value,
}));
jest.mock('@react-navigation/native', () => ({
  CommonActions: {
    reset: jest.fn((payload) => ({ type: 'RESET', payload })),
  },
}));

describe('ViewRecoveryKeyScreen', () => {
  it('returns to Home when the user taps skip', () => {
    const { getByTestId } = render(
      <ViewRecoveryKeyScreen navigation={{ dispatch: mockNavigationDispatch }} />
    );

    fireEvent.press(getByTestId('btn_secondaryText'));

    expect(CommonActions.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    expect(mockNavigationDispatch).toHaveBeenCalledWith({
      type: 'RESET',
      payload: {
        index: 0,
        routes: [{ name: 'Home' }],
      },
    });
  });
});
