import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FlatList, Box, useColorMode } from 'native-base';
import moment from 'moment';

import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { BackupHistoryItem, BackupType } from 'src/models/enums/BHR';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import { seedBackedConfirmed } from 'src/store/sagaActions/bhr';
import { setSeedConfirmed } from 'src/store/reducers/bhr';
import { wp } from 'src/constants/responsive';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import AlertIllustration from 'src/assets/images/upgrade-successful.svg';
import AlertIllustrationDark from 'src/assets/images/upgrade-successfulDark.svg';
import HealthCheck from 'src/assets/images/healthcheck_light.svg';
import AdvnaceOptions from 'src/assets/images/settings.svg';
import KeeperFooter from '../KeeperFooter';
import HealthCheckComponent from './HealthCheckComponent';
import KeeperModal from '../KeeperModal';
import { Platform } from 'react-native';
import SigningDeviceChecklist from 'src/screens/Vault/SigningDeviceChecklist';

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
  const { primaryMnemonic, backup }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { backupMethod, seedConfirmed } = useAppSelector((state) => state.bhr);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [showConfirmSeedModal, setShowConfirmSeedModal] = useState(isUaiFlow);
  const data = useQuery(RealmSchema.BackupHistory);
  const history: BackupHistoryItem[] = useMemo(() => data.sorted('date', true), [data]);

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
      <Box height={'77%'}>
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
        wrappedScreen={Platform.OS === 'ios' ? true : false}
        marginX={35}
        items={footerItems}
      />

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
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonCallback={() => {
          navigtaion.navigate('Home');
        }}
        Content={() => <Content />}
        closeOnOverlayClick={true}
      />
    </Box>
  );
}
export default BackupHealthCheckList;
