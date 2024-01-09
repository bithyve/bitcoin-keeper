import { StatusBar, StyleSheet } from 'react-native';
import React from 'react';
import { Box, HStack, ScrollView, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import Text from 'src/components/KeeperText';
import useSigners from 'src/hooks/useSigners';
import SignerCard from '../AddSigner/SignerCard';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';

const ManageSigners = () => {
  const { colorMode } = useColorMode();
  const { signers } = useSigners();
  const navigation = useNavigation();

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.learnMoreBorder`}>
      <StatusBar barStyle="light-content" />
      <Box style={styles.header}>
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
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.body}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Box style={styles.signerContainer}>
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
                  colorVarient="green"
                />
              );
            })}
            <AddCard
              name={'Add Signer'}
              cardStyles={styles.addCard}
              callback={() =>
                navigation.dispatch(
                  CommonActions.navigate('SigningDeviceList', { addSignerFlow: true })
                )
              }
            />
          </Box>
        </ScrollView>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    flex: 0.6,
  },
  body: {
    flex: 1,
    paddingHorizontal: '4%',
  },
  scrollContainer: {
    marginTop: '-20%',
  },
  signerContainer: {
    width: windowWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  infoText: {
    letterSpacing: 1.28,
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.04,
    margin: 3,
  },
});
