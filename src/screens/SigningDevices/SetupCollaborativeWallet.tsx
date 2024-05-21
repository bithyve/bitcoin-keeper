import { StyleSheet } from 'react-native';
import { FlatList, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Signer, VaultSigner, signerXpubs } from 'src/services/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { crossInteractionHandler, getPlaceholder } from 'src/utils/utilities';
import {
  extractKeyFromDescriptor,
  generateSignerFromMetaData,
  getSignerNameFromType,
} from 'src/hardware';
import { SignerStorage, SignerType, VaultType, XpubTypes } from 'src/services/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault, addSigningDevice } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { useAppSelector } from 'src/store/hooks';
import useCollaborativeWallet from 'src/hooks/useCollaborativeWallet';
import { resetVaultFlags } from 'src/store/reducers/vaults';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import FloatingCTA from 'src/components/FloatingCTA';
import useSignerMap from 'src/hooks/useSignerMap';
import AddCard from 'src/components/AddCard';
import useSigners from 'src/hooks/useSigners';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import SignerCard from '../AddSigner/SignerCard';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import WalletVaultCreationModal from 'src/components/Modal/WalletVaultCreationModal';
import useVault from 'src/hooks/useVault';
import KeeperModal from 'src/components/KeeperModal';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BitcoinIllustration from '../../assets/images/btc-illustration.svg';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import { setCosginerModal } from 'src/store/reducers/wallets';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';

function AddCoSignerContent() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet } = translations;
  return (
    <Box style={{ gap: 20 }}>
      <Text color={`${colorMode}.modalGreenContent`} style={styles.addCoSigner}>
        {wallet.addCoSignerDesc}
      </Text>
      <Box style={styles.bitcoinIllustration}>
        <BitcoinIllustration />
      </Box>
      <Text color={`${colorMode}.modalGreenContent`} style={styles.addCoSigner}>
        {wallet.addCoSignerDescTwo}
      </Text>
    </Box>
  );
}

