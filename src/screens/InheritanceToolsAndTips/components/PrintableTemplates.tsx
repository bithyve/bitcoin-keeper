import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import GenerateRecoveryPhraseTemplate from 'src/utils/GenerateRecoveryPhraseTemplate';
import { useNavigation } from '@react-navigation/native';
import RecoveryPhraseIcon from 'src/assets/images/recovery-phrase-template.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function PrintableTemplates({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);

  const { inheritancePlanning, common } = translations;

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>{inheritancePlanning.PrintableTemplates}</Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.recoveryPhraseTemplate}</Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.simpleTemplatePrinted}</Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.recoveryPhraseP3}</Text>
        <Box style={styles.circleStyle}>
          <RecoveryPhraseIcon />
        </Box>

        <Box mt={5}>
          <DashedButton
            description={inheritancePlanning.phraseTemplate}
            callback={() => {
              GenerateRecoveryPhraseTemplate().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name={inheritancePlanning.downloadRecovery}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            {common.note}:
          </Text>
          <Text color={`${colorMode}.white`}>{inheritancePlanning.acidFreePaperDesc}</Text>
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

export default PrintableTemplates;
