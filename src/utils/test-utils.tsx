import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NativeBaseProvider } from 'native-base';
import { customTheme } from 'src/navigation/themes';
import { store } from '../store/store';
import { configureStore } from '@reduxjs/toolkit';

const initialStore = store;
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const mockReducer = () => ({});
const testStore = configureStore({
  reducer: { mock: mockReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

function AllTheProviders({ children }) {
  return (
    <Provider store={testStore}>
      <NativeBaseProvider initialWindowMetrics={inset} theme={customTheme}>
        {children}
      </NativeBaseProvider>
    </Provider>
  );
}

const customRender = (ui, options = {}) => render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render };
