import { ActivityIndicator, Dimensions, Pressable, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, FlatList, HStack, useColorMode, VStack } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Signer, VaultSigner } from 'src/core/wallets/interfaces/vault';
import AddIcon from 'src/assets/images/green_add.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight } from 'src/constants/responsive';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { crossInteractionHandler, getPlaceholder } from 'src/utils/utilities';
import { extractKeyFromDescriptor, generateSignerFromMetaData } from 'src/hardware';
import { getCosignerDetails, signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import { SignerStorage, SignerType, VaultType, XpubTypes } from 'src/core/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import OptionCTA from 'src/components/OptionCTA';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault, addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { useAppSelector } from 'src/store/hooks';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetVaultFlags } from 'src/store/reducers/vaults';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import DescriptionModal from '../Vault/components/EditDescriptionModal';
import { globalStyles } from 'src/constants/globalStyles';
import FloatingCTA from 'src/components/FloatingCTA';
import useSignerMap from 'src/hooks/useSignerMap';

const { width } = Dimensions.get('screen');

function SignerItem({
  vaultKey,
  index,
  onQRScan,
  removeSigner,
  updateSigner,
  coSignerFingerprint,
  signerMap,
}: {
  vaultKey: VaultSigner | undefined;
  index: number;
  onQRScan: any;
  removeSigner: any;
  updateSigner: any;
  coSignerFingerprint: string;
  signerMap: { [key: string]: Signer };
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);
  const signer = vaultKey ? signerMap[vaultKey.masterFingerprint] : null;

  const navigateToAddQrBasedSigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `Add a co-signer`,
          subtitle: 'Please scan until all the QR data has been retrieved',
          onQrScan: onQRScan,
          setup: true,
          type: SignerType.KEEPER,
          isHealthcheck: true,
          signer,
          disableMockFlow: true,
        },
      })
    );
  };

  const callback = () => {
    navigateToAddQrBasedSigner();
  };
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);

  if (!signer || !vaultKey) {
    return (
      <Pressable onPress={callback}>
        <Box style={styles.signerItemContainer}>
          <HStack style={styles.signerItem}>
            <HStack alignItems="center">
              <AddIcon />
              <VStack marginX="4" maxWidth="64">
                <Text
                  color={`${colorMode}.primaryText`}
                  numberOfLines={2}
                  style={[globalStyles.font15, { letterSpacing: 1.12, alignItems: 'center' }]}
                >
                  {`Add ${getPlaceholder(index)} co-signer`}
                </Text>
                <Text
                  color={`${colorMode}.GreyText`}
                  style={[globalStyles.font13, { letterSpacing: 0.06 }]}
                >
                  {index === 0 ? 'Adding your key...' : 'Add a co-signer'}
                </Text>
              </VStack>
            </HStack>
            <Box style={styles.backArrow}>
              {index === 0 ? <ActivityIndicator /> : <IconArrowBlack />}
            </Box>
          </HStack>
        </Box>
      </Pressable>
    );
  }

  return (
    <Box style={styles.itemContainer}>
      <HStack style={styles.signerItem}>
        <HStack>
          <Box
            width="8"
            height="8"
            borderRadius={30}
            backgroundColor="#725436"
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
          >
            {SDIcons(signer.type, true).Icon}
          </Box>
          <VStack marginLeft="4" maxWidth="80%">
            <Text
              color={`${colorMode}.primaryText`}
              numberOfLines={1}
              style={[
                globalStyles.font15,
                { alignItems: 'center', letterSpacing: 1.12, maxWidth: width * 0.5 },
              ]}
            >
              {`${
                coSignerFingerprint === signer.masterFingerprint
                  ? 'My co-signer'
                  : signer.signerName
              }`}
              <Text style={[globalStyles.font12]}>{` (${signer.masterFingerprint})`}</Text>
            </Text>
            <Text
              color={`${colorMode}.GreyText`}
              style={[globalStyles.font12, { letterSpacing: 0.6 }]}
            >
              {`Added ${moment(signer.lastHealthCheck).calendar()}`}
            </Text>
            <Pressable onPress={openDescriptionModal}>
              <Box style={styles.descriptionBox} backgroundColor={`${colorMode}.seashellWhite`}>
                <Text
                  numberOfLines={1}
                  color={signer.signerDescription ? '#6A7772' : '#387F6A'}
                  style={[
                    globalStyles.font12,
                    { letterSpacing: 0.6, fontStyle: signer.signerDescription ? null : 'italic' },
                  ]}
                  bold={!signer.signerDescription}
                >
                  {signer.signerDescription ? signer.signerDescription : 'Add Description'}
                </Text>
              </Box>
            </Pressable>
          </VStack>
        </HStack>
        {index !== 0 && (
          <Pressable style={styles.remove} onPress={() => removeSigner(index)}>
            <Text
              color={`${colorMode}.black`}
              style={[globalStyles.font12, { letterSpacing: 0.6 }]}
            >
              Remove
            </Text>
          </Pressable>
        )}
      </HStack>
      <DescriptionModal
        visible={visible}
        close={closeDescriptionModal}
        signer={signer}
        callback={(value: any) => updateSigner({ signer, key: 'signerDescription', value })}
      />
    </Box>
  );
}

