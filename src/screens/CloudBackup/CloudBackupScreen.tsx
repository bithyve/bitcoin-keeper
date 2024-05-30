import React, { useContext, useMemo, useEffect, useState } from 'react';
import { StyleSheet, Platform, FlatList } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import Buttons from 'src/components/Buttons';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import CloudIcon from 'src/assets/images/cloud-white.svg';
import { useQuery } from '@realm/react';
import { BackupHistory } from 'src/models/enums/BHR';
import useToastMessage from 'src/hooks/useToastMessage';
import DotView from 'src/components/DotView';
import moment from 'moment';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { backupBsmsOnCloud, bsmsCloudHealthCheck } from 'src/store/sagaActions/bhr';
import { setBackupLoading } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useVault from 'src/hooks/useVault';
import EnterPasswordModal from './EnterPasswordModal';

function CloudBackupScreen() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const dispatch = useAppDispatch();
  const strings = translations.cloudBackup;
  const data: BackupHistory = useQuery(RealmSchema.CloudBackupHistory);
  const history = useMemo(() => data.slice().reverse(), [data]);
  const { showToast } = useToastMessage();
  const { loading, lastBsmsBackup } = useAppSelector((state) => state.bhr);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { allVaults } = useVault({});

  useEffect(() => {
    if (loading) {
      const lastUpdate = data[data.length - 1];
      if (lastUpdate.confirmed) {
        showToast(strings[lastUpdate.title], <TickIcon />);
      } else {
        showToast(lastUpdate.subtitle, <ToastErrorIcon />);
      }
      dispatch(setBackupLoading(false));
    }
  }, [data.length]);

  const cloudName = useMemo(() => {
    return Platform.select({ android: 'Google Drive', ios: 'iCloud' });
  }, []);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <EnterPasswordModal
        visible={showPasswordModal}
        close={() => setShowPasswordModal(false)}
        callback={(value: any) => {
          dispatch(backupBsmsOnCloud(value));
        }}
      />

      <KeeperHeader
        title={strings.cloudBackup}
        subtitle={`On your ${cloudName}`}
        learnMore
        learnBackgroundColor={`${colorMode}.BrownNeedHelp`}
        learnTextColor={`${colorMode}.white`}
        learnMorePressed={() => console.log('ss')}
        icon={
          <CircleIconWrapper
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={<CloudIcon />}
          />
        }
      />

      <Text style={styles.textTitle}>{strings.recentHistory}</Text>

      <FlatList
        data={history}
        extraData={[history]}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <Box
            padding={1}
            marginLeft={2}
            borderLeftColor={`${colorMode}.RecoveryBorderColor`}
            borderLeftWidth={1}
            width="100%"
            position="relative"
            key={index}
          >
            <Box
              zIndex={999}
              position="absolute"
              left={-8}
              backgroundColor={`${colorMode}.RecoveryBorderColor`}
              padding={1}
              borderRadius={15}
            >
              <DotView height={2} width={2} color={`${colorMode}.BrownNeedHelp`} />
            </Box>
            <Text color={`${colorMode}.secondaryText`} fontSize={12} bold ml={5} opacity={0.7}>
              {strings[item.title]}
            </Text>
            <Text color={`${colorMode}.GreyText`} fontSize={11} ml={5} opacity={0.7}>
              {moment(item.date).fromNow()}
            </Text>
          </Box>
        )}
        ListEmptyComponent={() => <Text style={styles.textEmpty}>{strings.noBackup}</Text>}
        showsVerticalScrollIndicator={false}
      />

      <Buttons
        primaryText={strings.backupNow}
        primaryCallback={() => {
          if (allVaults.length === 0) {
            showToast('No vaults found.', <ToastErrorIcon />);
          } else {
            setShowPasswordModal(true);
          }
        }}
        primaryLoading={loading}
        secondaryText={strings.healthCheck}
        secondaryDisable={lastBsmsBackup < 0}
        secondaryCallback={() => dispatch(bsmsCloudHealthCheck())}
      />
    </ScreenWrapper>
  );
}

export default CloudBackupScreen;

const styles = StyleSheet.create({
  list: {
    marginHorizontal: 20,
    marginTop: '5%',
  },
  textEmpty: {
    marginVertical: '55%',
    textAlign: 'center',
  },
  textTitle: {
    fontSize: 16,
    marginTop: 25,
    letterSpacing: 0.16,
    marginHorizontal: 20,
  },
});
