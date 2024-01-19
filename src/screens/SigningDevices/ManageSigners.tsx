import { StatusBar, StyleSheet } from 'react-native';
import React from 'react';
import { Box, HStack, ScrollView, VStack, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import useSigners from 'src/hooks/useSigners';
import SignerCard from '../AddSigner/SignerCard';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import SignerIcon from 'src/assets/images/signer_white.svg';

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
            <Box style={styles.iconWrapper} backgroundColor={`${colorMode}.RussetBrown`}>
              <SignerIcon />
            </Box>
            <VStack>
              <Text
                color={`${colorMode}.white`}
                style={styles.infoText}
                fontSize={18}
                testID={'text_vaultName'}
              >
                {'Manage Signers'}
              </Text>
              <Text
                color={`${colorMode}.white`}
                style={styles.infoText}
                fontSize={14}
                testID={'text_vaultDescription'}
                numberOfLines={2}
              >
                {'Add, remove, change or check on signers'}
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
                  name={signer.signerName}
                  description={signer.signerDescription || signer.type}
                  icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
                  isSelected={false}
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
    paddingHorizontal: '5%',
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
    maxWidth: windowWidth * 0.6,
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    margin: 10,
  },
});
