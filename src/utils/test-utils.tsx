import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NativeBaseProvider } from '@gluestack-ui/themed-native-base';
import { customTheme } from 'src/navigation/themes';
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: (state = preloadedState) => state,
    preloadedState,
  });

function AllTheProviders({ children, store }) {
  return (
    <Provider store={store}>
      <NativeBaseProvider initialWindowMetrics={inset} theme={customTheme}>
        {children}
      </NativeBaseProvider>
    </Provider>
  );
}

const customRender = (ui, options = {}) => {
  const {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = options;

  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders store={store}>{children}</AllTheProviders>,
    ...renderOptions,
  });
};

// re-export everything
export * from '@testing-library/react-native';

// override render method
export { customRender as render };
