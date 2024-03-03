import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';

function InheritanceTips({}) {
  const { colorMode } = useColorMode();

  const tips = [
    {
      title: 'Document Multi-Key Setup for Heirs',
      content:
        'Clearly outline your multi-key setup in estate planning documents, specifying who inherits your bitcoin. This ensures heirs have both legal rights and practical guidance for accessing their inheritance, bridging any knowledge gaps.',
    },
    {
      title: 'Educate Heirs on Bitcoin and Multi-Key Security',
      content:
        'Proactively teach heirs about the importance of bitcoin security, focusing on multi-key practices. Well-informed heirs are better equipped to manage and secure their future digital assets effectively.',
    },
    {
      title: 'Select Knowledgeable Executors or Trustees',
      content:
        'Choose executors or trustees with a thorough understanding of bitcoin and multi-key systems. Their expertise will be crucial in managing and transferring your bitcoin according to your wishes, ensuring a smooth inheritance process.',
    },
    {
      title: 'Regularly Update Estate Plans and Instructions',
      content:
        'Keep your estate planning documents and instructions regarding your multi-key setup and bitcoin holdings up to date. Changes in your setup or personal circumstances should be promptly reflected to avoid future complications for your heirs.',
    },
  ];

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <KeeperHeader />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.heading}>Inheritance Tips</Text>

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

export default InheritanceTips;
