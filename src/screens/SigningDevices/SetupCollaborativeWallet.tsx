import { StyleSheet } from 'react-native';
import { FlatList, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Signer, VaultSigner } from 'src/core/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, windowWidth } from 'src/constants/responsive';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { crossInteractionHandler, getPlaceholder } from 'src/utils/utilities';
import {
  extractKeyFromDescriptor,
  generateSignerFromMetaData,
  getSignerNameFromType,
} from 'src/hardware';
import { getCosignerDetails } from 'src/core/wallets/factories/WalletFactory';
import { SignerStorage, SignerType, VaultType, XpubTypes } from 'src/core/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault, addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { useAppSelector } from 'src/store/hooks';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetVaultFlags } from 'src/store/reducers/vaults';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import FloatingCTA from 'src/components/FloatingCTA';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import AddCard from 'src/components/AddCard';
import SignerCard from '../AddSigner/SignerCard';

function SignerItem({
  vaultKey,
  index,
  onQRScan,
  removeSigner,
  coSignerFingerprint,
  signerMap,
}: {
  vaultKey: VaultSigner | undefined;
  index: number;
  onQRScan: any;
  removeSigner: any;
  coSignerFingerprint: string;
  signerMap: { [key: string]: Signer };
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
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

  if (!signer || !vaultKey) {
    return (
      <AddCard
        name={index === 0 ? 'Adding your key...' : `Add ${getPlaceholder(index)} cosigner`}
        cardStyles={styles.addCard}
        callback={callback}
      />
    );
  }

  return (
    <SignerCard
      key={signer.masterFingerprint}
      name={getSignerNameFromType(signer.type, signer.isMock)}
      description={`Added ${moment(signer.addedOn).calendar()}`}
      icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
      isSelected={false}
      showSelection={false}
      colorVarient="green"
      isFullText
    />
  );
}

type ScreenProps = NativeStackScreenProps<AppStackParams, 'SetupCollaborativeWallet'>;

const SetupCollaborativeWallet = ({ route }: ScreenProps) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { coSigner, walletId, collaborativeWalletsCount } = route.params || {};
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

  const pushSigner = (xpub, derivationPath, masterFingerprint, goBack = true, mine = false) => {
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
        signerType: mine ? SignerType.MY_KEEPER : SignerType.KEEPER,
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
        false,
        true
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
      removeSigner={removeSigner}
      coSignerFingerprint={coSigner.id}
      signerMap={signerMap}
    />
  );

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
        horizontal
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        data={coSigners}
        keyExtractor={(item, index) => item?.xfp ?? index}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />
      <FloatingCTA
        primaryText={'Create'}
        primaryCallback={createVault}
        secondaryText="Cancel"
        primaryLoading={isCreating}
        primaryDisable={coSigners.filter((item) => item)?.length < 2}
      />
    </ScreenWrapper>
  );
};

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
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
});

export default SetupCollaborativeWallet;
