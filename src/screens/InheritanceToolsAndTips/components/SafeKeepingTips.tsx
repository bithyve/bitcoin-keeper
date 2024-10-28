import React from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import MultiSig from 'src/assets/images/multsig-tip.svg';
import DiversifyHardware from 'src/assets/images/diversify-hardware.svg';
import BackupAcidFree from 'src/assets/images/backup-acidfree.svg';
import VariedSecuredLocation from 'src/assets/images/varied-secured-location.svg';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Activate Multi-Key (Multisig) Security:',
      icon: <MultiSig />,
      paragraph:
        'A multi-key, also known as multisig, setup is crucial for enhancing the security of your bitcoin holdings. This method requires multiple approvals for transactions, significantly reducing the risk if one key is compromised.',
      paragraph2:
        'Seed word backups are vital, even with reliable hardware wallets, as devices can fail or get lost, ensuring you can always restore access to your bitcoin.',
    },
    {
      title: 'Diversify Hardware Wallet Usage:',
      icon: <DiversifyHardware />,
      paragraph2:
        'Please ensure that you keep abreast of various announcements and firmware updates from the manufacturers. Also ensure device accessibility using the Health Check feature.',
      paragraph:
        'Using different brands or models of hardware wallets for each key in your setup adds an important layer of security. This diversification protects against device-specific vulnerabilities, safeguarding your bitcoin from potential threats.',
    },
    {
      title: 'Backups on Acid-Free Paper and Metal',
      icon: <BackupAcidFree />,
      paragraph2:
        'A point to decide is whether you want to store them along with the devices that have your keys or store them separately. This is an important decision and should be taken carefully.',
      paragraph:
        'For key backups, opt for acid-free paper and metal plates. These materials offer protection against environmental damage, ensuring your backup information is preserved. Metal backups, in particular, are durable against extreme conditions, keeping your recovery information secure.',
    },
    {
      title: 'Varied and Secure Storage Locations',
      icon: <VariedSecuredLocation />,
      paragraph2:
        'This approach ensures that if one storage method is compromised, the others remain secure, providing a comprehensive safeguarding system for your bitcoin.',
      paragraph:
        'Store each key or backup in distinct, secure locations. Mixing physical (such as safety deposit boxes) and digital (encrypted cloud backup) storage methods minimizes risk, enhancing the security of your bitcoin holdings.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <Text style={styles.container} color={`${colorMode}.modalGreenContent`}>
        Key Safekeeping Tips
      </Text>
      <TipsSlider items={tips} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: wp(10),
  },
});

export default SafeGuardingTips;
