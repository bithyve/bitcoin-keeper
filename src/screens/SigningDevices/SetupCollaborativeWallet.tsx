import { Platform, StyleSheet } from 'react-native';
import { Box, FlatList, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Signer, Vault, VaultSigner, signerXpubs } from 'src/services/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { useDispatch } from 'react-redux';
import { getKeyUID, numberToOrdinal } from 'src/utils/utilities';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import { SignerType, VaultType, XpubTypes } from 'src/services/wallets/enums';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import {
  addNewVault,
  addSigningDevice,
  fetchCollaborativeChannel,
  updateCollaborativeChannel,
} from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { useAppSelector } from 'src/store/hooks';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import {
  resetCollaborativeSession,
  resetVaultFlags,
  setCollaborativeSessionSigners,
} from 'src/store/reducers/vaults';
import { resetRealyVaultState, resetSignersUpdateState } from 'src/store/reducers/bhr';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import WalletVaultCreationModal from 'src/components/Modal/WalletVaultCreationModal';
import useVault from 'src/hooks/useVault';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import QRCommsLight from 'src/assets/images/qr_comms.svg';
import NFCLight from 'src/assets/images/nfc-no-bg-light.svg';
import AirDropLight from 'src/assets/images/airdrop-no-bg-light.svg';
import AddIcon from 'src/assets/images/add-plain-green.svg';
import UserCoSigner from 'src/assets/images/user-cosigner.svg';
import { setupKeeperSigner } from 'src/hardware/signerSetup';
import HWError from 'src/hardware/HWErrorState';
import NFC from 'src/services/nfc';
import nfcManager, { NfcTech } from 'react-native-nfc-manager';
import Buttons from 'src/components/Buttons';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import Text from 'src/components/KeeperText';
import { generateAESKey } from 'src/utils/service-utilities/encryption';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useQuery } from '@realm/react';
import CollaborativeModals from './components/CollaborativeModals';
import SignerCard from '../AddSigner/SignerCard';
import { fetchKeyExpression } from '../WalletDetails/CosignerDetails';
import { HCESession, HCESessionContext } from 'react-native-hce';
import idx from 'idx';

function SignerItem({
  vaultKey,
  index,
  signerMap,
  setAddKeyModal,
  coSigners,
}: {
  vaultKey: VaultSigner | undefined;
  index: number;
  signerMap: { [key: string]: Signer };
  setAddKeyModal: any;
  coSigners: VaultSigner[];
}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  const signerUID = vaultKey ? getKeyUID(vaultKey) : null;
  const signer = signerUID ? signerMap[signerUID] : null;

  const isPreviousKeyAdded = useCallback(() => {
    if (index === 2) {
      return coSigners[1] !== null && coSigners[1] !== undefined;
    }
    return true;
  }, [index, coSigners]);

  const isCardDisabled = index === 2 && !isPreviousKeyAdded();
  const cardDescription = isCardDisabled ? (
    ''
  ) : (
    <Box style={styles.cardDescription}>
      <Text medium fontSize={12} color={`${colorMode}.greenishGreyText`}>
        {common.tapToAdd}{' '}
      </Text>
      <AddIcon />
    </Box>
  );

  if (!signer || !vaultKey) {
    return (
      <SignerCard
        name={
          index === 0
            ? wallet.AddingKey
            : `${common.add} ${numberToOrdinal(index + 1)} ${common.contact}`
        }
        description={cardDescription}
        customStyle={styles.signerCard}
        showSelection={false}
        onCardSelect={() => {
          if (!isCardDisabled) {
            setAddKeyModal(true);
          }
        }}
        colorVarient="green"
        colorMode={colorMode}
        cardBackground={
          index === 0 ? `${colorMode}.seashellWhite` : `${colorMode}.primaryBackground`
        }
        borderColor={index === 0 ? `${colorMode}.dullGreyBorder` : `${colorMode}.pantoneGreen`}
        nameColor={`${colorMode}.greenWhiteText`}
        boldDesc
        icon={<UserCoSigner />}
        disabled={isCardDisabled}
        isFullText
      />
    );
  }

  return (
    <SignerCard
      key={signerUID}
      name={
        index === 0
          ? 'My Key'
          : signer?.extraData?.givenName || signer?.extraData?.familyName
          ? `${signer?.extraData?.givenName ?? ''} ${signer?.extraData?.familyName ?? ''}`.trim()
          : `${numberToOrdinal(index + 1)} ${common.coSigner}`
      }
      description={
        signer.type === SignerType.MY_KEEPER
          ? getSignerDescription(signer)
          : getSignerNameFromType(signer.type, signer.isMock, false)
      }
      icon={<UserCoSigner />}
      image={signer?.extraData?.thumbnailPath}
      customStyle={styles.signerCard}
      isSelected={false}
      showSelection={false}
      colorVarient="green"
      isFullText
      colorMode={colorMode}
    />
  );
}