function SignerItem({
  vaultKey,
  index,
  onQRScan,
  signerMap,
}: {
  vaultKey: VaultSigner | undefined;
  index: number;
  onQRScan: any;
  signerMap: { [key: string]: Signer };
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const signer = vaultKey ? signerMap[vaultKey.masterFingerprint] : null;
  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslations } = translations;

  const navigateToAddQrBasedSigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ScanQR',
        params: {
          title: signerTranslations.addCoSigner,
          subtitle: signerTranslations.scanQRMessage,
          onQrScan: onQRScan,
          setup: true,
          type: SignerType.KEEPER,
          isHealthcheck: true,
          signer,
          disableMockFlow: true,
          learnMore: true,
          learnMoreContent: AddCoSignerContent,
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
        name={
          index === 0 ? signerTranslations.addingYourKey : `Add ${getPlaceholder(index)} cosigner`
        }
        cardStyles={styles.addCard}
        callback={callback}
        loading={index === 0}
      />
    );
  }

  return (
    <SignerCard
      key={signer.masterFingerprint}
      name={getSignerNameFromType(signer.type, signer.isMock, false)}
      description={`Added ${moment(signer.addedOn).calendar()}`}
      icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
      isSelected={false}
      showSelection={index === 0}
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
  const [walletType, setWalletType] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const { showToast } = useToastMessage();
  const { collaborativeWallets } = useCollaborativeWallet();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const cosignerModal = useAppSelector((state) => state.wallet.cosignerModal) || false;
  const { common, signer: signerTranslations, wallet } = translations;
  const [keyAddedModal, setKeyAddedModal] = useState(false);
  const [lastAddedSigner, setLastAddedSigner] = useState<VaultSigner | null>(null);

  const pushSigner = (
    xpub,
    derivationPath,
    masterFingerprint,
    resetQR,
    xpriv = '',
    goBack = true,
    mine = false
  ) => {
    try {
      // duplicate check
      if (coSigners.find((item) => item && item.xpub === xpub)) {
        showToast(signerTranslations.cosignerExistsMessage, <ToastErrorIcon />);
        resetQR();
        return;
      }

      // only use one of my mobile keys
      if (signerMap[masterFingerprint]?.type === SignerType.MY_KEEPER) {
        showToast(signerTranslations.selfMobileKeyError, <ToastErrorIcon />);
        resetQR();
        return;
      }
      const { key, signer } = generateSignerFromMetaData({
        xpub,
        derivationPath,
        masterFingerprint,
        xpriv,
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
      setKeyAddedModal(true);
      setCoSigners(newSigners);
      setLastAddedSigner(key);
      if (goBack) navigation.goBack();
    } catch (err) {
      console.log(err);
      const message = crossInteractionHandler(err);
      showToast(message, <ToastErrorIcon />);
    }
  };

  const { signers } = useSigners();
  const myAppKeys = signers.filter((signer) => signer.type === SignerType.MY_KEEPER);
  const myAppKeyCount = myAppKeys.length;

  useEffect(() => {
    if (!coSigners[0]) {
      setTimeout(() => {
        const updatedSigners = coSigners.map((item, index) => {
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
  }, []);

  useEffect(() => {
    if (
      hasNewVaultGenerationSucceeded &&
      coSigners.filter((item) => !!item).length === COLLABORATIVE_SCHEME.n &&
      coSigners.filter((item) => item)?.length > 2
    ) {
      const generatedVaultId = generateVaultId(coSigners, COLLABORATIVE_SCHEME);
      const collabWallet = allVaults.find((vault) => vault.id === generatedVaultId);
      setWalletType(collabWallet && collabWallet.type);
      setWalletName(collabWallet && collabWallet.presentationData.name);
      setWalletDescription(collabWallet && collabWallet.presentationData.description);
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
      showToast(wallet.creationError, <ToastErrorIcon />);
      captureError(error);
    }
  };

  const renderSigner = ({ item, index }) => (
    <SignerItem
      vaultKey={item}
      index={index}
      onQRScan={(data, resetQR) => {
        const { xpub, masterFingerprint, derivationPath } = extractKeyFromDescriptor(data);
        pushSigner(xpub, derivationPath, masterFingerprint, resetQR, '');
      }}
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
          name: `${wallet.collaborativeWallet} ${collaborativeWallets.length + 1}`,
          description: wallet.multiSig,
        },
      };
      dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      return vaultInfo;
    } catch (err) {
      captureError(err);
      return false;
    }
  }, [coSigners]);

  function ModalCard({ title, subTitle, icon = null }) {
    const { colorMode } = useColorMode();
    return (
      <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.cardContainer}>
        <Box style={styles.iconContainer}>
          <HexagonIcon
            width={wp(42.5)}
            height={hp(38)}
            icon={icon}
            backgroundColor={colorMode == 'dark' ? Colors.ForestGreenDark : Colors.pantoneGreen}
          />
        </Box>
        <Box style={styles.textContainer}>
          <Text style={styles.titleText} color={`${colorMode}.headerText`}>
            {title}
          </Text>
          <Text style={styles.subTitleText} color={`${colorMode}.GreyText`}>
            {subTitle}
          </Text>
        </Box>
      </Box>
    );
  }

  const renderLastAddedSignerModal = () => {
    if (!lastAddedSigner) return null;

    const signer = signerMap[lastAddedSigner.masterFingerprint];
    if (!signer) return null;

    return (
      <KeeperModal
        visible={keyAddedModal}
        close={() => setKeyAddedModal(false)}
        title={signerTranslations.signerAddedSuccessMessage}
        subTitle={signerTranslations.signerAvailableMessage}
        showCloseIcon={false}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        Content={() => (
          <ModalCard
            title={signer.signerName}
            subTitle={`Added ${moment(signer.addedOn).calendar()}`}
            icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
          />
        )}
        buttonText={signerTranslations.signerDeatils}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonCallback={() => {
          setKeyAddedModal(false);
          navigation.dispatch(CommonActions.navigate('ManageSigners'));
        }}
      />
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={signerTranslations.addSigners}
        subtitle={wallet.collaborativeWallet2_3Created}
        learnMore
        learnMorePressed={() => dispatch(setCosginerModal(true))}
        learnTextColor={`${colorMode}.white`}
      />
      <FlatList
        horizontal
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        data={coSigners}
        keyExtractor={(item, index) => (item && item.xfp ? item.xfp : `placeholder-${index}`)}
        renderItem={renderSigner}
        style={{
          marginTop: hp(52),
        }}
      />

      <FloatingCTA
        primaryText={common.create}
        primaryCallback={createVault}
        secondaryText={common.cancel}
        primaryLoading={isCreating}
        primaryDisable={coSigners.filter((item) => item)?.length < 2}
      />
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title={wallet.walletCreatedSuccessMessage}
        subTitle={wallet.coWalletCreatedSubTitle}
        buttonText={wallet.ViewWallet}
        descriptionMessage={wallet.coWalletCreatedDesc}
        buttonCallback={() => {
          navigateToNextScreen();
        }}
        walletType={walletType}
        walletName={walletName}
        walletDescription={walletDescription}
      />
      <KeeperModal
        visible={cosignerModal}
        close={() => {
          dispatch(setCosginerModal(false));
        }}
        title={signerTranslations.addCoSigner}
        subTitle={''}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={AddCoSignerContent}
        learnMore
        learnMoreCallback={() =>
          dispatch(goToConcierge([ConciergeTag.COLLABORATIVE_Wallet], 'add-signers'))
        }
        learnMoreTitle={common.needMoreHelp}
        buttonCallback={() => {
          dispatch(setCosginerModal(false));
        }}
        buttonBackground={`${colorMode}.modalWhiteButton`}
      />
      {renderLastAddedSignerModal()}
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
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
  bitcoinIllustration: {
    alignSelf: 'center',
  },
  addCoSigner: {
    letterSpacing: 0.13,
    lineHeight: 18,
    width: wp(295),
  },
  cardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    minHeight: hp(70),
    marginBottom: hp(35),
    marginTop: hp(20),
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
    fontWeight: '400',
  },
  iconContainer: {
    marginHorizontal: 10,
  },
  textContainer: {},
  descText: {
    fontSize: 13,
    letterSpacing: 0.13,
    fontWeight: '400',
    marginBottom: hp(20),
  },
});

export default SetupCollaborativeWallet;
