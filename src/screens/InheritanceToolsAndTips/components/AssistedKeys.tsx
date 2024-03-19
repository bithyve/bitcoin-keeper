import React from 'react';
import { useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import InheritanceHeader from '../InheritanceHeader';
import Chip from 'src/assets/images/chip.svg';
import Add from 'src/assets/images/add-green.svg';

import AssistedKeysIcon from 'src/assets/images/assisted-key.svg';
import AssistedKeysSlider from '../AssistedKeysSlider';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Signing Server',
      description: 'Use 2FA code to sign a transaction',
      icon: <AssistedKeysIcon />,
      paragraph2:
        'Please setup the 2FA on a different phone. You would only require the 2FA for a specified amount that would be within a range set by you. Below the minimum amount the 2FA won’t be needed, while you’ll be prompted to use a different key beyond the maximum amount.',
      paragraph:
        'Allows an automated script to sign the transaction when correct 2FA code is provided. The Key is meant to give you flexibility in signing transactions via the spend policy feature.',
      callBack: () => {},
      buttonIcon: <Chip />,
      buttonTitle: 'Manage Keys',
      buttonDescription: 'Setup Signer Server',
      note: 'Signing Server is a hot key. Please decide the amount you’d like to use Signing Server for, carefully.',
    },
    {
      title: 'Inheritance Key',
      description: 'To be considered while inheritance planning',
      icon: <AssistedKeysIcon />,
      paragraph2:
        'When a request is made to use this key for signing or recovery, there is a 30 day delay. This gives time to the user to decline the request if they don’t identify it. The request alerts are sent on the app and can also be sent on email or via sms.',
      paragraph:
        'Inheritance Key is an additional key available to increase the security of the vault without having to buy a hardware signer. It is available to all Diamond Hands subscribers.',
      callBack: () => {},
      buttonIcon: <Add />,
      buttonTitle: 'Add Inheritance Key',
      buttonDescription: 'Add to the vault you want to bequeath',
      note: 'Please provide detailed explanations and support to your heir via the inheritance document templates',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader slider={true} />
      <AssistedKeysSlider items={tips} />
    </ScreenWrapper>
  );
}

export default InheritanceTips;
