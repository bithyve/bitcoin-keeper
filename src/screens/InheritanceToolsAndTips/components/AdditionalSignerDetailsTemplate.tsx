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
import AdditionalSignerIcon from 'src/assets/images/additional-signer-icon.svg';
import GenerateAdditionalKeyDetailsTemplate from 'src/utils/GenerateAdditionalKeyDetailsTemplate';
import DownArrow from 'src/assets/images/down_arrow.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function AdditionalSignerDetailsTemplate({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading}>{inheritancePlanning.additionalKeysTitle}</Text>
        <Text style={styles.description}>{inheritancePlanning.additionalKeysMainDescp}</Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.additionalKeysMainP1}</Text>

        <Box style={styles.circleStyle}>
          <AdditionalSignerIcon />
        </Box>

        <Box mt={5}>
          <DashedButton
            icon={<DownArrow />}
            description={inheritancePlanning.additionalKeysCtaDescp}
            callback={() => {
              GenerateAdditionalKeyDetailsTemplate().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name={inheritancePlanning.additionalKeysCtaTitle}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.white`}>
            Note:
          </Text>
          <Text color={`${colorMode}.white`}>{inheritancePlanning.additionalKeysCtaNotes}</Text>
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

export default AdditionalSignerDetailsTemplate;
