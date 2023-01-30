import React, { useState, useContext } from 'react';
import Text from 'src/components/KeeperText';
import { Box, Pressable } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import StatusBarComponent from 'src/components/StatusBarComponent';
import HeaderTitle from 'src/components/HeaderTitle';
import { hp } from 'src/common/data/responsiveness/responsive';
import Arrow from 'src/assets/images/icon_arrow_Wallet.svg';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/common/content/LocContext';
import HealthCheckComponent from 'src/components/CloudBackup/HealthCheckComponent';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';
import SkipHealthCheck from 'src/components/CloudBackup/SkipHealthCheck';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { useAppSelector } from 'src/store/hooks';
import WalletBackHistoryScreen from 'src/screens/BackupWallet/WalletBackHistoryScreen';
import { StyleSheet } from 'react-native';

type Props = {
  title: string;
  subTitle: string;
  onPress: () => void;
};

function BackupWallet() {
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const { backupMethod } = useAppSelector((state) => state.bhr);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [healthCheckSuccessModal, setHealthCheckSuccessModal] = useState(false);

  const [skipHealthCheckModal, setSkipHealthCheckModal] = useState(false);
  const navigation = useNavigation();

  const { useQuery } = useContext(RealmWrapperContext);
  const { primaryMnemonic } = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  function Option({ title, subTitle, onPress }: Props) {
    return (
      <Pressable
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        style={{ marginVertical: hp(20) }}
        onPress={onPress}
      >
        <Box width="100%">
          <Text color="light.primaryText" fontSize={14} letterSpacing={1.12}>
            {title}
          </Text>
          {subTitle ? (
            <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
              {subTitle}
            </Text>
          ) : null}
        </Box>
        <Box>
          <Arrow />
        </Box>
      </Pressable>
    );
  }
  return backupMethod !== null ? (
    <WalletBackHistoryScreen navigation={navigation} />
  ) : (
    <Box style={styles.wrapper} background="light.secondaryBackground">
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
      <Box style={styles.optionWrapper}>
        {/* {backupMethod && <WalletBackHistory navigation />} */}
        <Option
          title={BackupWallet.exportAppSeed}
          subTitle=""
          onPress={() => {
            navigation.replace('ExportSeed', {
              seed: primaryMnemonic,
              next: true,
            });
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
    </Box>
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
    padding: 25,
  },
});
export default BackupWallet;
