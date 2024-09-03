import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import DotView from 'src/components/DotView';
import moment from 'moment';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';

const getHealthCheckStatusText = (status) => {
  switch (status) {
    case hcStatusType.HEALTH_CHECK_SUCCESSFULL:
      return 'Health check successful';
    case hcStatusType.HEALTH_CHECK_FAILED:
      return 'Health check failed';
    case hcStatusType.HEALTH_CHECK_SKIPPED:
      return 'Health check skipped';
    case hcStatusType.HEALTH_CHECK_SD_ADDITION:
      return 'Signer added';
    case hcStatusType.HEALTH_CHECK_MANAUAL:
      return 'Manual health confirmation';
    case hcStatusType.HEALTH_CHECK_SIGNING:
      return 'Key used for signing';
    case hcStatusType.HEALTH_CHECK_REGISTRATION:
      return 'Signer used for vault registration';
    case hcStatusType.HEALTH_CHECK_VERIFICATION:
      return 'Signer used for vault address verification';
  }
};

function SigningDeviceChecklist({ status, date }: { status: string; date: Date }) {
  const { colorMode } = useColorMode();
  return (
    <Box padding={1}>
      <Box
        padding={1}
        borderLeftColor={`${colorMode}.RecoveryBorderColor`}
        borderLeftWidth={1}
        width="100%"
        position="relative"
        borderLeftStyle="dashed"
      >
        <Box
          zIndex={99}
          position="absolute"
          left={-8}
          backgroundColor={`${colorMode}.RecoveryBorderColor`}
          padding={1}
          borderRadius={15}
        >
          <DotView height={2} width={2} color={`${colorMode}.BrownNeedHelp`} />
        </Box>
        <Text color={`${colorMode}.secondaryText`} fontSize={12} bold ml={5} opacity={0.7}>
          {getHealthCheckStatusText(status)}
        </Text>
        <Text color={`${colorMode}.GreyText`} fontSize={11} ml={5} opacity={0.7}>
          {moment(date).calendar()}
        </Text>
      </Box>
    </Box>
  );
}
export default SigningDeviceChecklist;
