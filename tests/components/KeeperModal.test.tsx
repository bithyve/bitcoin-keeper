import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import KeeperModal from 'src/components/KeeperModal';

// ✅ Mock KeeperText with testID pass-through
jest.mock('src/components/KeeperText', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ children, testID }) => <Text testID={testID}>{children}</Text>;
});

// ✅ Disable NativeBase Modal portal rendering
jest.mock('native-base/lib/commonjs/components/composites/Modal/ModalContent', () => {
  return {
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  };
});

// ✅ Basic gesture handler mock
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: ({ children }) => <View>{children}</View>,
    TouchableOpacity: ({ children, ...props }) => <View {...props}>{children}</View>,
  };
});

const AllProviders = ({ children }) => (
  <SafeAreaProvider>
    <NativeBaseProvider>{children}</NativeBaseProvider>
  </SafeAreaProvider>
);

describe('KeeperModal Component', () => {
  it('renders modal title when visible', () => {
    const { getByTestId } = render(
      <KeeperModal visible={true} close={() => {}} title="Test Modal" Content={() => <></>} />,
      { wrapper: AllProviders }
    );

    expect(getByTestId('text_modal_title').props.children).toBe('Test Modal');
  });
});