export const COLLABORATIVE_SCHEME = { m: 2, n: 3 };

function SetupCollaborativeWallet() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allVaults } = useVault({ includeArchived: false });
  const { hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed, error } = useAppSelector(
    (state) => state.vault
  );
  const app: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];

  const [coSigners, setCoSigners] = useState<VaultSigner[]>(
    new Array(COLLABORATIVE_SCHEME.n).fill(null)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [walletCreatedModal, setWalletCreatedModal] = useState(false);
  const [collaborativeVault, setCollaborativeVault] = useState<Vault | null>(null);
  const { showToast } = useToastMessage();
  const { collaborativeWallets } = useCollaborativeWallet();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet, vault: vaultText } = translations;
  const [learnMoreModal, setLearnMoreModal] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState(null);
  const [addKeyModal, setAddKeyModal] = useState(false);
  const [externalKeyAddedModal, setExternalKeyAddedModal] = useState(false);
  const [addedKey, setAddedKey] = useState(null);
  const [myKey, setMyKey] = useState(null);
  const [mySigner, setMySigner] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [nfcModal, setNfcModal] = useState(false);
  const [activateFetcher, setActivateFetcher] = useState(false);
  const { relaySignersUpdateLoading, realySignersUpdateErrorMessage, realySignersAdded } =
    useAppSelector((state) => state.bhr);
  const { collaborativeSession } = useAppSelector((state) => state.vault);
  const isAndroid = Platform.OS === 'android';
  const { session } = useContext(HCESessionContext);

  const refreshCollaborativeChannel = (self: Signer) => {
    dispatch(fetchCollaborativeChannel(self));
  };

  useEffect(() => {
    if (activateFetcher && mySigner && !collaborativeSession.isComplete) {
      // disables once collaborative session is complete
      const interval = setInterval(() => {
        refreshCollaborativeChannel(mySigner);
      }, 5000); // syncs every 5 seconds

      return () => clearInterval(interval);
    }
  }, [dispatch, activateFetcher, mySigner, collaborativeSession.isComplete]);

  useEffect(() => {
    // case: initialize the fetch for collaborative session signers from the remote state
    if (collaborativeSession && mySigner) {
      const signersCount = Object.keys(collaborativeSession.signers).length;
      // cases: collaborative session is in progress but not yet completed
      if (signersCount > 1) {
        setActivateFetcher(true);
      } else if (collaborativeSession.lastSynced) {
        setActivateFetcher(true);
      }
    }
  }, [mySigner]);

  useEffect(() => {
    // updates the local cosigners state with the collaborative session signers state
    const selfSignerInitialized = coSigners.some((signer) => signer !== null);
    if (selfSignerInitialized && collaborativeSession) {
      for (const fingerprint in collaborativeSession.signers) {
        const { keyDescriptor } = collaborativeSession.signers[fingerprint];
        const hw = setupKeeperSigner(keyDescriptor);

        if (!isSignerDuplicate(hw.key, coSigners)) {
          // update the local cosigners state if collaborativeSession.signers gets ahead of it(due to the fetcher)
          dispatch(addSigningDevice([hw.signer]));
          setSelectedSigner(hw.signer);
          setAddedKey(hw.signer);

          setCoSigners((prev) => {
            const updatedSigners = [...prev];
            const emptyIndex = updatedSigners.findIndex((signer) => !signer);
            if (emptyIndex !== -1) {
              updatedSigners[emptyIndex] = hw.key;
            }
            return updatedSigners;
          });
        }
      }
    }
  }, [coSigners, collaborativeSession]);

  const addKeyOptions = [
    {
      icon: <QRCommsLight />,
      title: vaultText.scanQR,
      callback: () => {
        setAddKeyModal(false);
        navigation.dispatch(
          CommonActions.navigate({
            name: 'ScanQR',
            params: {
              title: vaultText.scanQR,
              subtitle: vaultText.scanOrUpload,
              setup: true,
              importOptions: false,
              type: SignerType.KEEPER,
              showNote: true,
              onQrScan,
            },
          })
        );
      },
    },
    {
      icon: <NFCLight />,
      title: vaultText.nfcOnTap,
      callback: () => {
        setAddKeyModal(false);
        onNFCTap();
      },
    },
    {
      icon: <AirDropLight />,
      title: vaultText.airdropOrFileExport,
      callback: () => {
        setAddKeyModal(false),
          navigation.dispatch(
            CommonActions.navigate({
              name: 'ImportContactFile',
              params: {
                title: vaultText.fileImport,
                subTitle: vaultText.importFileOrPaste,
                onFileExtract,
                ctaText: common.proceed,
              },
            })
          );
      },
    },
  ];

  useEffect(() => {
    setInProgress(relaySignersUpdateLoading);
  }, [relaySignersUpdateLoading]);

  useEffect(() => {
    if (realySignersUpdateErrorMessage) {
      setInProgress(false);
      showToast(
        realySignersUpdateErrorMessage,
        <ToastErrorIcon />,
        IToastCategory.SIGNING_DEVICE,
        5000
      );
      dispatch(resetSignersUpdateState());
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [realySignersUpdateErrorMessage]);

  useEffect(() => {
    if (realySignersAdded) {
      setInProgress(false);
    }
  }, [realySignersAdded]);

  const isSignerDuplicate = (newSigner, existingSigners) => {
    if (!newSigner) return false;

    const newSignerUID = getKeyUID(newSigner);
    return existingSigners.some((signer) => {
      if (!signer) return false;
      return getKeyUID(signer) === newSignerUID;
    });
  };

  const handleCoSignerAddition = (
    hw: {
      signer: Signer;
      key: VaultSigner;
    },
    keyDescriptor: string,
    keyAES: string,
    goBack = false
  ) => {
    if (!hw) return;

    if (isSignerDuplicate(hw.key, coSigners)) {
      showToast(vaultText.keyAlreadyAdded, <ToastErrorIcon />, IToastCategory.SIGNING_DEVICE);
      {
        goBack && navigation.dispatch(CommonActions.goBack());
      }
      return;
    }

    dispatch(addSigningDevice([hw.signer]));
    setSelectedSigner(hw.signer);
    setAddedKey(hw.signer);

    setCoSigners((prev) => {
      const updatedSigners = [...prev];
      const emptyIndex = updatedSigners.findIndex((signer) => !signer);
      if (emptyIndex !== -1) {
        updatedSigners[emptyIndex] = hw.key;
      }
      return updatedSigners;
    });

    // update the collaborative state - locally and remotely
    dispatch(
      setCollaborativeSessionSigners({
        [hw.signer.masterFingerprint]: { keyDescriptor, keyAES },
      })
    );
    dispatch(updateCollaborativeChannel(mySigner));
    setActivateFetcher(true);
    // activates the collaborative channel fetcher, case: fetching state updates from the other collaborators

    setExternalKeyAddedModal(true);
    {
      goBack && navigation.dispatch(CommonActions.goBack());
    }
  };

  const handleError = (error, sourceType) => {
    if (error instanceof HWError) {
      showToast(error.message, <ToastErrorIcon />);
    } else {
      captureError(error);
      const errorMessage =
        sourceType === 'QR'
          ? `${vaultText.invalidQRError} ${getSignerNameFromType(SignerType.KEEPER)}`
          : sourceType === 'File'
          ? `${vaultText.invalidFileError} ${getSignerNameFromType(SignerType.KEEPER)}`
          : vaultText.invalidNFCTag;
      showToast(errorMessage, <ToastErrorIcon />);
      sourceType !== 'NFC' && navigation.goBack();
    }
  };

  const onQrScan = async (qrData) => {
    try {
      const { keyDescriptor, keyAES } = JSON.parse(qrData);
      const hw = setupKeeperSigner(keyDescriptor);

      handleCoSignerAddition(hw, keyDescriptor, keyAES, true);
    } catch (error) {
      handleError(error, 'QR');
    }
  };

  const createCosignerFromNFC = (cosignerData) => {
    if (!cosignerData) {
      throw new Error('Invalid data');
    }
    const { keyDescriptor, keyAES } = JSON.parse(cosignerData);
    const hw = setupKeeperSigner(keyDescriptor);
    handleCoSignerAddition(hw, keyDescriptor, keyAES);
    return true;
  };

  const onNFCTap = async () => {
    try {
      if (Platform.OS === 'android') {
        setNfcModal(true);
      }
      const records = await NFC.read([NfcTech.Ndef]);
      const cosignerData = records[0]?.data;
      createCosignerFromNFC(cosignerData);
    } catch (error) {
      if (error.toString() === 'Error') {
        console.log('NFC interaction cancelled');
        return;
      }
      handleError(error, 'NFC');
    }
  };

  useEffect(() => {
    if (isAndroid) {
      if (nfcModal) {
        NFC.startTagSession({ session, content: '', writable: true });
      } else {
        NFC.stopTagSession(session);
      }
    }
    return () => {
      nfcManager.cancelTechnologyRequest();
    };
  }, [nfcModal]);

  useEffect(() => {
    const unsubConnect = session.on(HCESession.Events.HCE_STATE_WRITE_FULL, () => {
      try {
        // content written from iOS to android
        const data = idx(session, (_) => _.application.content.content);
        if (!data) {
          showToast('Please scan a valid co-signer', <ToastErrorIcon />);
          return;
        }
        createCosignerFromNFC(data);
      } catch (err) {
        captureError(err);
        showToast('Something went wrong.', <ToastErrorIcon />);
      } finally {
        setNfcModal(false);
      }
    });
    const unsubDisconnect = session.on(HCESession.Events.HCE_STATE_DISCONNECTED, () => {
      setNfcModal(false);
    });
    return () => {
      unsubConnect();
      unsubDisconnect();
      NFC.stopTagSession(session);
    };
  }, [session]);

  const onFileExtract = async (fileData) => {
    try {
      const { keyDescriptor, keyAES } = JSON.parse(fileData);
      const hw = setupKeeperSigner(keyDescriptor);
      handleCoSignerAddition(hw, keyDescriptor, keyAES);
    } catch (error) {
      handleError(error, 'File');
    }
  };

  const { signers } = useSigners();
  const myAppKeys = signers.filter(
    (signer) => !signer.hidden && signer.type === SignerType.MY_KEEPER
  );
  const myAppKeyCount = myAppKeys.length;

  const initializeCollabSession = (signer: Signer) => {
    const existingSigner = collaborativeSession.signers[signer.masterFingerprint];

    if (!existingSigner) {
      dispatch(
        setCollaborativeSessionSigners({
          [signer.masterFingerprint]: {
            keyDescriptor: fetchKeyExpression(signer),
            keyAES: generateAESKey(32),
          },
        })
      );
    }
  };

  useEffect(() => {
    if (!coSigners[0]) {
      setTimeout(() => {
        const updatedSigners = coSigners.map((item, index) => {
          if (index === 0 && myAppKeyCount > 0) {
            const signer: Signer = myAppKeys[myAppKeyCount - 1];
            const msXpub: signerXpubs[XpubTypes.P2WSH][0] = signer.signerXpubs[XpubTypes.P2WSH][0];
            const appKey: VaultSigner = {
              ...msXpub,
              masterFingerprint: signer.masterFingerprint,
              xfp: WalletUtilities.getFingerprintFromExtendedKey(
                msXpub.xpub,
                WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
              ),
            };
            setMyKey(appKey);
            setMySigner(signer);
            initializeCollabSession(signer);
            return appKey;
          }
        });
        setCoSigners(updatedSigners);
      }, 200);
    }
    return () => {
      dispatch(resetVaultFlags());
      dispatch(resetRealyVaultState());
    };
  }, [selectedSigner]);

  useEffect(() => {
    const signersCount = coSigners.filter((signer) => !!signer).length;
    if (signersCount === COLLABORATIVE_SCHEME.n && !externalKeyAddedModal && addedKey) {
      setAddedKey(null);
      createVault();
    }
  }, [externalKeyAddedModal, coSigners, addedKey]);

  useEffect(() => {
    if (
      hasNewVaultGenerationSucceeded &&
      coSigners.filter((item) => !!item).length === COLLABORATIVE_SCHEME.n &&
      coSigners.filter((item) => item)?.length > 2
    ) {
      const generatedVaultId = generateVaultId(coSigners, COLLABORATIVE_SCHEME);
      const collabWallet = allVaults.find((vault) => vault.id === generatedVaultId);
      setCollaborativeVault(collabWallet);
      setIsCreating(false);
      setWalletCreatedModal(true);
    }
  }, [hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed, coSigners]);

  const navigateToNextScreen = () => {
    if (
      hasNewVaultGenerationSucceeded &&
      coSigners.filter((item) => !!item).length === COLLABORATIVE_SCHEME.n
    ) {
      setIsCreating(false);
      const generatedVaultId = generateVaultId(coSigners, COLLABORATIVE_SCHEME);
      const navigationState = generatedVaultId
        ? {
            index: 1,
            routes: [
              { name: 'Home' },
              { name: 'VaultDetails', params: { vaultId: generatedVaultId } },
            ],
          }
        : {
            index: 1,
            routes: [{ name: 'Home' }],
          };
      navigation.dispatch(CommonActions.reset(navigationState));
      setWalletCreatedModal(false);
      dispatch(resetVaultFlags());
      dispatch(resetRealyVaultState());
    }
    if (hasNewVaultGenerationFailed) {
      setIsCreating(false);
      showToast(wallet.CollabWalletError, <ToastErrorIcon />);
      captureError(error);
    }
  };

  const renderSigner = ({ item, index }) => (
    <SignerItem
      vaultKey={item}
      index={index}
      signerMap={signerMap}
      setAddKeyModal={setAddKeyModal}
      coSigners={coSigners}
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
          name: `${common.collaborativeWallet} ${collaborativeWallets.length + 1}`,
          description: wallet.Desc2of3,
        },
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
      {inProgress || (isCreating && <ActivityIndicatorView visible={inProgress || isCreating} />)}
      <KeeperHeader
        title={vaultText.collaborativeVaultTitle}
        subtitle={vaultText.collaborativeVaultSubtitle}
        learnMore
        learnBackgroundColor={`${colorMode}.brownBackground`}
        learnMoreBorderColor={`${colorMode}.brownBackground`}
        learnMorePressed={() => {
          setLearnMoreModal(true);
        }}
        learnTextColor={`${colorMode}.buttonText`}
      />
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
      {Object.keys(collaborativeSession.signers).length > 1 ? null : (
        <Box style={styles.buttonContainer}>
          <Buttons
            fullWidth
            primaryText={vaultText.shareContactDetails}
            primaryCallback={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'ContactDetails',
                  params: { signerData: myKey, setActivateFetcher },
                })
              );
            }}
          />
        </Box>
      )}
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title={vaultText.collabVaultCreateSuccessTitle}
        subTitle={`${common.your} ${collaborativeVault?.scheme?.m}-${common.of}-${collaborativeVault?.scheme?.n} ${vaultText.vaultHasBeenCreated}`}
        buttonText={vaultText.ViewVault}
        buttonCallback={() => {
          navigateToNextScreen();

          // clear the collaborative session states(redux)
          // can also clean the collab keys from realm here if required
          setActivateFetcher(false);
          dispatch(resetCollaborativeSession());
        }}
        walletType={collaborativeVault?.type}
        walletName={collaborativeVault?.presentationData?.name}
        walletDescription={collaborativeVault?.presentationData?.description}
      />
      <CollaborativeModals
        addKeyModal={addKeyModal}
        setAddKeyModal={setAddKeyModal}
        learnMoreModal={learnMoreModal}
        setLearnMoreModal={setLearnMoreModal}
        addKeyOptions={addKeyOptions}
        nfcModal={nfcModal}
        setNfcModal={setNfcModal}
        keyAddedModal={realySignersAdded && externalKeyAddedModal}
        setKeyAddedModal={setExternalKeyAddedModal}
        signer={addedKey}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  signerCard: {
    width: windowWidth / 3 - windowWidth * 0.062,
    height: wp(157),
    marginRight: wp(8),
  },
  buttonContainer: {
    paddingHorizontal: wp(10),
  },
  cardDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(10),
  },
});

export default SetupCollaborativeWallet;
