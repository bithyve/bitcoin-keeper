import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

function SafeGuardingTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Thorough Verification of Transaction Details',
      content:
        'Carefully review all transaction details, particularly the recipient’s address, within your multi-key setup. This careful attention is essential to avoid errors and secure your transactions, ensuring the safety of your bitcoin.',
    },
    {
      title: 'Preliminary Test Transactions',
      content:
        'Before making significant transfers, conduct a small test transaction. This step verifies the transaction’s accuracy and confirms the smooth functioning of your multi-key setup, adding a protective layer to your bitcoin transactions.',
    },
    {
      title: 'Secure Coordination Among Key Holders',
      content:
        'Use encrypted communication for coordinating transaction approvals with other key holders. This ensures everyone is on the same page regarding the transaction details, protecting the integrity of your bitcoin transactions.',
    },
    {
      title: 'Cross-Device Verification',
      content:
        'To further enhance security, verify transaction details on multiple devices involved in your multi-key setup. This approach can help identify any discrepancies or fraudulent attempts, securing your bitcoin transactions effectively.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <KeeperHeader />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>{`Tips for Doing Transactions\nSecurely`}</Text>
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

export default SafeGuardingTips;