function Spacer() {
  return <Box style={styles.space} />;
}

function ListFooter(wallet: Wallet, signPSBT: any) {
  const navigation = useNavigation();
  const { id } = wallet;
  return (
    <Box style={globalStyles.centerColumn}>
      <Spacer />
      <OptionCTA
        icon={null}
        title="Show co-signer Details"
        subtitle="Add to another Collaborative Wallet"
        callback={() => {
          navigation.dispatch(CommonActions.navigate('CosignerDetails', { wallet }));
        }}
      />
      <Spacer />
      <OptionCTA
        icon={null}
        title="Import Collaborative Wallet"
        subtitle="To view wallet on this app"
        callback={() => {
          navigation.dispatch(CommonActions.navigate('ImportDescriptorScreen', { walletId: id }));
        }}
      />
      <Spacer />
      <OptionCTA
        icon={null}
        title="Act as co-signer"
        subtitle={`Sign transactions (${id})`}
        callback={() => {
          navigation.dispatch(
            CommonActions.navigate({
              name: 'ScanQR',
              params: {
                title: `Scan PSBT to Sign`,
                subtitle: 'Please scan until all the QR data has been retrieved',
                onQrScan: signPSBT,
                type: SignerType.KEEPER,
              },
            })
          );
        }}
      />
    </Box>
  );
}

