import React, { useState, useContext, useEffect } from 'react';
import { Box, Text, Pressable } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
import Arrow from 'src/assets/images/svgs/icon_arrow_Wallet.svg';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/common/content/LocContext';
import AppGeneratePass from 'src/components/CloudBackup/AppGeneratePass';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import HealthCheckComponent from 'src/components/CloudBackup/HealthCheckComponent';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';
import SkipHealthCheck from 'src/components/CloudBackup/SkipHealthCheck';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { initCloudBackup } from 'src/store/sagaActions/bhr';
import { setBackupError, setBackupLoading } from 'src/store/reducers/bhr';
import useToastMessage from 'src/hooks/useToastMessage';
import WalletBackHistoryScreen from 'src/screens/BackupWallet/WalletBackHistoryScreen';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

const BackupWallet = () => {
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];
  const { backupMethod, loading, isBackupError, backupError, cloudBackupCompleted } =
    useAppSelector((state) => state.bhr);
  const [cloudBackupModal, setCloudBackupModal] = useState(false);
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [healthCheckSuccessModal, setHealthCheckSuccessModal] = useState(false);
  const { showToast } = useToastMessage();

  const [skipHealthCheckModal, setSkipHealthCheckModal] = useState(false);
  const navigation = useNavigation();

  const { useQuery } = useContext(RealmWrapperContext);
  const { primaryMnemonic } = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setCreateCloudBackupModal(true);
      }, 100);
    } else {
      setCreateCloudBackupModal(false);
      if (isBackupError) {
        showToast(backupError);
      }
    }
    return () => {
      dispatch(setBackupLoading(false));
      dispatch(setBackupError({ isError: false, error: '' }));
    };
  }, [loading, isBackupError, cloudBackupCompleted]);

  const Option = ({ title, subTitle, onPress }: Props) => {
    return (
      <Pressable
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={'100%'}
        style={{ marginVertical: hp(20) }}
        onPress={onPress}
      >
        <Box>
          <Text
            color={'light.lightBlack'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(14)}
            letterSpacing={1.12}
          >
            {title}
          </Text>
          <Text
            color={'light.GreyText'}
            fontFamily={'body'}
            fontWeight={200}
            fontSize={RFValue(12)}
            letterSpacing={0.6}
          >
            {subTitle}
          </Text>
        </Box>
        <Box>
          <Arrow />
        </Box>
      </Pressable>
    );
  };
  return backupMethod !== null ? (
    <WalletBackHistoryScreen navigation={navigation} />
  ) : (
    <Box flex={1} padding={5} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={30} />
      <Box
        style={{
          padding: hp(5),
        }}
      >
        <HeaderTitle
          title={BackupWallet.backupWallet}
          subtitle={BackupWallet.backupWalletSubTitle}
          onPressHandler={() => navigation.goBack()}
          paddingTop={hp(5)}
        />
      </Box>
      <Box alignItems={'center'} paddingX={wp(25)} marginTop={hp(60)}>
        {/* {backupMethod && <WalletBackHistory navigation />} */}
        <Option
          title={BackupWallet.exportAppSeed}
          subTitle={''}
          onPress={() => {
            navigation.replace('ExportSeed', {
              seed: primaryMnemonic,
              next: true,
            });
          }}
        />
        {/* <Option
          title={BackupWallet.backupOnCloud}
          subTitle={'Lorem ipsum dolor sit amet,'}
          onPress={() => {
            setCloudBackupModal(true);
            // setCreateCloudBackupModal(true);
            // setHealthCheckModal(true);
            // setHealthCheckSuccessModal(true);
            // setSkipHealthCheckModal(true);
          }}
        /> */}
      </Box>
      <Box>
        <ModalWrapper visible={cloudBackupModal} onSwipeComplete={() => setCloudBackupModal(false)}>
          <AppGeneratePass
            confirmBtnPress={(password) => {
              dispatch(initCloudBackup(password, 'App generated strong password'));
              setCloudBackupModal(false);
            }}
            closeBottomSheet={() => setCloudBackupModal(false)}
          />
        </ModalWrapper>
        <ModalWrapper
          visible={createCloudBackupModal}
          onSwipeComplete={() => setCreateCloudBackupModal(false)}
        >
          <CreateCloudBackup closeBottomSheet={() => setCreateCloudBackupModal(false)} />
        </ModalWrapper>
        <ModalWrapper
          visible={healthCheckModal}
          onSwipeComplete={() => setHealthCheckModal(false)}
          position={'center'}
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
    </Box>
  );
};
export default BackupWallet;
