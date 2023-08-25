import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Fonts from 'src/common/Fonts';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import { useRoute } from '@react-navigation/native';
import { ParsedVauleText, parseTextforVaultConfig } from 'src/core/utils';
import { generateSignerFromMetaData } from 'src/hardware';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { useDispatch } from 'react-redux';
import { getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import useWallets from 'src/hooks/useWallets';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import useNfcModal from 'src/hooks/useNfcModal';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import NFCOption from '../NFCChannel/NFCOption';

function ImportDescriptorScreen({ navigation }) {
  const { colorMode } = useColorMode();
  const [inputText, setInputText] = useState(``);
  //   const { recoveryLoading, initateRecovery } = useConfigRecovery();
  const [walletCreationLoading, setWalletCreationLoading] = useState(false);
  const { showToast } = useToastMessage();
  const route = useRoute();
  const dispatch = useDispatch();
  const { walletId } = route.params as { walletId: string };
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const wallet = useWallets({ walletIds: [walletId] }).wallets[0];
  const { collaborativeWallet } = useCollaborativeWallet(walletId);

  useEffect(() => {
    if (collaborativeWallet) {
      setWalletCreationLoading(false);
      navigation.replace('VaultDetails', { walletId: wallet.id, isCollaborativeWallet: true });
    }
  }, [collaborativeWallet]);
  const initateWalletRecreation = () => {
    try {
      setWalletCreationLoading(true);
      const parsedText: ParsedVauleText = parseTextforVaultConfig(inputText);
      if (parsedText) {
        const signers: VaultSigner[] = [];
        parsedText.signersDetails.forEach((config) => {
          const signer = generateSignerFromMetaData({
            xpub: config.xpub,
            derivationPath: config.path,
            xfp: config.masterFingerprint,
            signerType: SignerType.KEEPER,
            storageType: SignerStorage.WARM,
            isMultisig: config.isMultisig,
          });
          signers.push(signer);
        });

        const { xpub: myXpub } = getCosignerDetails(wallet, keeper.id);
        const isValidDescriptor = signers.find((signer) => signer.xpub === myXpub);
        if (!isValidDescriptor) {
          throw new Error('Descriptor does not contain your key');
        }

        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.COLLABORATIVE,
          vaultScheme: parsedText.scheme,
          vaultSigners: signers,
          vaultDetails: {
            name: 'Collborative Wallet',
            description: `${parsedText.scheme.m} of ${parsedText.scheme.n} Multisig`,
          },
          collaborativeWalletId: walletId,
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
          <HeaderTitle
            title="Create Wallet through descriptors"
            subtitle="Create Collabrative Wallet through descriptor"
            paddingTop={hp(5)}
            paddingLeft={wp(20)}
          />
          <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
            <TextInput
              placeholder="Enter the output descriptor"
              placeholderTextColor={Colors.Feldgrau} // TODO: change to colorMode and use native base component
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
    fontFamily: Fonts.RobotoCondensedRegular,
    opacity: 0.5,
    height: 150,
  },
  tileContainer: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  tileWrapper: {
    marginBottom: 15,
  },
});