function SetupCollaborativeWallet() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { params } = useRoute() as { params: { coSigner; collaborativeWalletsCount; walletId } };
  const { coSigner, walletId, collaborativeWalletsCount } = params;
  const { hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed, error } = useAppSelector(
    (state) => state.vault
  );
  const COLLABORATIVE_SCHEME = { m: 2, n: 3 };
  const [coSigners, setCoSigners] = useState<VaultSigner[]>(
    new Array(COLLABORATIVE_SCHEME.n).fill(null)
  );
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToastMessage();
  const { collaborativeWallet } = useCollaborativeWallet(walletId);
  const { signerMap } = useSignerMap();

  const removeSigner = (index: number) => {
    const newSigners = coSigners.filter((_, i) => i !== index || index === 0);
    setCoSigners(newSigners);
  };

  const updateSigner = ({ signer, key, value }) => {
    const newSigners = coSigners.map((item) => {
      if (item && item.xfp === signer.xfp) {
        return { ...item, [key]: value };
      }
      return item;
    });
    setCoSigners(newSigners);
  };

  const signPSBT = (serializedPSBT, resetQR) => {
    try {
      const signedSerialisedPSBT = signCosignerPSBT(coSigner, serializedPSBT);
      navigation.dispatch(
        CommonActions.navigate({
          name: 'ShowQR',
          params: {
            data: signedSerialisedPSBT,
            encodeToBytes: false,
            title: 'Signed PSBT',
            subtitle: 'Please scan until all the QR data has been retrieved',
            type: SignerType.KEEPER,
          },
        })
      );
    } catch (err) {
      resetQR();
      showToast('Please scan a valid PSBT', null, 3000, true);
    }
  };

  const pushSigner = (xpub, derivationPath, masterFingerprint, goBack = true) => {
    try {
      // duplicate check
      if (coSigners.find((item) => item && item.xpub === xpub)) {
        showToast('This co-signer has already been added', <ToastErrorIcon />);
        return;
      }
      const { key, signer } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        signerType: SignerType.KEEPER,
        storageType: SignerStorage.WARM,
        isMultisig: true,
      });
      let addedSigner = false;
      const newSigners = coSigners.map((item) => {
        if (!addedSigner && !item) {
          addedSigner = true;
          return key;
        }
        return item;
      });
      dispatch(addSigningDevice([signer]));
      setCoSigners(newSigners);
      if (goBack) navigation.goBack();
    } catch (err) {
      console.log(err);
      const message = crossInteractionHandler(err);
      showToast(message, <ToastErrorIcon />, 4000);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      const details = getCosignerDetails(coSigner);
      pushSigner(
        details.xpubDetails[XpubTypes.P2WSH].xpub,
        details.xpubDetails[XpubTypes.P2WSH].derivationPath,
        details.mfp,
        false
      );
    }, 200);
    return () => {
      dispatch(resetVaultFlags());
      dispatch(resetRealyVaultState());
    };
  }, []);

  useEffect(() => {
    if (hasNewVaultGenerationSucceeded && collaborativeWallet) {
      setIsCreating(false);
      const navigationState = {
        index: 1,
        routes: [
          { name: 'Home' },
          { name: 'VaultDetails', params: { vaultId: collaborativeWallet.id } },
        ],
      };
      navigation.dispatch(CommonActions.reset(navigationState));
      dispatch(resetVaultFlags());
      dispatch(resetRealyVaultState());
    }
    if (hasNewVaultGenerationFailed) {
      setIsCreating(false);
      showToast('Error creating collaborative wallet', <ToastErrorIcon />, 4000);
      captureError(error);
    }
  }, [hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed, collaborativeWallet]);

  const renderSigner = ({ item, index }) => (
    <SignerItem
      vaultKey={item}
      index={index}
      onQRScan={(data) => {
        const { xpub, masterFingerprint, derivationPath } = extractKeyFromDescriptor(data);
        pushSigner(xpub, derivationPath, masterFingerprint);
      }}
      updateSigner={updateSigner}
      removeSigner={removeSigner}
      coSignerFingerprint={coSigner.id}
      signerMap={signerMap}
    />
  );

  const ListFooterComponent = useCallback(() => ListFooter(coSigner, signPSBT), [coSigner]);

  const createVault = useCallback(() => {
    try {
      setIsCreating(true);
      const vaultInfo: NewVaultInfo = {
        vaultType: VaultType.COLLABORATIVE,
        vaultScheme: COLLABORATIVE_SCHEME,
        vaultSigners: coSigners,
        vaultDetails: {
          name: `Collaborative Wallet ${collaborativeWalletsCount + 1}`,
          description: '2 of 3 multisig',
        },
        collaborativeWalletId: walletId,
      };
      dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      return vaultInfo;
    } catch (err) {
      captureError(err);
      return false;
    }
  }, [coSigners]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Add Signers" subtitle="A 2 of 3 collaborative wallet will be created" />
      <FlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        data={coSigners}
        keyExtractor={(item, index) => item?.xfp ?? index}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
        ListFooterComponent={ListFooterComponent}
      />
      <FloatingCTA
        primaryText={'Create'}
        primaryCallback={createVault}
        secondaryText="Cancel"
        primaryLoading={isCreating}
        primaryDisable={coSigners.filter((item) => item).length < 2}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: hp(windowHeight < 700 ? 5 : 25),
  },
  signerItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: hp(25),
  },
  signerItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  remove: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#FAC48B',
    justifyContent: 'center',
  },
  bottomContainer: {
    bottom: 5,
    padding: 20,
  },
  descriptionBox: {
    height: 24,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  backArrow: {
    width: '15%',
    alignItems: 'center',
  },
  space: {
    marginVertical: 10,
  },
});

export default SetupCollaborativeWallet;
