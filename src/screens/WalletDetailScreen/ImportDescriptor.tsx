import { Keyboard, StyleSheet, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Box, useDisclose } from 'native-base';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Fonts from 'src/common/Fonts';
import ScreenWrapper from 'src/components/ScreenWrapper';
import HeaderTitle from 'src/components/HeaderTitle';
import Buttons from 'src/components/Buttons';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import { Tile } from '../NewKeeperAppScreen/NewKeeperAppScreen';
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

function ImportDescriptorScreen() {
  const [inputText, setInputText] =
    useState(`wsh(sortedmulti(2,[746DEBE3/48h/1h/0h/2h]tpubDF52SDWPbpULqiuE7Ehq7zuDXAEn5gbQd26mdzfBnm93bA6BrKL5CZtbKWCZKhqGHzQPrfNN3DaDXeUCbHujF4AKAQed8wJdXUbm7uPu4GJ/*,[D42505BD/48h/1h/0h/2h]tpubDFWxsBTt8REJG392uzgm23qywEYRvHJ8YTbYGQJWtLC2TNv2qyvxqh5Vi68YeSJozkS2wWDL3h5D6w5oQozDNy1AfqMz9knmS2dxNnGTAhh/,[529D0B46/48h/1h/0h/2h]tpubDEJj6enT4GbaRdYhyiz78BXVCNCar4VhzLY2ZgTM4yTYsAthMV5dpTaTGhGANvGg9mcfykrezibe7utf8MtS3LWM5DbCD2dJihXzbhMPS4u/*)
  No path restrictions
  tb1q8cnkak0ljc2krfqepdt7vtenq9ljj85hhgrfnyqtdqewspuxhzssjag5rc`);
  //   const { recoveryLoading, initateRecovery } = useConfigRecovery();
  const [walletCreationLoading, setWalletCreationLoading] = useState(false);
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const route = useRoute();
  const dispatch = useDispatch();
  const { walletId } = route.params as { walletId: string };
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const wallet = useWallets({ walletIds: [walletId] }).wallets[0];
  const { collaborativeWallet } = useCollaborativeWallet({ walletId });

  useEffect(() => {
    if (collaborativeWallet) {
      navigation.dispatch(
        CommonActions.navigate('VaultDetails', { walletId: wallet.id, isCollaborativeWallet: true })
      );
    }
  }, []);
  const initateWalletRecreation = (text) => {
    try {
      setWalletCreationLoading(true);
      const parsedText: ParsedVauleText = parseTextforVaultConfig(text);
      if (parsedText) {
        const signers = [];
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
        const isValidDescriptor = signers.find((signer) => signer.xPub === myXpub);

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

  return (
    <ScreenWrapper>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.wrapper}>
          <HeaderTitle
            title="Create Wallet through descriptor"
            subtitle="Create Collabrative Wallet through descriptor"
            headerTitleColor="light.textBlack"
            paddingTop={hp(5)}
            paddingLeft={wp(20)}
          />

          <Box style={styles.inputWrapper} backgroundColor="light.textInputBackground">
            <TextInput
              placeholder="Enter the output descriptor"
              placeholderTextColor="light.GreyText"
              style={styles.textInput}
              value={inputText}
              onChangeText={(text) => {
                setInputText(text);
              }}
              multiline
            />
          </Box>
          <Box style={styles.tileContainer}>
            <Buttons
              primaryCallback={() => initateWalletRecreation(inputText)}
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
