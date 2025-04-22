import React, { useContext, useMemo, useEffect, useState } from 'react';
import { StyleSheet, Platform, FlatList } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
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
import { setBackupLoading, setLastBsmsBackup } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import BTCIllustration from 'src/assets/images/btc-illustration.svg';
import useVault from 'src/hooks/useVault';
import KeeperModal from 'src/components/KeeperModal';
import { ConciergeTag } from 'src/store/sagaActions/concierge';
import { wp } from 'src/constants/responsive';
import { setBackupModal } from 'src/store/reducers/settings';
import EnterPasswordModal from './EnterPasswordModal';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import WalletHeader from 'src/components/WalletHeader';
import usePlan from 'src/hooks/usePlan';
import PrivateBTC from 'src/assets/privateImages/Bitcoin-Illustration.svg';

function CloudBackupScreen() {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const dispatch = useAppDispatch();
  const { cloudBackup: strings, common } = translations;
  const data: BackupHistory = useQuery(RealmSchema.CloudBackupHistory);
  const history = useMemo(() => data.slice().reverse(), [data]);
  const { showToast } = useToastMessage();
  const { loading, lastBsmsBackup } = useAppSelector((state) => state.bhr);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { allVaults } = useVault({});
  const backupModal = useAppSelector((state) => state.settings.backupModal);
  const [showModal, setShowModal] = useState(backupModal);
  const isBackupAllowed = useMemo(() => lastBsmsBackup > 0, [lastBsmsBackup]);
  const { isOnL4 } = usePlan();

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

  function modalContent() {
    return (
      <Box>
        <Text color={`${colorMode}.headerWhite`} style={styles.backupModalDesc}>
          {strings.cloudBackupModalSubitle}
        </Text>
        <Text color={`${colorMode}.headerWhite`} style={styles.backupModalDesc}>
          {strings.cloudBackupModalDesc}
        </Text>
        <Box style={styles.illustration}>{isOnL4 ? <PrivateBTC /> : <BTCIllustration />}</Box>
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <EnterPasswordModal
        visible={showPasswordModal}
        close={() => setShowPasswordModal(false)}
        callback={(value: any) => {
          dispatch(setLastBsmsBackup(Date.now()));
          dispatch(backupBsmsOnCloud(value || ''));
        }}
      />
      <Box width={'100%'}>
        <WalletHeader
          title={strings.cloudBackup}
          subTitle={`On your ${cloudName}`}
          learnMore={true}
          // learnBackgroundColor={`${colorMode}.BrownNeedHelp`}
          // learnTextColor={`${colorMode}.buttonText`}
          learnMorePressed={() => setShowModal(true)}
          // icon={
          //   <CircleIconWrapper
          //     backgroundColor={`${colorMode}.primaryGreenBackground`}
          //     icon={<CloudIcon />}
          //   />
          // }
        />
      </Box>
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

      <Box
        alignSelf={!isBackupAllowed ? 'center' : 'flex-end'}
        width={!isBackupAllowed ? '93%' : '100%'}
      >
        <Buttons
          primaryText={isBackupAllowed ? strings.backupNow : strings.allowBackup}
          primaryCallback={() => {
            if (allVaults.length === 0) {
              showToast('No vaults found.', <ToastErrorIcon />);
            } else {
              setShowPasswordModal(true);
            }
          }}
          primaryLoading={loading}
          secondaryText={isBackupAllowed ? strings.healthCheck : ''}
          secondaryCallback={() => dispatch(bsmsCloudHealthCheck())}
          fullWidth
        />
      </Box>
      <KeeperModal
        visible={showModal}
        close={() => {
          setShowModal(false);
          if (setBackupModal) {
            dispatch(setBackupModal(false));
          }
        }}
        title={strings.cloudBackupModalTitle}
        modalBackground={isOnL4 ? `${colorMode}.charcolBrown` : `${colorMode}.pantoneGreen`}
        textColor={`${colorMode}.headerWhite`}
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={isOnL4 ? `${colorMode}.whiteSecButtonText` : `${colorMode}.pantoneGreen`}
        buttonBackground={isOnL4 ? `${colorMode}.pantoneGreen` : `${colorMode}.whiteSecButtonText`}
        secButtonTextColor={`${colorMode}.whiteSecButtonText`}
        secondaryIcon={<ConciergeNeedHelp />}
        secondaryCallback={() => {
          setShowModal(false);
          if (setBackupModal) {
            dispatch(setBackupModal(false));
          }
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                tags: [ConciergeTag.SETTINGS],
                screenName: 'cloud-backup',
              },
            })
          );
        }}
        buttonCallback={() => {
          setShowModal(false);
          if (setBackupModal) {
            dispatch(setBackupModal(false));
          }
        }}
        Content={() => modalContent()}
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
    padding: '7%',
  },
  backupModalDesc: {
    fontWeight: 400,
    fontSize: 14,
    padding: 1,
    marginBottom: 15,
    width: wp(295),
  },
  illustration: {
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 40,
  },
});
