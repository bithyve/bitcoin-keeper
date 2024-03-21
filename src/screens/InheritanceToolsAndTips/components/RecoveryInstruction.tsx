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
import RecoveryPhraseIcon from 'src/assets/images/printable-templates.svg';
import GenerateRecoveryInstrcutionsPDF from 'src/utils/GenerateRecoveryInstrcutionsPDF';
import DownArrow from 'src/assets/images/down_arrow.svg';

function RecoveryInstruction({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>Recovery Instructions</Text>
        <Text style={styles.description}>For the heir or beneficiary</Text>
        <Text style={styles.commonTextStyle}>
          Recovery Instructions is a document containing information and steps to be used by the
          heir to recover the funds.
        </Text>
        <Text style={styles.commonTextStyle}>
          The document contains no sensitive information. It can be kept along with all the keys or
          separately.
        </Text>
        <Box style={styles.circleStyle}>
          <RecoveryPhraseIcon />
        </Box>

        <Box mt={5}>
          <DashedButton
            icon={<DownArrow />}
            description="For the heir or beneficiary"
            callback={() => {
              GenerateRecoveryInstrcutionsPDF().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name="View Recovery Instructions "
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>
            Test the recovery using the instructions provided to ensure everything is in place
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

export default RecoveryInstruction;
