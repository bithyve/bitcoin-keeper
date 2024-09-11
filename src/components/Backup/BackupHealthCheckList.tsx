import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FlatList, Box, useColorMode } from 'native-base';
import moment from 'moment';
import Text from 'src/components/KeeperText';

import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { BackupHistory, BackupType } from 'src/models/enums/BHR';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { seedBackedConfirmed } from 'src/store/sagaActions/bhr';
import { setSeedConfirmed } from 'src/store/reducers/bhr';
import { hp, wp } from 'src/constants/responsive';
import { CommonActions, useNavigation } from '@react-navigation/native';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';
import DotView from 'src/components/DotView';
import { useQuery } from '@realm/react';
import AlertIllustration from 'src/assets/images/upgrade-successful.svg';
import AlertIllustrationDark from 'src/assets/images/upgrade-successfulDark.svg';
import HealthCheck from 'src/assets/images/healthcheck_light.svg';
import AdvnaceOptions from 'src/assets/images/settings.svg';
import KeeperFooter from '../KeeperFooter';
import HealthCheckComponent from './HealthCheckComponent';
import KeeperModal from '../KeeperModal';

function Content() {
  const { colorMode } = useColorMode();
  return (
    <Box width={wp(270)}>
      <Box alignItems="center">
        {colorMode === 'light' ? <AlertIllustration /> : <AlertIllustrationDark />}
      </Box>
    </Box>
  );
}

function BackupHealthCheckList({ isUaiFlow }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { BackupWallet } = translations;
  const dispatch = useAppDispatch();
  const strings = translations.BackupWallet;
  const data: BackupHistory = useQuery(RealmSchema.BackupHistory);
  const { primaryMnemonic, backup }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { backupMethod, seedConfirmed } = useAppSelector((state) => state.bhr);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [showConfirmSeedModal, setShowConfirmSeedModal] = useState(isUaiFlow);
  const history = useMemo(() => data.sorted('date', true), [data]);

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

  return (
    <Box>
      <Box height={hp(520)}>
        <FlatList
          data={history}
          contentContainerStyle={{ flexGrow: 1 }}
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
                {strings[item?.title]}
              </Text>
              <Text color={`${colorMode}.GreyText`} fontSize={11} ml={5} opacity={0.7}>
                {moment.unix(item.date).format('DD MMM YYYY, HH:mmA')}
              </Text>
            </Box>
          )}
        />
      </Box>

      <KeeperFooter marginX={0} items={footerItems} />

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
          onConfirmed={(password) => {
            if (backupMethod === BackupType.SEED) {
              setShowConfirmSeedModal(false);
              dispatch(seedBackedConfirmed(true));
            }
          }}
        />
      </ModalWrapper>
      <KeeperModal
        close={() => setHealthCheckModal(false)}
        visible={healthCheckModal}
        title={BackupWallet.backupSuccessTitle}
        subTitle={BackupWallet.backupSuccessSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonText={BackupWallet.home}
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonCallback={() => {
          navigtaion.navigate('Home');
        }}
        DarkCloseIcon={colorMode === 'dark'}
        Content={() => <Content />}
        closeOnOverlayClick={true}
      />
    </Box>
  );
}
export default BackupHealthCheckList;
