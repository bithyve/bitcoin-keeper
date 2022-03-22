import React from 'react';
import { StyleSheet } from 'react-native';
import Navigator from './src/navigation';
import makeStore from './src/store'
import { Provider } from 'react-redux'

export default function AppWrapper() {
  // Creates and holds an instance of the store so only children in the `Provider`'s
  // context can have access to it.
  const store = makeStore()


  return (
    <Provider store={store}>
      <App/>
    </Provider>
  )

}

const App = () => {
  return (
      <Navigator />
  )
};

