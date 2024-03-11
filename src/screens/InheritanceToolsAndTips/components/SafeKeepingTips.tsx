import React from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import CanaryIcon from 'src/assets/images/canary-wallets.svg';
import Text from 'src/components/KeeperText';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Activate Multi-Key (Multisig) Security:',
      icon: <CanaryIcon />,
      paragraph:
        'A multi-key, also known as multisig, setup is crucial for enhancing the security of your bitcoin holdings. This method requires multiple approvals for transactions, significantly reducing the risk if one key is compromised. Seed word backups are vital, even with reliable hardware wallets, as devices can fail or get lost, ensuring you can always restore access to your bitcoin.',
      paragraph2:
        'Seed word backups are vital, even with reliable hardware wallets, as devices can fail or get lost, ensuring you can always restore access to your bitcoin.',
    },
    {
      title: 'Diversify Hardware Wallet Usage:',
      icon: <CanaryIcon />,
      paragraph2:
        'This diversification protects against device-specific vulnerabilities, safeguarding your bitcoin from potential threats.',
      paragraph:
        'Using different brands or models of hardware wallets for each key in your setup adds an important layer of security. This diversification protects against device-specific vulnerabilities, safeguarding your bitcoin from potential threats.',
    },
    {
      title: 'Backups on Acid-Free Paper and Metal',
      icon: <CanaryIcon />,
      paragraph2:
        'Metal backups, in particular, are durable against extreme conditions, keeping your recovery information secure. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      paragraph:
        'For key backups, opt for acid-free paper and metal plates. These materials offer protection against environmental damage, ensuring your backup information is preserved. Metal backups, in particular, are durable against extreme conditions, keeping your recovery information secure.',
    },
    {
      title: 'Varied and Secure Storage Locations',
      icon: <CanaryIcon />,
      paragraph2:
        'This approach ensures that if one storage method is compromised, the others remain secure, providing a comprehensive safeguarding system for your bitcoin holdings.',
      paragraph:
        'Store each key or backup in distinct, secure locations. Mixing physical (such as safety deposit boxes) and digital (encrypted cloud storage) storage methods minimizes risk, enhancing the security of your bitcoin holdings',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text color={`${colorMode}.white`}>Key Safekeeping Tips</Text>
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
