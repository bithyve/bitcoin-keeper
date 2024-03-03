import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

function SafeKeepingTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Activate Multi-Key (Multisig) Security:',
      content:
        'A multi-key, also known as multisig, setup is crucial for enhancing the security of your bitcoin holdings. This method requires multiple approvals for transactions, significantly reducing the risk if one key is compromised. Seed word backups are vital, even with reliable hardware wallets, as devices can fail or get lost, ensuring you can always restore access to your bitcoin.',
    },
    {
      title: 'Diversify Hardware Wallet Usage:',
      content:
        'Using different brands or models of hardware wallets for each key in your setup adds an important layer of security. This diversification protects against device-specific vulnerabilities, safeguarding your bitcoin from potential threats.',
    },
    {
      title: 'Backups on Acid-Free Paper and Metal',
      content:
        'For key backups, opt for acid-free paper and metal plates. These materials offer protection against environmental damage, ensuring your backup information is preserved. Metal backups, in particular, are durable against extreme conditions, keeping your recovery information secure.',
    },
    {
      title: 'Varied and Secure Storage Locations',
      content:
        'Store each key or backup in distinct, secure locations. Mixing physical (such as safety deposit boxes) and digital (encrypted cloud storage) storage methods minimizes risk, enhancing the security of your bitcoin holdings',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <KeeperHeader />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Key Safekeeping Tips</Text>

        {tips.map((tip, index) => (
          <Box key={index}>
            <Text bold color={`${colorMode}.white`} style={styles.titleStyle}>{`${index + 1}. ${
              tip.title
            }`}</Text>
            <Text color={`${colorMode}.white`}>{tip.content}</Text>
          </Box>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    marginLeft: wp(20),
  },
  heading: {
    fontSize: 18,
    color: Colors.White,
    marginBottom: hp(28),
  },
  titleStyle: {
    fontSize: 14,
    marginVertical: hp(12),
  },
});

export default SafeKeepingTips;
