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
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import KeeperModal from 'src/components/KeeperModal';

function MasterRecoveryKey({ navigation }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const { primaryMnemonic } = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView contentContainerStyle={styles.marginLeft}>
        <Text style={styles.heading} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.masterKeyTitle}
        </Text>
        <Text style={styles.description} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.masterKeyDescp}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.masterKeyParagraph1}
        </Text>

        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.masterKeyParagraph2}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.masterKeyParagraph3}
        </Text>
        <Box style={styles.circleStyle}>
          <MasterRecoveryKeyIcon />
        </Box>
        <Box mt={5} alignItems={'center'}>
          <DashedButton
            icon={<MasterKey />}
            description="Please view in a private location"
            callback={() => {
              setConfirmPassVisible(true);
            }}
            name="View Recovery Key"
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.modalGreenContent`}>
            Note:
          </Text>
          <Text color={`${colorMode}.modalGreenContent`}>{inheritancePlanning.masterKeyNote}</Text>
        </Box>
      </ScrollView>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Confirm Passcode"
        subTitleWidth={wp(240)}
        subTitle="To back up the app recovery key"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
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
