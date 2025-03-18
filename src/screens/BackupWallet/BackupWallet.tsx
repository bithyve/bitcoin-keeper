import React, { useState, useContext } from 'react';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, wp } from 'src/constants/responsive';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import HealthCheckComponent from 'src/components/Backup/HealthCheckComponent';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';
import SkipHealthCheck from 'src/components/Backup/SkipHealthCheck';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { useAppSelector } from 'src/store/hooks';
import WalletBackHistoryScreen from 'src/screens/BackupWallet/WalletBackHistoryScreen';
import { StyleSheet } from 'react-native';
import { useQuery } from '@realm/react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import OptionCard from 'src/components/OptionCard';
import KeeperModal from 'src/components/KeeperModal';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { useDispatch } from 'react-redux';
import { credsAuthenticated } from 'src/store/reducers/login';

function BackupWallet() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const { backupMethod } = useAppSelector((state) => state.bhr);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [healthCheckSuccessModal, setHealthCheckSuccessModal] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const dispatch = useDispatch();

  const [skipHealthCheckModal, setSkipHealthCheckModal] = useState(false);
  const navigation = useNavigation();

  const { primaryMnemonic } = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  return backupMethod !== null ? (
    <WalletBackHistoryScreen navigation={navigation} />
  ) : (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={BackupWallet.backupWallet}
        subtitle={BackupWallet.backupWalletSubTitle}
      />
      <Box style={styles.optionWrapper}>
        <OptionCard
          title={BackupWallet.exportAppSeed}
          description=""
          callback={() => {
            dispatch(credsAuthenticated(false));
            setConfirmPassVisible(true);
          }}
        />
      </Box>
      <Box>
        <ModalWrapper
          visible={healthCheckModal}
          onSwipeComplete={() => setHealthCheckModal(false)}
          position="center"
        >
          <HealthCheckComponent
            closeBottomSheet={() => {
              setHealthCheckModal(false);
            }}
          />
        </ModalWrapper>
        {/* skip health check */}
        <ModalWrapper
          visible={skipHealthCheckModal}
          onSwipeComplete={() => setSkipHealthCheckModal(false)}
        >
          <SkipHealthCheck
            closeBottomSheet={() => {
              setSkipHealthCheckModal(false);
            }}
            confirmBtnPress={() => {
              setSkipHealthCheckModal(false);
            }}
          />
        </ModalWrapper>

        {/* health check success */}
        <ModalWrapper
          visible={healthCheckSuccessModal}
          onSwipeComplete={() => setHealthCheckSuccessModal(false)}
        >
          <BackupSuccessful
            closeBottomSheet={() => {
              setHealthCheckSuccessModal(false);
            }}
            confirmBtnPress={() => {
              setHealthCheckSuccessModal(false);
            }}
            title={BackupWallet.healthCheckSuccessTitle}
            subTitle={BackupWallet.healthCheckSuccessSubTitle}
            paragraph={BackupWallet.healthCheckSuccessParagraph}
          />
        </ModalWrapper>
      </Box>

      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Confirm Passcode"
        subTitleWidth={wp(240)}
        subTitle="To back up the app recovery key"
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
              navigation.dispatch(
                CommonActions.navigate('ExportSeed', {
                  seed: primaryMnemonic,
                  next: true,
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
  wrapper: {
    flex: 1,
    padding: 10,
  },
  optionWrapper: {
    alignItems: 'center',
    marginTop: hp(40),
  },
});
export default BackupWallet;
