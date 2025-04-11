import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { useNavigation } from '@react-navigation/native';
import GenerateRecoveryPhraseTemplate from 'src/utils/GenerateRecoveryPhraseTemplate';
import RecoveryPhraseIcon from 'src/assets/images/recovery-phrase-icon.svg';
import DownArrow from 'src/assets/images/down_arrow.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function RecoveryPhraseTemplate({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning, common } = translations;

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.recoveryPhraseTitleTemplate}
        </Text>
        <Text style={styles.description} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.recoveryPhraseDescpMain}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.recoveryPhraseP1}
        </Text>
        <Box style={styles.circleStyle}>
          <RecoveryPhraseIcon />
        </Box>
        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.recoveryPhraseP2}
        </Text>
        <Box mt={5}>
          <DashedButton
            icon={<DownArrow />}
            callback={() => {
              GenerateRecoveryPhraseTemplate().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name={inheritancePlanning.recoveryPhraseTemplateCtaTitle}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.headerWhite`}>
            {common.note}:
          </Text>
          <Text color={`${colorMode}.headerWhite`}>{inheritancePlanning.recoveryPhraseNotes}</Text>
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
  marginLeft: {
    marginLeft: wp(10),
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '500',
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

export default RecoveryPhraseTemplate;
