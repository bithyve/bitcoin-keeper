import React, { useState, useContext } from 'react';
import { Box, Text, Pressable } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import Modal from 'react-native-modal';

import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import { wp, hp } from 'src/common/data/responsiveness/responsive';
// icons
import Arrow from 'src/assets/images/svgs/icon_arrow_Wallet.svg';

import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { LocalizationContext } from 'src/common/content/LocContext';
import AppGeneratePass from 'src/components/CloudBackup/AppGeneratePass';
import CreateCloudBackup from 'src/components/CloudBackup/CreateCloudBackup';
import HealthCheckComponent from 'src/components/CloudBackup/HealthCheckComponent';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

const BackupWallet = () => {
  const navigtaion = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];

  const [cloudBackupModal, setCloudBackupModal] = useState(false);
  const [createCloudBackupModal, setCreateCloudBackupModal] = useState(false);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [healthCheckSuccessModal, setHealthCheckSuccessModal] = useState(false);

  const navigation = useNavigation();
  const [walletIndex, setWalletIndex] = useState<number>(0);

  const { useQuery } = useContext(RealmWrapperContext);
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const currentWallet = wallets[walletIndex];

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
  return (
    <Box flex={1} padding={5} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={30} />
      <HeaderTitle
        title={BackupWallet.backupWallet}
        subtitle={BackupWallet.backupWalletSubTitle}
        color="light.ReceiveBackground"
        onPressHandler={() => navigation.goBack()}
      />
      <Box alignItems={'center'} paddingX={wp(25)} marginTop={hp(60)}>
        <Option
          title={BackupWallet.exportAppSeed}
          subTitle={'Lorem ipsum dolor sit amet'}
          onPress={() => {
            navigation.navigate('ExportSeed', {
              seed: currentWallet?.derivationDetails?.mnemonic,
              next: true,
            });
          }}
        />
        <Option
          title={BackupWallet.backupOnCloud}
          subTitle={'Lorem ipsum dolor sit amet,'}
          onPress={() => {
            // setCloudBackupModal(true);
            // setCreateCloudBackupModal(true);
            // setHealthCheckModal(true);
            setHealthCheckSuccessModal(true);
          }}
        />
      </Box>
      <Box>
        <Modal
          isVisible={cloudBackupModal}
          onSwipeComplete={() => setCloudBackupModal(false)}
          swipeDirection={['down']}
          style={{
            justifyContent: 'flex-end',
            marginHorizontal: 15,
            marginBottom: 25,
          }}
        >
          <AppGeneratePass closeBottomSheet={() => setCloudBackupModal(false)} />
        </Modal>
        <Modal
          isVisible={createCloudBackupModal}
          onSwipeComplete={() => setCloudBackupModal(false)}
          swipeDirection={['down']}
          style={{
            justifyContent: 'flex-end',
            marginHorizontal: 15,
            marginBottom: 25,
          }}
        >
          <CreateCloudBackup closeBottomSheet={() => setCreateCloudBackupModal(false)} />
        </Modal>
        <Modal
          isVisible={healthCheckModal}
          onSwipeComplete={() => setHealthCheckModal(false)}
          swipeDirection={['down']}
          style={{
            justifyContent: 'center',
            marginHorizontal: 15,
            marginBottom: 25,
          }}
        >
          <HealthCheckComponent
            closeBottomSheet={() => {
              setHealthCheckModal(false);
            }}
          />
        </Modal>
        {/* health check success */}
        <Modal
          isVisible={healthCheckSuccessModal}
          onSwipeComplete={() => setHealthCheckSuccessModal(false)}
          swipeDirection={['down']}
          style={{
            justifyContent: 'flex-end',
            marginHorizontal: 15,
            marginBottom: 25,
          }}
        >
          <BackupSuccessful
            closeBottomSheet={() => {
              setHealthCheckSuccessModal(false);
            }}
            confirmBtnPress={() => {
              navigtaion.navigate('NewHome');
            }}
            title={BackupWallet.healthCheckSuccessTitle}
            subTitle={BackupWallet.healthCheckSuccessSubTitle}
            paragraph={BackupWallet.healthCheckSuccessParagraph}
          />
        </Modal>
      </Box>
    </Box>
  );
};
export default BackupWallet;
