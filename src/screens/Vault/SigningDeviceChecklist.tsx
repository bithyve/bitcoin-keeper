import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import DotView from 'src/components/DotView';
import moment from 'moment';
import { Signer } from 'src/core/wallets/interfaces/vault';

function SigningDeviceChecklist({ item }: { item: Signer }) {
  const { colorMode } = useColorMode();
  return (
    <Box padding={1}>
      {item && (
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
            Health Check Successful
          </Text>
          <Text color={`${colorMode}.GreyText`} fontSize={11} ml={5} opacity={0.7}>
            {moment(item?.lastHealthCheck).calendar()}
          </Text>
        </Box>
      )}
    </Box>
  );
}
export default SigningDeviceChecklist;
