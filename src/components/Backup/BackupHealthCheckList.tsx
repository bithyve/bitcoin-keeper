import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FlatList, Box, useColorMode } from 'native-base';
import moment from 'moment';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { BackupHistoryItem, BackupType } from 'src/models/enums/BHR';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import {
  backupAllSignersAndVaults,
  seedBackedConfirmed,
  validateServerBackup,
} from 'src/store/sagaActions/bhr';
import { setBackupAllFailure, setSeedConfirmed } from 'src/store/reducers/bhr';
import { CommonActions, useIsFocused, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import AlertIllustration from 'src/assets/images/upgrade-successful.svg';
import AlertIllustrationDark from 'src/assets/images/upgrade-successfulDark.svg';
import HealthCheck from 'src/assets/images/healthcheck_light.svg';
import AdvnaceOptions from 'src/assets/images/settings.svg';
import KeeperFooter from '../KeeperFooter';
import HealthCheckComponent from './HealthCheckComponent';
import KeeperModal from '../KeeperModal';
import { Platform, StyleSheet } from 'react-native';
import SigningDeviceChecklist from 'src/screens/Vault/SigningDeviceChecklist';
import usePlan from 'src/hooks/usePlan';
import LoadingAnimation from 'src/components/Loader';
import ActivityIndicatorView from '../AppActivityIndicator/ActivityIndicatorView';
import Text from '../KeeperText';
import { hp } from 'src/constants/responsive';

const ContentType = {
  verifying: 'verifying',
  verificationFailed: 'verificationFailed',
  mismatch: 'mismatch',
  healthCheckSuccessful: 'healthCheckSuccessful',
};
function Content({ contentType }: { contentType: string }) {
  const { colorMode } = useColorMode();
  const illustrations = {
    [ContentType.verifying]: (
      <Box marginBottom={hp(20)}>
        <LoadingAnimation />
      </Box>
    ),
    [ContentType.verificationFailed]:
      colorMode === 'light' ? <AlertIllustration /> : <AlertIllustrationDark />,
    [ContentType.mismatch]:
      colorMode === 'light' ? <AlertIllustration /> : <AlertIllustrationDark />,
    [ContentType.healthCheckSuccessful]:
      colorMode === 'light' ? <AlertIllustration /> : <AlertIllustrationDark />,
  };
  const descriptions = {
    [ContentType.verificationFailed]:
      'There might be a temporary issue with the server or your connection. Please try again later.',
    [ContentType.mismatch]:
      'Some recent changes may not be backed up yet. To avoid data loss, we recommend initiating a backup now.',
  };

  return (
    <Box>
      <Box alignItems="center">{illustrations[contentType]}</Box>
      {descriptions[contentType] && <Text>{descriptions[contentType]}</Text>}
    </Box>
  );
}

function BackupHealthCheckList({ isUaiFlow }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const dispatch = useAppDispatch();
  const { primaryMnemonic, backup } = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const {
    backupMethod,
    seedConfirmed,
    automaticCloudBackup,
    backupAllLoading,
    backupAllFailure,
    backupAllSuccess,
  } = useAppSelector((state) => state.bhr);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [showConfirmSeedModal, setShowConfirmSeedModal] = useState(isUaiFlow);
  const [verificationModal, setVerificationModal] = useState(false);
  const [failedVerificationModal, setFailedVerificationModal] = useState(false);
  const [backupMismatchModal, setBackupMismatchModal] = useState(false);
  const data = useQuery(RealmSchema.BackupHistory);
  const history: BackupHistoryItem[] = useMemo(() => data.sorted('date', true), [data]);
  const { isOnL2Above } = usePlan();
  const isFocused = useIsFocused();

  const onPressConfirm = () => {
    setShowConfirmSeedModal(true);
  };

  useEffect(() => {
    if (seedConfirmed) {
      setShowConfirmSeedModal(false);
      setTimeout(() => {
        setHealthCheckModal(true);
      }, 100);
    }
    return () => {
      dispatch(setSeedConfirmed(false));
    };
  }, [seedConfirmed]);

  useEffect(() => {
    if (backupAllFailure && isFocused) {
      dispatch(setBackupAllFailure(false));
    }
  }, [backupAllFailure]);

  useEffect(() => {
    if (backupAllSuccess && isFocused) {
      dispatch(setSeedConfirmed(true));
    }
  }, [backupAllSuccess]);

  function FooterIcon({ Icon }) {
    return (
      <Box
        margin="1"
        width="12"
        height="12"
        borderRadius={30}
        backgroundColor={`${colorMode}.BrownNeedHelp`}
        justifyContent="center"
        alignItems="center"
      >
        <Icon />
      </Box>
    );
  }

  const footerItems = [
    {
      text: 'Health Check',
      Icon: () => <FooterIcon Icon={HealthCheck} />,
      onPress: () => {
        onPressConfirm();
      },
    },
    {
      text: 'Settings',
      Icon: () => <FooterIcon Icon={AdvnaceOptions} />,
      onPress: () => {
        navigtaion.dispatch(CommonActions.navigate('AppBackupSettings', {}));
      },
    },
  ];

  const nextAction = async () => {
    if (backupMethod === BackupType.SEED) {
      setShowConfirmSeedModal(false);
      if (isOnL2Above && automaticCloudBackup) {
        setVerificationModal(true);
        dispatch(
          validateServerBackup((res) => {
            setVerificationModal(false);
            if (res?.error) {
              setFailedVerificationModal(true);
            } else if (res.status) {
              dispatch(seedBackedConfirmed(true));
            } else {
              setBackupMismatchModal(true);
            }
          })
        );
      } else {
        dispatch(seedBackedConfirmed(true));
      }
    }
  };

  return (
    <Box>
      <Box>
        <Box flex={1} style={styles.Wrapper}>
          <FlatList
            data={history}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <SigningDeviceChecklist
                status={item?.title}
                key={index.toString()}
                date={moment.unix(item?.date).toDate()}
              />
            )}
          />
        </Box>
        <KeeperFooter
          marginX={30}
          wrappedScreen={Platform.OS === 'ios' ? true : false}
          items={footerItems}
        />
      </Box>

      <ModalWrapper
        visible={showConfirmSeedModal}
        onSwipeComplete={() => setShowConfirmSeedModal(false)}
        position="center"
      >
        <HealthCheckComponent
          closeBottomSheet={() => {
            setShowConfirmSeedModal(false);
            if (backupMethod === BackupType.SEED) {
              dispatch(seedBackedConfirmed(false));
            }
          }}
          type={backupMethod}
          password={backup.password}
          hint={backup.hint}
          words={primaryMnemonic.split(' ')}
          onConfirmed={nextAction}
        />
      </ModalWrapper>

      <KeeperModal
        close={() => {}}
        dismissible={false}
        showCloseIcon={false}
        visible={verificationModal}
        title={'Verifying Server Backup'}
        subTitle={
          'Verifying your server backup integrity against your local data.\nThis may take a moment.'
        }
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => <Content contentType={ContentType.verifying} />}
        closeOnOverlayClick={false}
      />

      <KeeperModal
        close={() => {}}
        dismissible={false}
        showCloseIcon={false}
        visible={failedVerificationModal}
        title={'Backup Verification Failed'}
        subTitle={'We couldn’t verify your data with the server backup.'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => <Content contentType={ContentType.verificationFailed} />}
        closeOnOverlayClick={false}
        buttonText={BackupWallet.home}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        buttonCallback={() => {
          navigtaion.dispatch(CommonActions.navigate('Home'));
          dispatch(seedBackedConfirmed(true));
        }}
      />
      <KeeperModal
        close={() => {}}
        dismissible={false}
        showCloseIcon={false}
        visible={backupMismatchModal}
        title={'Data Mismatch Detected'}
        subTitle={'Your local data doesn’t match the server backup.'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => <Content contentType={ContentType.mismatch} />}
        closeOnOverlayClick={false}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        buttonText={'Backup Now'}
        buttonCallback={() => {
          dispatch(backupAllSignersAndVaults());
          setBackupMismatchModal(false);
        }}
        secondaryButtonText="Home"
        secondaryCallback={() => {
          navigtaion.dispatch(CommonActions.navigate('Home'));
          dispatch(seedBackedConfirmed(true));
        }}
      />

      <KeeperModal
        close={() => setHealthCheckModal(false)}
        visible={healthCheckModal}
        title={BackupWallet.healthCheckSuccessTitle}
        subTitle={BackupWallet.healthCheckSuccessSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText={BackupWallet.home}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        buttonCallback={() => {
          navigtaion.navigate('Home');
        }}
        Content={() => <Content contentType={ContentType.healthCheckSuccessful} />}
        closeOnOverlayClick={true}
      />
      <ActivityIndicatorView visible={backupAllLoading} />
    </Box>
  );
}
export default BackupHealthCheckList;

const styles = StyleSheet.create({
  Wrapper: {
    marginHorizontal: 5,
  },
});
