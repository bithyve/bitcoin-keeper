/**
 * Component tests for RecoveryKeyReminderBanner.
 * Task 7.4: renders correctly and fires onPress
 */
jest.mock('src/components/KeeperText', () => {
  const { Text } = require('react-native');
  return ({ children, ...props }) => <Text {...props}>{children}</Text>;
});

jest.mock('src/context/Localization/LocContext', () => ({
  LocalizationContext: {
    _currentValue: {
      translations: {
        home: {
          recoveryKeyNotBackedUp: 'Recovery Key not backed up',
          backUpNow: 'Back Up Now',
        },
      },
    },
  },
}));

jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBuildNumber: () => '100',
  getSystemName: () => 'iOS',
  getUniqueId: () => 'mocked-device-id',
  getManufacturer: () => Promise.resolve('MockedManufacturer'),
}));

import React from 'react';
import { render, fireEvent } from 'src/utils/test-utils';
import RecoveryKeyReminderBanner from 'src/components/RecoveryKeyReminderBanner';

describe('RecoveryKeyReminderBanner', () => {
  it('renders label and CTA text', () => {
    const { getByText } = render(
      <RecoveryKeyReminderBanner onPress={() => {}} />
    );
    expect(getByText('Recovery Key not backed up')).toBeTruthy();
    expect(getByText('Back Up Now')).toBeTruthy();
  });

  it('calls onPress when Back Up Now is tapped', () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(
      <RecoveryKeyReminderBanner onPress={mockPress} />
    );
    fireEvent.press(getByTestId('btn_reminder_backup_now'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
