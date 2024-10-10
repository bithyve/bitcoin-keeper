import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import SignerIcon from 'src/assets/images/signer_white.svg';
import { Signer } from 'src/core/wallets/interfaces/vault';
import { getSignerDescription } from 'src/hardware';

type Props = {
  signer: Signer;
};

function UnknownSignerInfo({ signer }: Props) {
  const { colorMode } = useColorMode();

  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.container}>
      <Box style={styles.topSection}>
        <Box style={styles.gap10}>
          <CircleIconWrapper
            width={34}
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={<SignerIcon />}
          />
          <Box>
            <Text fontSize={12} medium>
              Unknown Signer
            </Text>
            <Text fontSize={11}>{getSignerDescription(signer)}</Text>
          </Box>
        </Box>
        <Box style={[styles.marginRight40, styles.flexEnd]}>
          <Text fontSize={11}>Master Fingerprint</Text>
          <Text fontSize={11} medium>
            {signer.masterFingerprint}
          </Text>
        </Box>
      </Box>
      <Box>
        <Text fontSize={11}>xPub</Text>
        <Text fontSize={11} medium numberOfLines={3}>
          {signer.signerXpubs.P2WSH[0].xpub}
        </Text>
      </Box>
    </Box>
  );
}

export default UnknownSignerInfo;

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginTop: 20,
    padding: 20,
    gap: 20,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gap10: {
    gap: 10,
  },
  marginRight40: {
    marginRight: 40,
  },
  flexEnd: {
    alignSelf: 'flex-end',
  },
});
