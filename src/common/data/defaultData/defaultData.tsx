import SecutityTip from 'src/assets/images/securityTip.svg';
import React from 'react';

export const securityTips = [
  {
    title: 'Security Tip',
    subTitle: 'Check the send-to address on a signing device you are going to use to sign the transaction.',
    assert: <SecutityTip />,
    message:
      'This ensures that the signed transaction has the intended recipient and the address was not swapped',
  },
  {
    title: 'Security Tip',
    subTitle: 'Devices with Register Vault tag provide additional checks when you are sending funds from your Vault',
    assert: <SecutityTip />,
    message:
      'These provide additional security checks when you make an outgoing transaction',
  },
  {
    title: 'Security Tip',
    subTitle: 'You can get a receive address directly from a signing device and do not have to trust the Keeper app',
    assert: <SecutityTip />,
    message:
      'This will mean that the funds are received at the correct address',
  },
  {
    title: 'Security Tip',
    subTitle: 'Recreate the Vault on another coordinator software and check if the multisig has the same details',
    assert: <SecutityTip />,
    message:
      'This is a way to minimise the trust you have to have on Keeper',
  },
  {
    title: 'Security Tip',
    subTitle: 'Recreate the multisig on more coordinators. Receive a small amount and send a part of it. Check the balances are appropriately reflected across all the coordinators after each step.',
    assert: <SecutityTip />,
    message:
      'Testing out your setup before using it is always a good idea',
  }
]
export const getSecurityTip = () => securityTips[Math.round(Math.random() * securityTips.length - 1)]