import React from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { useNavigation } from '@react-navigation/native';
import GenerateRecoveryPhraseTemplate from 'src/utils/GenerateRecoveryPhraseTemplate';
import TrustedContactIcon from 'src/assets/images/trusted-contact-icon.svg';
import GenerateTrustedContactsPDF from 'src/utils/GenerateTrustedContactsPDF';
import DownArrow from 'src/assets/images/down_arrow.svg';

function TrustedContactTemplates({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Trusted Contacts Template</Text>
        <Text style={styles.description}>Details of people to assist your heir</Text>
        <Text style={styles.commonTextStyle}>
          A simple template to note down a list of trusted contacts and their details. This can then
          be stored along with the keys or separately.
        </Text>

        <Box style={styles.circleStyle}>
          <TrustedContactIcon />
        </Box>
        <Text style={styles.commonTextStyle}>Refer to Safeguarding Tips for more details</Text>
        <Box mt={5}>
          <DashedButton
            icon={<DownArrow />}
            description="Contacts Template"
            callback={() => {
              GenerateTrustedContactsPDF().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name="View Trusted"
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            Please ensure that these individuals would be willing to help your heir selflessly.
          </Text>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    color: Colors.white,
  },
  description: {
    fontSize: 14,
    color: Colors.white,
  },
  commonTextStyle: {
    marginTop: hp(40),
    color: Colors.white,
  },
  addContainer: {
    marginTop: hp(100),
    gap: 10,
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
    color: Colors.white,
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default TrustedContactTemplates;
