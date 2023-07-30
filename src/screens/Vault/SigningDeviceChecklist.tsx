import Text from 'src/components/KeeperText';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import DotView from 'src/components/DotView';
import moment from 'moment';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';

function SigningDeviceChecklist({ signer }: { signer: VaultSigner }) {
  const { colorMode } = useColorMode();
  return (
    <Box padding={1}>
      {signer && (
        <Box
          padding={1}
          borderLeftColor={`${colorMode}.lightAccent`}
          borderLeftWidth={1}
          width="100%"
          position="relative"
        >
          <Box
            zIndex={99}
            position="absolute"
            left={-8}
            backgroundColor={`${colorMode}.secondaryBackground`}
            padding={1}
            borderRadius={15}
          >
            <DotView height={2} width={2} color={`${colorMode}.lightAccent`} />
          </Box>
          <Text color={`${colorMode}.GreyText`} fontSize={10} bold ml={5} opacity={0.7}>
            {moment(signer?.lastHealthCheck).calendar()}
          </Text>
          <Box
            backgroundColor={`${colorMode}.seashellWhite`}
            padding={5}
            borderRadius={10}
            my={2}
            ml={5}
          >
            <Text letterSpacing={0.96}>Health Check Successful</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
export default SigningDeviceChecklist;
