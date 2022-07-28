import 'react-native';
import React from 'react';
import render from 'react-test-renderer';
import SendConfirmation from 'src/screens/Send/SendConfirmation';

test('Send Confirmation', () => {
  const snap = render.create(<SendConfirmation route />).toJSON();
  expect(snap).toMatchInlineSnapshot();
});
