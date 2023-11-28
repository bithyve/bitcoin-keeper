import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FlatList, Box, ScrollView, useColorMode } from 'native-base';
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
import { useNavigation } from '@react-navigation/native';
import HealthCheckComponent from './HealthCheckComponent';
import BackupSuccessful from 'src/components/SeedWordBackup/BackupSuccessful';
import DotView from 'src/components/DotView';
import Buttons from 'src/components/Buttons';
import { useQuery } from '@realm/react';

function BackupHealthCheckList() {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { BackupWallet } = translations;
  const dispatch = useAppDispatch();
  const strings = translations.BackupWallet;
  const data: BackupHistory = useQuery(RealmSchema.BackupHistory);
  const { primaryMnemonic, backup }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { backupMethod, seedConfirmed } = useAppSelector((state) => state.bhr);
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [showConfirmSeedModal, setShowConfirmSeedModal] = useState(false);
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

  return (
    <Box>
      <Box height={hp(530)}>
        <FlatList
          data={history}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item, index }) => (
            <Box key={index}>
              <Box
                zIndex={999}
                position="absolute"
                left={-8}
                backgroundColor={`${colorMode}.primaryBackground`}
                padding={2}
                borderRadius={15}
              >
                <DotView height={2} width={2} color={`${colorMode}.lightAccent`} />
              </Box>
              <Text
                color={`${colorMode}.GreyText`}
                fontSize={10}
                bold
                ml={5}
                opacity={0.7}
                letterSpacing={0.6}
              >
                {moment.unix(item.date).format('DD MMM YYYY, hh:mmA')}
              </Text>
              <Box
                backgroundColor={`${colorMode}.seashellWhite`}
                padding={5}
                borderRadius={1}
                my={2}
                borderLeftColor={`${colorMode}.lightAccent`}
                borderLeftWidth={2}
                width="100%"
                ml={wp(3.5)}
                position="relative"
              >
                <Text color={`${colorMode}.headerText`} fontSize={14} letterSpacing={1}>
                  {strings[item.title]}
                </Text>
                {item.subtitle !== '' && (
                  <Text color={`${colorMode}.GreyText`} fontSize={12} letterSpacing={0.6}>
                    {item.subtitle}
                  </Text>
                )}
              </Box>
            </Box>
          )}
        />
      </Box>

      <Box alignItems="flex-start">
        <Buttons primaryText={common.confirm} primaryCallback={onPressConfirm} />
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
          onConfirmed={(password) => {
            if (backupMethod === BackupType.SEED) {
              setShowConfirmSeedModal(false);
              dispatch(seedBackedConfirmed(true));
            }
          }}
        />
      </ModalWrapper>

      <ModalWrapper
        visible={healthCheckModal}
        onSwipeComplete={() => setHealthCheckModal(false)}
        position="center"
      >
        <BackupSuccessful
          closeBottomSheet={() => {
            setHealthCheckModal(false);
          }}
          title={BackupWallet.backupSuccessTitle}
          subTitle={BackupWallet.backupSuccessSubTitle}
          paragraph={BackupWallet.backupSuccessParagraph}
          confirmBtnPress={() => {
            navigtaion.navigate('Home');
          }}
        />
      </ModalWrapper>
    </Box>
  );
}
export default BackupHealthCheckList;
