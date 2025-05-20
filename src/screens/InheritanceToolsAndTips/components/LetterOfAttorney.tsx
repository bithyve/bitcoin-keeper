import React, { useContext, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import useToastMessage from 'src/hooks/useToastMessage';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import GenerateLetterToAtternyPDFInheritanceTool from 'src/utils/GenerateLetterToAtternyPDFInheritanceTool';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSigners from 'src/hooks/useSigners';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import KeeperModal from 'src/components/KeeperModal';
import { credsAuthenticated } from 'src/store/reducers/login';
import { useDispatch, useSelector } from 'react-redux';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function LetterOfAttorney() {
  const { signers } = useSigners();
  const fingerPrints = signers
    .filter((signer) => !signer.isBIP85)
    .map((signer) => signer.masterFingerprint);
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning, common, signer: signerText, error: ErrorText } = translations;
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const dispatch = useDispatch();
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';

  return (
    <ScreenWrapper
      barStyle="dark-content"
      backgroundcolor={
        privateTheme || PrivateThemeLight
          ? `${colorMode}.primaryBackground`
          : `${colorMode}.pantoneGreen`
      }
    >
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text
          style={styles.heading}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.letterOfAttorneyTitle}
        </Text>
        <Text
          style={styles.description}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.letterOfAttorneyDescp}
        </Text>
        <Text
          style={styles.commonTextStyle}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.letterOfAttorneyP1}
        </Text>
        <Text
          style={styles.commonTextStyle}
          color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        >
          {inheritancePlanning.letterOfAttorneyP2}
        </Text>
        <Box style={styles.circleStyle}>
          {<ThemedSvg name={'inheritance_letterAttorney_illustration'} />}
        </Box>
        <Box mt={5}>
          <DashedButton
            icon={<ThemedSvg name={'inheritance_down_arrow'} />}
            description={inheritancePlanning.letterOfAttorneyCtaDescp}
            callback={() => {
              dispatch(credsAuthenticated(false));
              setConfirmPassVisible(true);
            }}
            name={inheritancePlanning.letterOfAttorneyCtaTitle}
            hexagonBackgroundColor={'transparent'}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text
            bold
            color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
          >
            {common.note}:
          </Text>
          <Text color={PrivateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}>
            {inheritancePlanning.letterOfAttorneyNotes}
          </Text>
        </Box>
      </ScrollView>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title={common.confirmPassCode}
        subTitleWidth={wp(240)}
        subTitle={signerText.RKBackupPassSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
              setConfirmPassVisible(false);
              if (fingerPrints) {
                GenerateLetterToAtternyPDFInheritanceTool(fingerPrints).then((res) => {
                  if (res) {
                    navigation.navigate('PreviewPDF', { source: res });
                  }
                });
              } else {
                showToast(ErrorText.noVaultsFound);
              }
            }}
          />
        )}
      />
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

export default LetterOfAttorney;
