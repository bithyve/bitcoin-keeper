import React, { useContext, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import MasterRecoveryKeyIcon from 'src/assets/images/master-recovery-key.svg';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { CommonActions } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import MasterKey from 'src/assets/images/master_key.svg';
import KeeperModal from 'src/components/KeeperModal';
import { credsAuthenticated } from 'src/store/reducers/login';
import { useDispatch } from 'react-redux';
import ConfirmCredentialModal from 'src/components/ConfirmCredentialModal';

function MasterRecoveryKey({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning, common, settings, signer: signerText } = translations;
  const { primaryMnemonic } = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const dispatch = useDispatch();

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.masterKeyTitle}
        </Text>
        <Text style={styles.description} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.masterKeyDescp}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.masterKeyParagraph1}
        </Text>

        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.masterKeyParagraph2}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.headerWhite`}>
          {inheritancePlanning.masterKeyParagraph3}
        </Text>
        <Box style={styles.circleStyle}>
          <MasterRecoveryKeyIcon />
        </Box>
        <Box mt={5} alignItems={'center'}>
          <DashedButton
            icon={<MasterKey />}
            description={settings.viewPrivateLocation}
            callback={() => {
              dispatch(credsAuthenticated(false));
              setConfirmPassVisible(true);
            }}
            name={settings.ViewRKTitle}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.headerWhite`}>
            {common.note}:
          </Text>
          <Text color={`${colorMode}.headerWhite`}>{inheritancePlanning.masterKeyNote}</Text>
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
          <ConfirmCredentialModal
            useBiometrics={true}
            close={() => {
              setConfirmPassVisible(false);
            }}
            success={() => {
              setConfirmPassVisible(false);
              navigation.dispatch(
                CommonActions.navigate('ExportSeed', {
                  seed: primaryMnemonic,
                  next: true,
                  isInheritancePlaning: true,
                })
              );
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
    color: Colors.white,
  },
  description: {
    fontSize: 14,
    color: Colors.white,
  },
  commonTextStyle: {
    marginTop: hp(20),
    color: Colors.white,
  },
  addContainer: {
    marginTop: hp(40),
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

export default MasterRecoveryKey;
