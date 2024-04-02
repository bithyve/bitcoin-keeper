import React from 'react';
import { useColorMode } from 'native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import ThoroughVerification from 'src/assets/images/thorough-verification.svg';
import PreliminaryTest from 'src/assets/images/preliminary-test.svg';
import SecureCoordination from 'src/assets/images/secure-coordination.svg';
import CrossDeviceVerification from 'src/assets/images/cross-device-verification.svg';

import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Thorough Verification of Transaction Details',
      icon: <ThoroughVerification />,
      paragraph:
        'Carefully review all transaction details, particularly the recipient’s address, within your multi-key setup. This careful attention is essential to avoid errors and secure your transactions, ensuring the safety of your bitcoin.',
      paragraph2:
        'It is recommended to use atleast one hardware device with a screen. This allows to register your multi-key quorum on the device and thoroughly check transactions.',
    },

    {
      title: 'Preliminary Test Transactions',
      icon: <PreliminaryTest />,
      paragraph:
        'Before making significant transfers, conduct a small test transaction. This step verifies the transaction’s accuracy and confirms the smooth functioning of your multi-key setup, adding a protective layer to your bitcoin transactions.',
      paragraph2:
        'This will not just ensure that the system is working as intended but will also be a practice for you before you actually need it.',
    },
    {
      title: 'Secure Coordination Among Key Holders',
      icon: <SecureCoordination />,
      paragraph:
        'Use encrypted communication for coordinating transaction approvals with other key holders. This ensures everyone is on the same page regarding the transaction details, protecting the integrity of your bitcoin transactions.',
      paragraph2:
        'Please screen your key holders for trustworthiness in terms of handling the key and having your best interest in mind.',
    },
    {
      title: 'Cross-Device Verification',
      icon: <CrossDeviceVerification />,
      paragraph:
        'To further enhance security, verify transaction details on multiple devices involved in your multi-key setup. This approach can help identify any discrepancies or fraudulent attempts, securing your bitcoin transactions effectively.',
      paragraph2:
        'You are encouraged to recreate the multi-key setup on another co-ordinator app to have complete independence from Keeper.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text style={styles.container} color={`${colorMode}.white`}>
        Tips for Doing Transactions Securely
      </Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

export default SafeGuardingTips;

const styles = StyleSheet.create({
  container: {
    marginLeft: wp(10),
  },
});
