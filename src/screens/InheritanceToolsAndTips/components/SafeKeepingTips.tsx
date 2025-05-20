import React, { useContext } from 'react';
import { useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { wp } from 'src/constants/responsive';
import TipsSlider from '../TipsSlider';
import InheritanceHeader from '../InheritanceHeader';
import Text from 'src/components/KeeperText';
import { useSelector } from 'react-redux';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;

  const tips = [
    {
      title: 'Activate Multi-Key (Multisig) Security:',
      icon: <ThemedSvg name={'activate_multisig_illustration'} />,
      paragraph:
        'A multi-key, also known as multisig, setup is crucial for enhancing the security of your bitcoin holdings. This method requires multiple approvals for transactions, significantly reducing the risk if one key is compromised.',
      paragraph2:
        'Seed word backups are vital, even with reliable hardware wallets, as devices can fail or get lost, ensuring you can always restore access to your bitcoin.',
    },
    {
      title: 'Diversify Hardware Wallet Usage:',
      icon: <ThemedSvg name={'diversify_hardware'} width={wp(225)} height={wp(225)} />,
      paragraph2:
        'Please ensure that you keep abreast of various announcements and firmware updates from the manufacturers. Also ensure device accessibility using the Health Check feature.',
      paragraph:
        'Using different brands or models of hardware wallets for each key in your setup adds an important layer of security. This diversification protects against device-specific vulnerabilities, safeguarding your bitcoin from potential threats.',
    },
    {
      title: 'Backups on Acid-Free Paper and Metal',
      icon: <ThemedSvg name={'backup_acid_free'} />,
      paragraph2:
        'A point to decide is whether you want to store them along with the devices that have your keys or store them separately. This is an important decision and should be taken carefully.',
      paragraph:
        'For key backups, opt for acid-free paper and metal plates. These materials offer protection against environmental damage, ensuring your backup information is preserved. Metal backups, in particular, are durable against extreme conditions, keeping your recovery information secure.',
    },
    {
      title: 'Varied and Secure Storage Locations',
      icon: <ThemedSvg name={'backup_illustration'} />,
      paragraph2:
        'This approach ensures that if one storage method is compromised, the others remain secure, providing a comprehensive safeguarding system for your bitcoin.',
      paragraph:
        'Store each key or backup in distinct, secure locations. Mixing physical (such as safety deposit boxes) and digital (encrypted cloud backup) storage methods minimizes risk, enhancing the security of your bitcoin holdings.',
    },
  ];

  return (
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={
        privateTheme || PrivateThemeLight
          ? `${colorMode}.primaryBackground`
          : `${colorMode}.pantoneGreen`
      }
    >
      <InheritanceHeader />
      <Text
        style={styles.container}
        color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
      >
        {inheritancePlanning.keySafekeeping}
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
