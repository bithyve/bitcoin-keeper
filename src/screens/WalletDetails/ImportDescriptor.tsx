import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { hp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import Buttons from 'src/components/Buttons';
import { CommonActions } from '@react-navigation/native';
import { ParsedVauleText, parseTextforVaultConfig } from 'src/core/utils';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { useDispatch } from 'react-redux';
import useWallets from 'src/hooks/useWallets';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import useNfcModal from 'src/hooks/useNfcModal';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import NFCOption from '../NFCChannel/NFCOption';
import { useAppSelector } from 'src/store/hooks';
import { resetVaultFlags } from 'src/store/reducers/vaults';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { captureError } from 'src/services/sentry';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

function ImportDescriptorScreen({ navigation }) {
  const { colorMode } = useColorMode();
  const [inputText, setInputText] = useState(``);
  const [walletCreationLoading, setWalletCreationLoading] = useState(false);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed, error } = useAppSelector(
    (state) => state.vault
  );

  const [collaborativeWalletId, setCollaborativeWalletId] = useState('');
  const { wallets } = useWallets();

  useEffect(() => {
    if (hasNewVaultGenerationSucceeded) {
      setWalletCreationLoading(false);
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'VaultDetails', params: { vaultId: collaborativeWalletId } },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
      dispatch(resetVaultFlags());
      dispatch(resetRealyVaultState());
    }
    if (hasNewVaultGenerationFailed) {
      setWalletCreationLoading(false);
      showToast('Error creating collaborative wallet', <ToastErrorIcon />, 4000);
      captureError(error);
    }
  }, [hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed]);

  const initateWalletRecreation = () => {
    try {
      setWalletCreationLoading(true);
      const parsedText: ParsedVauleText = parseTextforVaultConfig(inputText);
      if (parsedText) {
        const signers: VaultSigner[] = [];
        parsedText.signersDetails.forEach((config) => {
          const { key } = generateSignerFromMetaData({
            xpub: config.xpub,
            derivationPath: config.path,
            masterFingerprint: config.masterFingerprint,
            signerType: SignerType.KEEPER,
            storageType: SignerStorage.WARM,
            isMultisig: config.isMultisig,
          });
          signers.push(key);
        });

        const parentCollaborativeWallet =
          wallets.find((wallet) =>
            signers.some((signer) => signer.masterFingerprint === wallet.id)
          ) || null;
        if (!parentCollaborativeWallet) {
          throw new Error('Descriptor does not contain your key');
        }

        setCollaborativeWalletId(parentCollaborativeWallet.id);

        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.COLLABORATIVE,
          vaultScheme: parsedText.scheme,
          vaultSigners: signers,
          vaultDetails: {
            name: 'Collborative Wallet',
            description: `${parsedText.scheme.m} of ${parsedText.scheme.n} Multisig`,
          },
          collaborativeWalletId: parentCollaborativeWallet.id,
        };
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      }
    } catch (error) {
      setWalletCreationLoading(false);
      showToast(`${error.toString()}`);
    }
  };
  const { nfcVisible, withNfcModal, closeNfc } = useNfcModal();

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.wrapper}>
          <KeeperHeader
            title="Create Wallet through descriptors"
            subtitle="Create Collabrative Wallet through descriptor"
          />
          <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <TextInput
              placeholder="Enter the Wallet Configuration File"
              placeholderTextColor={Colors.Feldgrau} // TODO: change this to colorMode
              style={styles.textInput}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              multiline
            />
          </Box>
          <Box style={styles.tileContainer}>
            <Box paddingBottom="10">
              <NFCOption
                setData={setInputText}
                nfcVisible={nfcVisible}
                closeNfc={closeNfc}
                withNfcModal={withNfcModal}
                signerType={SignerType.KEEPER}
              />
            </Box>
            <Buttons
              primaryDisable={!inputText.length}
              primaryCallback={() => initateWalletRecreation()}
              primaryText="Create"
              primaryLoading={walletCreationLoading}
            />
          </Box>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

export default ImportDescriptorScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'column',
    marginVertical: hp(20),
    marginHorizontal: hp(5),
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
    opacity: 0.5,
    height: 150,
  },
  tileContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
});
