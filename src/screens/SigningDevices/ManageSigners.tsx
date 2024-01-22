import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
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
import useSignerMap from 'src/hooks/useSignerMap';
import { globalStyles } from 'src/constants/globalStyles';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'ManageSigners'>;
const ManageSigners = ({ route }: ScreenProps) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId = '', vaultKeys = [] } = route.params;
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();

  const handleLearnMorePressed = () => {
    //TODO: Implement learn more action
  };

  const handleCardSelect = (signer, item) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signer,
        vaultId,
        vaultKey: vaultKeys.length ? item : undefined,
      })
    );
  };

  const handleAddSigner = () => {
    navigation.dispatch(CommonActions.navigate('SigningDeviceList', { addSignerFlow: true }));
  };

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.learnMoreBorder`}>
      <StatusBar barStyle="light-content" />
      <HeaderSection colorMode={colorMode} handleLearnMorePressed={handleLearnMorePressed} />
      <SignersList
        colorMode={colorMode}
        vaultKeys={vaultKeys}
        signers={signers}
        signerMap={signerMap}
        handleCardSelect={handleCardSelect}
        handleAddSigner={handleAddSigner}
      />
    </Box>
  );
};

const HeaderSection = ({ colorMode, handleLearnMorePressed }) => (
  <Box style={styles.header}>
    <KeeperHeader learnMore learnMorePressed={handleLearnMorePressed} contrastScreen={true} />
    <VStack paddingBottom={10} paddingLeft={5}>
      <HStack alignItems="center">
        <Box style={styles.iconWrapper} backgroundColor={`${colorMode}.RussetBrown`}>
          <SignerIcon />
        </Box>
        <VStack>
          <Text
            color={`${colorMode}.white`}
            style={[styles.infoText, globalStyles.font18]}
            testID={'text_vaultName'}
          >
            {'Manage Signers'}
          </Text>
          <Text
            color={`${colorMode}.white`}
            style={[styles.infoText, globalStyles.font14]}
            testID={'text_vaultDescription'}
            numberOfLines={2}
          >
            {'Add, remove, change or check on signers'}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  </Box>
);

const SignersList = ({
  colorMode,
  vaultKeys,
  signers,
  signerMap,
  handleCardSelect,
  handleAddSigner,
}) => (
  <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.body}>
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Box style={styles.signerContainer}>
        {(vaultKeys.length ? vaultKeys : signers).map((item) => {
          const signer = vaultKeys.length ? signerMap[item.masterFingerprint] : item;
          return (
            <SignerCard
              key={signer.masterFingerprint}
              onCardSelect={() => handleCardSelect(signer, item)}
              name={signer.signerName}
              description={signer.signerDescription || signer.type}
              icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
              isSelected={false}
              showSelection={false}
              colorVarient="green"
            />
          );
        })}
        <AddCard name={'Add Signer'} cardStyles={styles.addCard} callback={handleAddSigner} />
      </Box>
    </ScrollView>
  </VStack>
);

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

export default ManageSigners;
