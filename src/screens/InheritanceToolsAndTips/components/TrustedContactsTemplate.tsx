import React, { useContext } from 'react';
import { Box, ScrollView } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import { useNavigation } from '@react-navigation/native';
import GenerateTrustedContactsPDF from 'src/utils/GenerateTrustedContactsPDF';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

function TrustedContactTemplates({}) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const slider_background = ThemedColor({ name: 'slider_background' });
  const green_modal_text_color = ThemedColor({ name: 'green_modal_text_color' });

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={slider_background}>
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading} color={green_modal_text_color}>
          {inheritancePlanning.trustedContactsTemplateTitle}
        </Text>
        <Text style={styles.description} color={green_modal_text_color}>
          {inheritancePlanning.trustedContactsTemplateDescp}
        </Text>
        <Text style={styles.commonTextStyle} color={green_modal_text_color}>
          {inheritancePlanning.trustedContactsP1}
        </Text>

        <Box style={styles.circleStyle}>
          {<ThemedSvg name={'inheritance_trustedContact_illustration'} />}
        </Box>
        <Text style={styles.commonTextStyle} color={green_modal_text_color}>
          {' '}
          {inheritancePlanning.trustedContactsRef}
        </Text>
        <Box mt={5}>
          <DashedButton
            icon={<ThemedSvg name={'inheritance_down_arrow'} />}
            description={inheritancePlanning.trustedContactsCtaDescp}
            callback={() => {
              GenerateTrustedContactsPDF().then((res) => {
                if (res) {
                  navigation.navigate('PreviewPDF', { source: res });
                }
              });
            }}
            name={inheritancePlanning.trustedContactsCtaTitle}
            hexagonBackgroundColor={'transparent'}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={green_modal_text_color}>
            Note:
          </Text>
          <Text color={green_modal_text_color}>{inheritancePlanning.trustedContactsNotes}</Text>
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
  },
  description: {
    fontSize: 14,
  },
  commonTextStyle: {
    marginTop: hp(40),
  },
  addContainer: {
    marginTop: hp(100),
    gap: 10,
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default TrustedContactTemplates;
