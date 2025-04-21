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
import AdditionalSignerIcon from 'src/assets/images/additional-signer-icon.svg';
import GenerateAdditionalKeyDetailsTemplate from 'src/utils/GenerateAdditionalKeyDetailsTemplate';
import DownArrow from 'src/assets/images/down_arrow.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import usePlan from 'src/hooks/usePlan';
import PrivateAdditionalSigner from 'src/assets/images/private-doc-additional-key.svg';

function AdditionalSignerDetailsTemplate({}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const { isOnL4 } = usePlan();

  return (
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={isOnL4 ? `${colorMode}.primaryBackground` : `${colorMode}.pantoneGreen`}
    >
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.additionalKeysTitle}
        </Text>
        <Text style={styles.description} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.additionalKeysMainDescp}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.additionalKeysMainP1}
        </Text>

        <Box style={styles.circleStyle}>
          {isOnL4 ? <PrivateAdditionalSigner /> : <AdditionalSignerIcon />}
        </Box>

        <Box mt={5}>
          <DashedButton
            icon={<DownArrow />}
            callback={() => {
              GenerateAdditionalKeyDetailsTemplate().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name={inheritancePlanning.additionalKeysCtaTitle}
            hexagonBackgroundColor={'transparent'}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.headerWhite`}>
            Note:
          </Text>
          <Text color={`${colorMode}.headerWhite`}>
            {inheritancePlanning.additionalKeysCtaNotes}
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

export default AdditionalSignerDetailsTemplate;
