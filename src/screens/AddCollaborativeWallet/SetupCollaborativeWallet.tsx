import { ActivityIndicator, Dimensions, Pressable } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, FlatList, HStack, useColorMode, VStack } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';

import AddIcon from 'src/assets/images/green_add.svg';
import Buttons from 'src/components/Buttons';
import HeaderTitle from 'src/components/HeaderTitle';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { crossInteractionHandler, getPlaceholder } from 'src/common/utilities';
import { generateSignerFromMetaData } from 'src/hardware';
import { globalStyles } from 'src/common/globalStyles';
import { getCosignerDetails, signCosignerPSBT } from 'src/core/wallets/factories/WalletFactory';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import OptionCTA from 'src/components/OptionCTA';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/core/services/sentry';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { useAppSelector } from 'src/store/hooks';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetVaultFlags } from 'src/store/reducers/vaults';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import DescriptionModal from '../Vault/components/EditDescriptionModal';
import { useQuery } from '@realm/react';

const { width } = Dimensions.get('screen');

function SignerItem({
  signer,
  index,
  onQRScan,
  removeSigner,
  updateSigner,
  coSignerFingerprint,
}: {
  signer: VaultSigner | undefined;
  index: number;
  onQRScan: any;
  removeSigner: any;
  updateSigner: any;
  coSignerFingerprint: string;
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const navigateToAddQrBasedSigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: `Add a CoSigner`,
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

  if (!signer) {
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
                coSignerFingerprint === signer.masterFingerprint ? 'My CoSigner' : signer.signerName
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
        <Pressable style={styles.remove} onPress={() => removeSigner(index)} disabled={index === 0}>
          <Text color={`${colorMode}.black`} style={[globalStyles.font12, { letterSpacing: 0.6 }]}>
            Remove
          </Text>
        </Pressable>
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
        title="Show Co-signer Details"
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
        title="Act as Co-signer"
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
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const { showToast } = useToastMessage();
  const { collaborativeWallet } = useCollaborativeWallet(walletId);

  const removeSigner = (index: number) => {
    const newSigners = coSigners.filter((_, i) => i !== index || index === 0);
    setCoSigners(newSigners);
  };

  const updateSigner = ({ signer, key, value }) => {
    const newSigners = coSigners.map((item) => {
      if (item && item.signerId === signer.signerId) {
        return { ...item, [key]: value };
      }
      return item;
    });
    setCoSigners(newSigners);
  };

  const signPSBT = (serializedPSBT) => {
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
  };

  const pushSigner = (coSigner, goBack = true) => {
    try {
      if (!coSigner.xpub) {
        coSigner = JSON.parse(coSigner);
        if (!coSigner.xpub) {
          showToast('Please scan a vaild QR', <ToastErrorIcon />, 4000);
          return;
        }
      }
      const { mfp, xpub, derivationPath } = coSigner;
      // duplicate check
      if (coSigners.find((item) => item && item.xpub === xpub)) {
        showToast('This CoSigner has already been added', <ToastErrorIcon />);
        return;
      }
      const ksd = generateSignerFromMetaData({
        xpub,
        derivationPath,
        xfp: mfp,
        signerType: SignerType.KEEPER,
        storageType: SignerStorage.WARM,
        isMultisig: true,
      });
      let addedSigner = false;
      const newSigners = coSigners.map((item) => {
        if (!addedSigner && !item) {
          addedSigner = true;
          return ksd;
        }
        return item;
      });
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
      const details = getCosignerDetails(coSigner, keeper.id);
      pushSigner(details, false);
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
          { name: 'NewHome' },
          { name: 'VaultDetails', params: { collaborativeWalletId: walletId } },
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
      signer={item}
      index={index}
      onQRScan={pushSigner}
      updateSigner={updateSigner}
      removeSigner={removeSigner}
      coSignerFingerprint={coSigner.id}
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
      <HeaderTitle
        title="Add Signers"
        subtitle="A 2 of 3 collaborative wallet will be created"
        headerTitleColor={`${colorMode}.black`}
        paddingLeft={25}
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        data={coSigners}
        keyExtractor={(item, index) => item?.signerId ?? index}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
        ListFooterComponent={ListFooterComponent}
      />
      <Box style={styles.bottomContainer} backgroundColor={`${colorMode}.primaryBackground`}>
        <Buttons
          primaryDisable={coSigners.filter((item) => item).length < 2}
          primaryText="Create"
          primaryCallback={createVault}
          secondaryText="Cancel"
          secondaryCallback={navigation.goBack}
          paddingHorizontal={wp(30)}
          primaryLoading={isCreating}
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
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
