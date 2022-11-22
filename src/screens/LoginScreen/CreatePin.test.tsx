import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CreatePin from './CreatePin';
import { store } from '../../store/store';
import { initialState as loginState } from '../../store/reducers/login';
import { NativeBaseProvider } from 'native-base';
import { customTheme } from 'src/common/themes';

const middlewares = [];
const mockStore = configureStore(middlewares);
const store1 = store;

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('testing app', () => {
  beforeEach(() => {
    const route = { params: {} };
    const navigation = jest.fn();
    render(
      <Provider store={store1}>
        <NativeBaseProvider initialWindowMetrics={inset} theme={customTheme}>
          <CreatePin navigation={navigation} route={route} />
        </NativeBaseProvider>
      </Provider>
    );
  });

  it('loaded correctly', () => {
    expect(store1.getState().login).toEqual(loginState);
  });

  it('should render without crashing', () => {
    expect(screen).toBeDefined();
  });

  test('check click', () => {
    const key1 = screen.queryByTestId('key_1');

    fireEvent.press(key1);
    fireEvent.press(key1);

    fireEvent.press(key1);

    fireEvent.press(key1);
    const button = screen.queryByTestId('button');
    expect(button.props).toHaveProperty('focusable', true);
    expect(button.props).toHaveProperty('focusable', true);
  });
});
