import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import DotView from 'src/components/DotView';
import moment from 'moment';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { StyleSheet } from 'react-native';
import { hp } from 'src/constants/responsive';
import { BackupAction } from 'src/models/enums/BHR';

const statusTextMapping = {
  [hcStatusType.HEALTH_CHECK_SUCCESSFULL]: 'Health check successful',
  [hcStatusType.HEALTH_CHECK_FAILED]: 'Health check failed',
  [hcStatusType.HEALTH_CHECK_SKIPPED]: 'Health check skipped',
  [hcStatusType.HEALTH_CHECK_SD_ADDITION]: 'Signer added',
  [hcStatusType.HEALTH_CHECK_MANAUAL]: 'Manual health confirmation',
  [hcStatusType.HEALTH_CHECK_SIGNING]: 'Key used for signing',
  [hcStatusType.HEALTH_CHECK_REGISTRATION]: 'Signer used for vault registration',
  [hcStatusType.HEALTH_CHECK_VERIFICATION]: 'Signer used for vault address verification',
  [BackupAction.SEED_BACKUP_CREATED]: 'Recovery Phrase backup is created',
  [BackupAction.SEED_BACKUP_CONFIRMED]: 'Recovery Phrase backup is confirmed',
  [BackupAction.SEED_BACKUP_CONFIRMATION_SKIPPED]: 'Recovery Phrase health confirmation is skipped',
};

const getHealthCheckStatusText = (status) => statusTextMapping[status] || 'Unknown status';

const getFormattedDate = (date) => {
  return moment().diff(date, 'days') < 7
    ? moment(date).calendar(null, {
        sameDay: '[Today at] HH:mmA',
        nextDay: '[Tomorrow at] HH:mmA',
        nextWeek: 'dddd [at] HH:mmA',
        lastDay: '[Yesterday at] HH:mmA',
        lastWeek: '[Last] dddd [at] HH:mmA',
        sameElse: 'DD MMM YYYY, HH:mmA',
      })
    : moment(date).format('DD MMM YYYY, HH:mmA');
};

function SigningDeviceChecklist({ status, date }: { status: string; date: Date }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container}>
      <Box>
        <Box style={styles.timeLineWrapper}>
          <Box
            zIndex={99}
            backgroundColor={`${colorMode}.RecoveryBorderColor`}
            width={30}
            height={30}
            borderRadius={50}
            alignItems={'center'}
            justifyContent={'center'}
          >
            <DotView height={3.5} width={3.5} color={`${colorMode}.BrownNeedHelp`} />
          </Box>
          <Box
            py={7}
            borderLeftColor={`${colorMode}.RecoveryBorderColor`}
            borderLeftWidth={2}
          ></Box>
        </Box>
      </Box>
      <Box style={styles.contentWrapper}>
        <Text color={`${colorMode}.secondaryText`} medium ml={2}>
          {getHealthCheckStatusText(status)}
        </Text>
        <Text color={`${colorMode}.GreyText`} fontSize={12} ml={2} opacity={0.7}>
          {getFormattedDate(date)}
        </Text>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: hp(5),
  },
  timeLineWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    width: '90%',
    paddingTop: hp(5),
    gap: 5,
  },
});

export default SigningDeviceChecklist;
