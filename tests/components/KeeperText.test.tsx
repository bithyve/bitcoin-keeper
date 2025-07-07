// tests/components/KeeperText.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import KeeperText from 'src/components/KeeperText'; // Renamed import to avoid conflict with NativeBase Text

// A simple wrapper to provide the NativeBase context for testing
const AllProviders = ({ children }) => <NativeBaseProvider>{children}</NativeBaseProvider>;

describe('KeeperText Component', () => {
  // Test 1: Renders children correctly with default fontWeight (400) and no custom styles
  it('renders children correctly with default fontWeight (400)', () => {
    const { getByTestId } = render(<KeeperText testID="default_text">Default Text</KeeperText>, {
      wrapper: AllProviders,
    });

    const textElement = getByTestId('default_text');
    expect(textElement).toBeTruthy();
    expect(textElement.props.children).toBe('Default Text');
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontWeight: 400 })])
    );
  });
});
