import React from 'react';
import { render } from '@testing-library/react-native';
import Text from 'src/components/KeeperText';

describe('KeeperText Component', () => {
  it('renders children correctly with default fontWeight', () => {
    const { getByText } = render(<Text>Test Text</Text>);
    const textElement = getByText('Test Text');

    expect(textElement).toBeTruthy();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontWeight: 400 }), // default fontWeight
      ])
    );
  });

  it('applies semiBold fontWeight', () => {
    const { getByText } = render(<Text semiBold>Bold Text</Text>);
    const textElement = getByText('Bold Text');

    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontWeight: 600 }), // semiBold = 600
      ])
    );
  });
});
