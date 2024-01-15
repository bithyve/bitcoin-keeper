import WhirlpoolLoader from 'src/components/WhirlpoolLoader';
import React from 'react';
import LoadingAnimation from 'src/components/Loader';
import InheritanceToolsIllustartion from 'src/components/SVGComponents/InheritanceToolsIllustartion';

export const securityTips = [
  {
    title: 'Introducing Whirlpool',
    subTitle:
      'Whirlpool gives you forward looking privacy by breaking deterministic links of your future transactions from past ones',
    assert: <WhirlpoolLoader />,
    message:
      'For increased privacy and security, remix sats a few times, then transfer them to the Vault',
  },
  {
    title: 'Connecting to Node',
    subTitle: 'Interact with the bitcoin network more privately and securely',
    assert: <LoadingAnimation />,
    message:
      'Eliminate reliance on third parties to validate financial transactions and hold your funds.',
  },
  {
    title: 'Security Tip',
    subTitle:
      'You can get a receive address directly from a signer and do not have to trust the Keeper app',
    assert: <LoadingAnimation />,
    message: 'This will mean that the funds are received at the correct address',
  },
  {
    title: 'Introducing Inheritance Tools',
    subTitle:
      'Use Inheritance documents for your inheritance planning. Inheritance Key is an assisted key that can be availed by your heir',
    assert: <InheritanceToolsIllustartion />,
    message: 'Consult your estate planner for incorporating documents from this app in your will',
  },
  {
    title: 'Keep your signers safe',
    subTitle: 'Signers are what control your funds.',
    assert: <LoadingAnimation />,
    message: 'These are generally offline and to keep them secure is your responsibility. ',
  },
  {
    title: 'Security Tip',
    subTitle:
      'Recreate the multisig Vault on more coordinators. Receive a small amount and send a part of it. Check whether the balances are appropriately reflected across all the coordinators after each step',
    assert: <LoadingAnimation />,
    message: 'Testing out your setup before using it is always a good idea',
  },
];
export const getSecurityTip = () => {
  const selected = Math.floor(Math.random() * securityTips.length); // Comment for creating wallet modal WP
  return securityTips[selected];
};
