import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';

jest.mock('src/components/Animations/ScaleSpring', () => ({ children }: React.PropsWithChildren) => children);
jest.mock('src/components/ThemedColor/ThemedColor', () => jest.fn(() => '#ffffff'));

describe('KeyPadView', () => {
  it('renders digits 0 through 9', () => {
    const { getByText, getByTestId } = render(
      <KeyPadView
        onPressNumber={jest.fn()}
        onDeletePressed={jest.fn()}
        bubbleEffect
        ClearIcon={<span />}
      />
    );

    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].forEach((digit) => {
      expect(getByText(digit)).toBeTruthy();
    });
    expect(getByTestId('btn_clear')).toBeTruthy();
  });

  it('emits numeric values and delete presses', () => {
    const onPressNumber = jest.fn();
    const onDeletePressed = jest.fn();
    const { getByTestId } = render(
      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        bubbleEffect
        ClearIcon={<span />}
      />
    );

    fireEvent.press(getByTestId('key_1'));
    fireEvent.press(getByTestId('key_0'));
    fireEvent.press(getByTestId('btn_clear'));

    expect(onPressNumber).toHaveBeenNthCalledWith(1, '1');
    expect(onPressNumber).toHaveBeenNthCalledWith(2, '0');
    expect(onDeletePressed).toHaveBeenCalledTimes(1);
  });
});
