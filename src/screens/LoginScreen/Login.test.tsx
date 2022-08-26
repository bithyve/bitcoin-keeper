import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Login from './Login';
import { rootReducer, store } from '../../store/store';
import { initialState as loginState } from '../../store/reducers/login';
import { NativeBaseProvider } from 'native-base';
import { customTheme } from 'src/common/themes';

const middlewares = [];
const mockStore = configureStore(middlewares);
const store1 = store;

describe('testing app', () => {
  test('loaded correctly', () => {
    expect(store1.getState().login).toEqual(loginState);
  });

  it('testing asynch', () => {
    const route = { params: {} };
    const navigation = jest.fn();
    const rr = render(
      <Provider store={store1}>
        <NativeBaseProvider theme={customTheme}>
          <Login navigation={navigation} route={route} />
        </NativeBaseProvider>
      </Provider>
    );
  });
});
