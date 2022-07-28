import 'react-native';
import React from 'react';
import renderer from 'react-test-renderer';
import SendConfirmation from 'src/screens/Send/SendConfirmation';

test('Send Confirmation', () => {
  const snap = renderer.create(<SendConfirmation route />).toJSON();
  expect(snap).toMatchInlineSnapshot();
});
