import { StatusBar, StyleSheet } from 'react-native';
import React from 'react';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import { useDispatch } from 'react-redux';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import Text from 'src/components/KeeperText';
import useSigners from 'src/hooks/useSigners';
import SignerCard from '../AddSigner/SignerCard';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';

const ManageSigners = () => {
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  const { signers } = useSigners();

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.learnMoreBorder`}>
      <StatusBar barStyle="light-content" />
      <Box style={{ paddingHorizontal: 20, paddingTop: 15 }}>
        <KeeperHeader learnMore learnMorePressed={() => {}} contrastScreen={true} />
        <VStack paddingBottom={10} paddingLeft={5}>
          <HStack alignItems="center">
            <Box paddingRight={3}>
              <SignerIcon />
            </Box>
            <VStack>
              <Text
                color={`${colorMode}.white`}
                style={styles.infoText}
                fontSize={16}
                testID={'text_vaultName'}
              >
                {'Manage Signers'}
              </Text>
              <Text
                color={`${colorMode}.white`}
                style={styles.infoText}
                fontSize={12}
                testID={'text_vaultDescription'}
              >
                {'Manage the hardware information'}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </Box>
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.signerContainer}>
        {signers.map((signer) => {
          return (
            <SignerCard
              key={signer.masterFingerprint}
              walletName={signer.signerName}
              walletDescription={signer.signerDescription || signer.type}
              icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
              isSelected={false}
              onCardSelect={() => {}}
              showSelection={false}
            />
          );
        })}
      </VStack>
    </Box>
  );
};

export default ManageSigners;

const styles = StyleSheet.create({
  container: {
    paddingTop: '10%',
    flex: 1,
  },
  signerContainer: {
    paddingHorizontal: '5%',
    paddingTop: '5%',
    paddingBottom: 20,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoText: {
    letterSpacing: 1.28,
  },
});
