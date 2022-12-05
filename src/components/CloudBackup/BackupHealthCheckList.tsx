import React, { useContext, useState, useEffect, useMemo } from 'react';
import { FlatList, Box, Text, ScrollView } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import moment from 'moment';

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
import HealthCheckComponent from './HealthCheckComponent';
import BackupSuccessful from '../SeedWordBackup/BackupSuccessful';
import DotView from '../DotView';
import Buttons from '../Buttons';

function BackupHealthCheckList() {
  const { translations } = useContext(LocalizationContext);
  const {common} = translations;
  const dispatch = useAppDispatch();
  const strings = translations.BackupWallet;
  const { useQuery } = useContext(RealmWrapperContext);
  const data: BackupHistory = useQuery(RealmSchema.BackupHistory);
  const { primaryMnemonic, backupPassword, backupPasswordHint }: KeeperApp = useQuery(
    RealmSchema.KeeperApp
  ).map(getJSONFromRealmObject)[0];
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
                bg="light.ReceiveBackground"
                p={2}
                borderRadius={15}
              >
                <DotView height={2} width={2} color="#E3BE96" />
              </Box>
              <Text
                color="light.GreyText"
                fontSize={RFValue(10)}
                fontWeight="300"
                ml={5}
                opacity={0.7}
                letterSpacing={0.6}
              >
                {moment.unix(item.date).format('DD MMM YYYY, hh:mmA')}
              </Text>
              <Box
                bg="light.lightYellow"
                p={5}
                borderRadius={1}
                my={2}
                borderLeftColor="#E3BE96"
                borderLeftWidth={1}
                w="100%"
                ml={wp(3.5)}
                position="relative"
              >
                <Text
                  color="light.headerText"
                  fontSize={RFValue(14)}
                  fontFamily="heading"
                  fontWeight={200}
                  letterSpacing={1}
                >
                  {strings[item.title]}
                </Text>
                {item.subtitle !== '' && (
                  <Text
                    color="light.GreyText"
                    fontSize={RFValue(12)}
                    fontFamily="body"
                    fontWeight={200}
                    letterSpacing={0.6}
                  >
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
          password={backupPassword}
          hint={backupPasswordHint}
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
        />
      </ModalWrapper>
    </Box>
  );
}
export default BackupHealthCheckList;
