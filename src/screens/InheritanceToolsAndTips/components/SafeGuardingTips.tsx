import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import Text from 'src/components/KeeperText';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Thorough Verification of Transaction Details',
      icon: <CanaryIcon />,
      paragraph:
        'Carefully review all transaction details, particularly the recipient’s address, within your multi-key setup. This careful attention is essential to avoid errors and secure your transactions, ensuring the safety of your bitcoin.',
      paragraph2:
        'It is recommended to use atleast one hardware device with a screen. This allows to register your multi-key quorum on the device and thoroughly check transactions.',
    },

    {
      title: 'Preliminary Test Transactions',
      icon: <CanaryIcon />,
      paragraph:
        'Before making significant transfers, conduct a small test transaction. This step verifies the transaction’s accuracy and confirms the smooth functioning of your multi-key setup, adding a protective layer to your bitcoin transactions.',
      paragraph2:
        'This will not just ensure that the system is working as intended but will also be a practice for you before you actually need it.',
    },
    {
      title: 'Secure Coordination Among Key Holders',
      icon: <CanaryIcon />,
      paragraph:
        'Use encrypted communication for coordinating transaction approvals with other key holders. This ensures everyone is on the same page regarding the transaction details, protecting the integrity of your bitcoin transactions.',
      paragraph2:
        'Please screen your key holders for trustworthiness in terms of handling the key and having your best interest in mind.',
    },
    {
      title: 'Cross-Device Verification',
      icon: <CanaryIcon />,
      paragraph:
        'To further enhance security, verify transaction details on multiple devices involved in your multi-key setup. This approach can help identify any discrepancies or fraudulent attempts, securing your bitcoin transactions effectively.',
      paragraph2:
        'You are encouraged to recreate the multi-key setup on another co-ordinator app to have complete independence from Keeper',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text color={`${colorMode}.white`}>Tips for Doing Transactions Securely</Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginLeft: wp(20),
  },
});

export default SafeGuardingTips;
