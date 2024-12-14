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
import { addNewVault, addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { useAppSelector } from 'src/store/hooks';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetVaultFlags } from 'src/store/reducers/vaults';
import { resetRealyVaultState, resetSignersUpdateState } from 'src/store/reducers/bhr';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import SignerCard from '../AddSigner/SignerCard';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import WalletVaultCreationModal from 'src/components/Modal/WalletVaultCreationModal';
import useVault from 'src/hooks/useVault';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import QRCommsLight from 'src/assets/images/qr_comms.svg';
import NFCLight from 'src/assets/images/nfc-no-bg-light.svg';
import AirDropLight from 'src/assets/images/airdrop-no-bg-light.svg';
import SignerLight from 'src/assets/images/signer-icon-light.svg';
import AddKeyLight from 'src/assets/images/add-key-light.svg';
import { SETUPCOLLABORATIVEWALLET } from 'src/navigation/contants';
import CollaborativeModals from './components/CollaborativeModals';
import { setupKeeperSigner } from 'src/hardware/signerSetup';
import HWError from 'src/hardware/HWErrorState';
import KeyAddedModal from 'src/components/KeyAddedModal';
import NFC from 'src/services/nfc';
import { NfcTech } from 'react-native-nfc-manager';
import Buttons from 'src/components/Buttons';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';

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
  const cardDescription = isCardDisabled ? '' : common.tapToAdd;

  if (!signer || !vaultKey) {
    return (
      <SignerCard
        name={index === 0 ? wallet.AddingKey : `${numberToOrdinal(index + 1)} ${common.key}`}
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
        icon={<AddKeyLight />}
        disabled={isCardDisabled}
      />
    );
  }

  return (
    <SignerCard
      key={signerUID}
      name={getSignerNameFromType(signer.type, signer.isMock, false)}
      description={getSignerDescription(signer)}
      icon={SDIcons(signer.type).Icon}
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

function SetupCollaborativeWallet() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allVaults } = useVault({ includeArchived: false });
  const { hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed, error } = useAppSelector(
    (state) => state.vault
  );

  const COLLABORATIVE_SCHEME = { m: 2, n: 3 };
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
  const [inProgress, setInProgress] = useState(false);
  const [nfcModal, setNfcModal] = useState(false);
  const { relaySignersUpdateLoading, realySignersUpdateErrorMessage, realySignersAdded } =
    useAppSelector((state) => state.bhr);

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
              name: 'HandleFile',
              params: {
                title: vaultText.fileImport,
                subTitle: vaultText.importFileOrPaste,
                onFileExtract,
                ctaText: common.continue,
              },
            })
          );
      },
    },
    {
      icon: <SignerLight />,
      title: vaultText.chooseExistingKey,
      callback: () => {
        setAddKeyModal(false);
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AddSigningDevice',
            params: {
              parentScreen: SETUPCOLLABORATIVEWALLET,
              scheme: COLLABORATIVE_SCHEME,
              signerFilters: [SignerType.KEEPER],
              coSigners,
              onGoBack: (vaultKeys) => {
                if (vaultKeys && vaultKeys.length > 0) {
                  handleSelectedSigners(vaultKeys[0]);
                }
              },
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

  const handleCoSignerAddition = (hw, goBack = false) => {
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

    setExternalKeyAddedModal(true);
    {
      goBack && navigation.dispatch(CommonActions.goBack());
    }
  };

  const handleSelectedSigners = (vaultKey) => {
    if (!vaultKey) return;

    if (isSignerDuplicate(vaultKey, coSigners)) {
      showToast(vaultText.keyAlreadyAdded, <ToastErrorIcon />, IToastCategory.SIGNING_DEVICE);
      return;
    }

    setSelectedSigner(vaultKey);
    setCoSigners((prevCoSigners) => {
      const updatedSigners = [...prevCoSigners];
      const emptyIndex = updatedSigners.findIndex((signer) => !signer);
      if (emptyIndex !== -1) {
        updatedSigners[emptyIndex] = vaultKey;
      }
      return updatedSigners;
    });
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
      const hw = setupKeeperSigner(qrData);
      handleCoSignerAddition(hw, true);
    } catch (error) {
      handleError(error, 'QR');
    }
  };

  const onNFCTap = async () => {
    try {
      if (Platform.OS === 'android') {
        setNfcModal(true);
      }

      const records = await NFC.read([NfcTech.Ndef]);
      const cosigner = records[0]?.data;

      if (!cosigner) {
        throw new Error('Invalid data');
      }

      const hw = setupKeeperSigner(cosigner);
      handleCoSignerAddition(hw);
    } catch (error) {
      if (error.toString() === 'Error') {
        console.log('NFC interaction cancelled');
        return;
      }
      handleError(error, 'NFC');
    }
  };

  const onFileExtract = async (fileData) => {
    try {
      const hw = setupKeeperSigner(fileData);
      handleCoSignerAddition(hw);
    } catch (error) {
      handleError(error, 'File');
    }
  };

  const { signers } = useSigners();
  const myAppKeys = signers.filter(
    (signer) => !signer.hidden && signer.type === SignerType.MY_KEEPER
  );
  const myAppKeyCount = myAppKeys.length;

  useEffect(() => {
    if (!coSigners[0]) {
      setTimeout(() => {
        let updatedSigners = coSigners.map((item, index) => {
          if (index === 0 && myAppKeyCount > 0) {
            const signer = myAppKeys[myAppKeyCount - 1];
            const msXpub: signerXpubs[XpubTypes.P2WSH][0] = signer.signerXpubs[XpubTypes.P2WSH][0];
            const appKey = {
              ...msXpub,
              masterFingerprint: signer.masterFingerprint,
              xfp: WalletUtilities.getFingerprintFromExtendedKey(
                msXpub.xpub,
                WalletUtilities.getNetworkByType(config.NETWORK_TYPE)
              ),
            };
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
      {inProgress && <ActivityIndicatorView visible={inProgress} />}
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
      <Box style={styles.buttonContainer}>
        <Buttons
          fullWidth
          primaryText={vaultText.setupVault}
          primaryCallback={createVault}
          primaryLoading={isCreating}
          primaryDisable={coSigners.filter((item) => item)?.length <= 2}
        />
      </Box>
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title={vaultText.vaultCreatedSuccessTitle}
        subTitle={`${common.your} ${collaborativeVault?.scheme?.m}-${common.of}-${collaborativeVault?.scheme?.n} ${vaultText.vaultHasBeenCreated}`}
        descriptionMessage={vaultText.collabVaultCreatedDesc}
        buttonText={vaultText.ViewVault}
        buttonCallback={() => {
          navigateToNextScreen();
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
      />
      <KeyAddedModal
        visible={realySignersAdded && externalKeyAddedModal}
        close={() => {
          setExternalKeyAddedModal(false);
        }}
        signer={addedKey}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  signerCard: {
    width: windowWidth / 3 - windowWidth * 0.062,
    height: hp(157),
    marginRight: wp(8),
  },
  buttonContainer: {
    paddingHorizontal: wp(10),
  },
});

export default SetupCollaborativeWallet;
