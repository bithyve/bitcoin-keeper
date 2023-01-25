import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FlatList, Box, ScrollView } from 'native-base';
import moment from 'moment';
import Text from 'src/components/KeeperText';

import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { LocalizationContext } from 'src/common/content/LocContext';
import { BackupHistory, BackupType } from 'src/common/data/enums/BHR';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import ModalWrapper from 'src/components/Modal/ModalWrapper';
import {
  cloudBackupSkipped,
  confirmCloudBackup,
  seedBackedConfirmed,
} from 'src/store/sagaActions/bhr';
import { setCloudBackupConfirmed, setSeedConfirmed } from 'src/store/reducers/bhr';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { useNavigation } from '@react-navigation/native';
import HealthCheckComponent from './HealthCheckComponent';
import BackupSuccessful from '../SeedWordBackup/BackupSuccessful';
import DotView from '../DotView';
import Buttons from '../Buttons';

function BackupHealthCheckList() {
  const navigtaion = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { BackupWallet } = translations;
  const dispatch = useAppDispatch();
  const strings = translations.BackupWallet;
  const { useQuery } = useContext(RealmWrapperContext);
  const data: BackupHistory = useQuery(RealmSchema.BackupHistory);
  const { primaryMnemonic, backup }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const { backupMethod, seedConfirmed, cloudBackedConfirmed } = useAppSelector(
    (state) => state.bhr
  );
  const [healthCheckModal, setHealthCheckModal] = useState(false);
  const [showConfirmSeedModal, setShowConfirmSeedModal] = useState(false);
  const history = useMemo(() => data.sorted('date', true), [data]);

  const onPressConfirm = () => {
    setShowConfirmSeedModal(true);
  };

  useEffect(() => {
    if (seedConfirmed || cloudBackedConfirmed) {
      setShowConfirmSeedModal(false);
      setTimeout(() => {
        setHealthCheckModal(true);
      }, 100);
    }
    return () => {
      dispatch(setSeedConfirmed(false));
      dispatch(setCloudBackupConfirmed(false));
    };
  }, [seedConfirmed, cloudBackedConfirmed]);

  return (
    <Box>
      <ScrollView height={hp(530)}>
        <FlatList
          data={history}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }) => (
            <Box>
              <Box
                zIndex={99}
                position="absolute"
                left={-8}
                backgroundColor="light.secondaryBackground"
                padding={2}
                borderRadius={15}
              >
                <DotView height={2} width={2} color="light.lightAccent" />
              </Box>
              <Text
                color="light.GreyText"
                fontSize={10}
                bold
                ml={5}
                opacity={0.7}
                letterSpacing={0.6}
              >
                {moment.unix(item.date).format('DD MMM YYYY, hh:mmA')}
              </Text>
              <Box
                backgroundColor="light.primaryBackground"
                padding={5}
                borderRadius={1}
                my={2}
                borderLeftColor="light.lightAccent"
                borderLeftWidth={1}
                width="100%"
                ml={wp(3.5)}
                position="relative"
              >
                <Text color="light.headerText" fontSize={14} letterSpacing={1}>
                  {strings[item.title]}
                </Text>
                {item.subtitle !== '' && (
                  <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
                    {item.subtitle}
                  </Text>
                )}
              </Box>
            </Box>
          )}
          keyExtractor={(item) => `${item}`}
        />
      </ScrollView>

      <Box alignItems="flex-start">
        <Buttons
          primaryText={common.confirm}
          primaryCallback={onPressConfirm}
          touchDisable={true}
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
            } else {
              dispatch(cloudBackupSkipped());
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
            } else {
              dispatch(confirmCloudBackup(password));
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
            navigtaion.navigate('NewHome');
          }}
        />
      </ModalWrapper>
    </Box>
  );
}
export default BackupHealthCheckList;
