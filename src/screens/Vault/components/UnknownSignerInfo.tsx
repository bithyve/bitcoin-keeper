import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import SignerIcon from 'src/assets/images/signer_white.svg';
import { getSignerDescription } from 'src/hardware';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type Props = {
  signer: Signer;
};

function UnknownSignerInfo({ signer }: Props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerText } = translations;

  return (
    <Box
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={`${colorMode}.dullGreyBorder`}
      style={styles.container}
    >
      <Box style={styles.topSection}>
        <Box style={styles.gap10}>
          <CircleIconWrapper
            width={34}
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={<SignerIcon />}
          />
          <Box>
            <Text fontSize={12} medium>
              {signerText.unknownSigner}
            </Text>
            <Text fontSize={11}>{getSignerDescription(signer)}</Text>
          </Box>
        </Box>
        <Box style={[styles.marginRight40, styles.flexEnd]}>
          <Text fontSize={11}>{signerText.masterFingerprint}</Text>
          <Text fontSize={11} medium>
            {signer.masterFingerprint}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default UnknownSignerInfo;

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
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
