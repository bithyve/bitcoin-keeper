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
import { getPlaceholder } from 'src/utils/utilities';
import { getSignerNameFromType } from 'src/hardware';
import { SignerType, VaultType, XpubTypes } from 'src/services/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault } from 'src/store/sagaActions/vaults';
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
import { SETUPCOLLABORATIVEWALLET } from 'src/navigation/contants';

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
  signerMap,
  setSelectedSigner,
  COLLABORATIVE_SCHEME,
  coSigners,
}: {
  vaultKey: VaultSigner | undefined;
  index: number;
  signerMap: { [key: string]: Signer };
  setSelectedSigner: any;
  COLLABORATIVE_SCHEME: object;
  coSigners: any;
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const signer = vaultKey ? signerMap[vaultKey.masterFingerprint] : null;
  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  const callback = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddSigningDevice',
        params: {
          parentScreen: SETUPCOLLABORATIVEWALLET,
          scheme: COLLABORATIVE_SCHEME,
          coSigners,
          onGoBack: (vaultKeys) => setSelectedSigner(vaultKeys),
        },
      })
    );
  };

  if (!signer || !vaultKey) {
    return (
      <AddCard
        name={
          index === 0
            ? wallet.AddingKey
            : `${common.add} ${getPlaceholder(index)} ${common.coSigner}`
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
      description={`${common.added} ${moment(signer.addedOn).calendar()}`}
      icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
      image={signer?.extraData?.thumbnailPath}
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
  const [walletType, setWalletType] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const { showToast } = useToastMessage();
  const { collaborativeWallets } = useCollaborativeWallet();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const cosignerModal = useAppSelector((state) => state.wallet.cosignerModal) || false;
  const { common, wallet, signer } = translations;
  const [selectedSigner, setSelectedSigner] = useState(null);

  const handleSelectedSigners = (vaultKeys) => {
    setCoSigners((prevCoSigners) => {
      let newSigners = [...prevCoSigners];
      const newKey = vaultKeys[0];
      const existingIndex = newSigners.findIndex(
        (signer) => signer && signer.masterFingerprint === newKey.masterFingerprint
      );
      if (existingIndex !== -1) {
        showToast(signer.coSignerAlreadyAdded, <ToastErrorIcon />);
        return prevCoSigners;
      } else {
        const nullIndex = newSigners.indexOf(null || undefined);
        if (nullIndex !== -1) {
          newSigners[nullIndex] = newKey;
        } else {
          newSigners.push(newKey);
        }
      }
      return newSigners;
    });
  };

  const { signers } = useSigners();
  const myAppKeys = signers.filter((signer) => signer.type === SignerType.MY_KEEPER);
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
      showToast(wallet.CollabWalletError, <ToastErrorIcon />);
      captureError(error);
    }
  };

  const renderSigner = ({ item, index }) => (
    <SignerItem
      vaultKey={item}
      index={index}
      COLLABORATIVE_SCHEME={COLLABORATIVE_SCHEME}
      signerMap={signerMap}
      setSelectedSigner={handleSelectedSigners}
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
      <KeeperHeader
        title={signer.addSigners}
        subtitle={wallet.CollaborativeWalletCreated}
        learnMore
        learnMorePressed={() => dispatch(setCosginerModal(true))}
        learnTextColor={`${colorMode}.white`}
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
      <FloatingCTA
        primaryText={common.create}
        primaryCallback={createVault}
        secondaryText={common.cancel}
        primaryLoading={isCreating}
        primaryDisable={coSigners.filter((item) => item)?.length < 2}
      />
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title={wallet.WalletCreated}
        subTitle={wallet.CollaborativeWalletSubtitle}
        buttonText={wallet.ViewWallet}
        descriptionMessage={wallet.CollaborativeWalletDesc}
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
        DarkCloseIcon={colorMode === 'dark' ? true : false}
        title={wallet.AddCoSigner}
        subTitle={''}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={AddCoSignerContent}
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
        secondaryCallback={() => {
          dispatch(setCosginerModal(false));
          dispatch(goToConcierge([ConciergeTag.COLLABORATIVE_Wallet], 'add-signers'));
        }}
        buttonCallback={() => {
          dispatch(setCosginerModal(false));
        }}
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
});

export default SetupCollaborativeWallet;
