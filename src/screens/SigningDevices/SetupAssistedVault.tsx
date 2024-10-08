import { StyleSheet } from 'react-native';
import { Box, FlatList, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Signer, VaultScheme, VaultSigner } from 'src/services/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import { getSignerNameFromType } from 'src/hardware';
import { MultisigScriptType, NetworkType, SignerType, VaultType } from 'src/services/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { captureError } from 'src/services/sentry';
import { useAppSelector } from 'src/store/hooks';
import { resetVaultFlags } from 'src/store/reducers/vaults';
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import useSignerMap from 'src/hooks/useSignerMap';
import { generateVaultId } from 'src/services/wallets/factories/VaultFactory';
import WalletVaultCreationModal from 'src/components/Modal/WalletVaultCreationModal';
import useVault from 'src/hooks/useVault';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { SETUPASSISTEDVAULT } from 'src/navigation/contants';
import AssistedVaultIcon from 'src/assets/images/assisted-vault-white-icon.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import useAssistedWallet from 'src/hooks/useAssistedWallet';
import HorizontalAddCard from 'src/components/HorizontalAddCard';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';
import {
  ASSISTED_VAULT_TIMELOCKS,
  ASSISTED_VAULT_TIMELOCKS_TESTNET,
  generateAssistedVaultElements,
} from 'src/services/wallets/operations/miniscript/default/AssistedVault';
import config from 'src/utils/service-utilities/config';
import WalletUtilities from 'src/services/wallets/operations/utils';
import HorizontalSignerCard from '../AddSigner/HorizontalSignerCard';
import { SDIcons } from '../Vault/SigningDeviceIcons';

function SignerItem({
  vaultKey,
  index,
  signerMap,
  setSelectedSigner,
  assistedVaultScheme,
  coSigners,
}: {
  vaultKey: VaultSigner | undefined;
  index: number;
  signerMap: { [key: string]: Signer };
  setSelectedSigner: (vaultKeys: VaultSigner[], index: number) => void;
  assistedVaultScheme: object;
  coSigners: any;
}) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const signer = vaultKey ? signerMap[vaultKey.masterFingerprint] : null;

  const { translations } = useContext(LocalizationContext);
  const { wallet, common } = translations;

  const advisorKeyCallback = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddSigningDevice',
        params: {
          parentScreen: SETUPASSISTEDVAULT,
          scheme: assistedVaultScheme,
          signerFilters: [SignerType.KEEPER],
          coSigners,
          onGoBack: (vaultKeys) => setSelectedSigner(vaultKeys, index),
        },
      })
    );
  };

  const userKeyCallback = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AddSigningDevice',
        params: {
          parentScreen: SETUPASSISTEDVAULT,
          scheme: assistedVaultScheme,
          signerFilters: [SignerType.MY_KEEPER],
          coSigners,
          onGoBack: (vaultKeys) => setSelectedSigner(vaultKeys, index),
        },
      })
    );
  };

  if (!signer || !vaultKey) {
    const cardName = index === 0 ? 'Add User Key' : `${common.add} ${common.Advisor} ${index}`;
    const cardCallback = index === 0 ? userKeyCallback : advisorKeyCallback;

    return (
      <Box>
        {index === 0 && (
          <Text color={`${colorMode}.primaryText`} medium style={styles.title}>
            {wallet.addUserKeyTitle}
          </Text>
        )}
        {index === 1 && (
          <Text color={`${colorMode}.primaryText`} medium style={styles.title}>
            {wallet.addAdvisorKeyTitle}
          </Text>
        )}

        <HorizontalAddCard
          name={cardName}
          cardStyles={styles.addCard}
          iconWidth={30}
          iconHeight={hp(30)}
          callback={cardCallback}
        />
      </Box>
    );
  }

  return (
    <Box>
      {index === 0 && (
        <Text color={`${colorMode}.primaryText`} medium style={styles.title}>
          Add your key to the wallet
        </Text>
      )}
      {index === 1 && (
        <Text color={`${colorMode}.primaryText`} medium style={styles.title}>
          Add two advisor keys to your wallet
        </Text>
      )}

      <Box style={styles.signerCard}>
        <HorizontalSignerCard
          key={signer.masterFingerprint}
          name={getSignerNameFromType(signer.type, signer.isMock, false)}
          description={`${common.added} ${moment(signer.addedOn).calendar()}`}
          icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
          isSelected={false}
          showSelection={false}
          changeKey={index === 0 ? userKeyCallback : advisorKeyCallback}
          colorMode={colorMode}
        />
      </Box>
    </Box>
  );
}

function SetupAssistedVault() {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { allVaults } = useVault({ includeArchived: false });
  const { hasNewVaultGenerationSucceeded, hasNewVaultGenerationFailed, error } = useAppSelector(
    (state) => state.vault
  );

  const [assistedVaultScheme, setAssistedVaultScheme] = useState<VaultScheme>({
    m: 2,
    n: 3,
  });
  const [userKey, setUserKey] = useState<VaultSigner | null>(null);
  const [advisorKeys, setAdvisorKeys] = useState<VaultSigner[]>(
    new Array(assistedVaultScheme.n - 1).fill(null)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [walletCreatedModal, setWalletCreatedModal] = useState(false);
  const [walletType, setWalletType] = useState('');
  const [walletName, setWalletName] = useState('');
  const [walletDescription, setWalletDescription] = useState('');
  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);
  const { showToast } = useToastMessage();
  const { assistedWallets } = useAssistedWallet();
  const { signerMap } = useSignerMap();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet, signer } = translations;

  const handleSignerSelected = (vaultKeys, index) => {
    if (index === 0) {
      const newKey = vaultKeys[0];
      if (userKey && userKey.masterFingerprint === newKey.masterFingerprint) {
        showToast(signer.coSignerAlreadyAdded, <ToastErrorIcon />);
      } else {
        setUserKey(newKey);
      }
    } else {
      setAdvisorKeys((prevAdvisorKeys) => {
        const newSigners = [...prevAdvisorKeys];
        const newKey = vaultKeys[0];
        const existingIndex = newSigners.findIndex(
          (signer) => signer && signer.masterFingerprint === newKey.masterFingerprint
        );
        if (existingIndex !== -1) {
          showToast(signer.coSignerAlreadyAdded, <ToastErrorIcon />);
          return prevAdvisorKeys;
        } else {
          newSigners[index - 1] = newKey;
        }
        return newSigners;
      });
    }
  };

  useEffect(() => {
    // should bind with a refresher in case the auto fetch for block-height fails
    WalletUtilities.fetchCurrentBlockHeight()
      .then(({ currentBlockHeight }) => {
        setCurrentBlockHeight(currentBlockHeight);
      })
      .catch((err) => showToast(err));
  }, []);

  const createVault = useCallback(() => {
    try {
      setIsCreating(true);

      const multisigScriptType = MultisigScriptType.MINISCRIPT_MULTISIG;
      if (!currentBlockHeight) {
        showToast('Failed to sync current block height');
        return;
      }
      const assistedVaultSigners = [userKey, advisorKeys[0], advisorKeys[1]];

      const T1 =
        config.NETWORK_TYPE === NetworkType.MAINNET
          ? ASSISTED_VAULT_TIMELOCKS.T1
          : ASSISTED_VAULT_TIMELOCKS_TESTNET.T1;
      const T2 =
        config.NETWORK_TYPE === NetworkType.MAINNET
          ? ASSISTED_VAULT_TIMELOCKS.T2
          : ASSISTED_VAULT_TIMELOCKS_TESTNET.T2;
      const timelocks = [currentBlockHeight + T1, currentBlockHeight + T2];
      const miniscriptElements = generateAssistedVaultElements(assistedVaultSigners, timelocks);
      const vaultScheme: VaultScheme = {
        ...assistedVaultScheme,
        multisigScriptType,
      };

      const vaultInfo: NewVaultInfo = {
        vaultType: VaultType.ASSISTED,
        vaultScheme,
        vaultSigners: assistedVaultSigners,
        miniscriptElements,
        vaultDetails: {
          name: `${common.AssistedWallet} ${assistedWallets.length + 1}`,
          description: '',
        },
      };

      dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      setAssistedVaultScheme(vaultScheme);

      return vaultInfo;
    } catch (err) {
      captureError(err);
      return false;
    }
  }, [userKey, advisorKeys, currentBlockHeight]);

  useEffect(() => {
    if (
      hasNewVaultGenerationSucceeded &&
      [userKey, ...advisorKeys.filter((item) => !!item)].length === assistedVaultScheme.n &&
      advisorKeys.filter((item) => item)?.length > 1
    ) {
      const combinedSigners = [userKey, ...advisorKeys.filter((item) => !!item)];
      const generatedVaultId = generateVaultId(combinedSigners, assistedVaultScheme);
      const collabWallet = allVaults.find((vault) => vault.id === generatedVaultId);
      setWalletType(collabWallet && collabWallet.type);
      setWalletName(collabWallet && collabWallet.presentationData.name);
      setWalletDescription(collabWallet && collabWallet.presentationData.description);
      setWalletCreatedModal(true);
    }
  }, [
    hasNewVaultGenerationSucceeded,
    hasNewVaultGenerationFailed,
    userKey,
    advisorKeys,
    assistedVaultScheme,
  ]);

  const navigateToNextScreen = () => {
    if (
      hasNewVaultGenerationSucceeded &&
      [userKey || null, ...advisorKeys.filter((item) => !!item)].length === assistedVaultScheme.n
    ) {
      setIsCreating(false);
      const combinedSigners = [
        ...(userKey ? [userKey] : []),
        ...advisorKeys.filter((item) => !!item),
      ];
      const generatedVaultId = generateVaultId(combinedSigners, assistedVaultScheme);
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
      assistedVaultScheme={assistedVaultScheme}
      signerMap={signerMap}
      setSelectedSigner={handleSignerSelected}
      coSigners={index === 0 ? (userKey ? [userKey] : []) : advisorKeys}
    />
  );

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        icon={
          <HexagonIcon
            backgroundColor={Colors.pantoneGreen}
            width={wp(43)}
            height={hp(38)}
            icon={<AssistedVaultIcon width={wp(23)} height={hp(27)} />}
          />
        }
        title={signer.addKeys}
        subtitle={wallet.assistedVaultHeaderSubtitle}
      />
      <FlatList
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        data={[userKey, ...advisorKeys]}
        keyExtractor={(item, index) => item?.xfp ?? index.toString()}
        renderItem={renderSigner}
        contentContainerStyle={{
          paddingHorizontal: wp(10),
        }}
        style={{
          marginTop: hp(52),
        }}
      />

      <Box style={styles.buttonContainer}>
        <Buttons
          primaryText={common.create}
          primaryCallback={createVault}
          primaryLoading={isCreating}
          primaryDisable={[userKey, ...advisorKeys.filter((item) => !!item)].length < 3}
          paddingHorizontal={wp(136)}
        />
      </Box>
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title={wallet.WalletCreated}
        subTitle={wallet.CollaborativeWalletSubtitle}
        buttonText={wallet.ViewWallet}
        descriptionMessage={wallet.CollaborativeWalletDesc}
        buttonCallback={navigateToNextScreen}
        walletType={walletType}
        walletName={walletName}
        walletDescription={walletDescription}
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
    height: hp(100),
    alignItems: 'center',
    marginBottom: hp(10),
  },
  signerCard: {
    alignItems: 'center',
    marginBottom: hp(15),
  },
  bitcoinIllustration: {
    alignSelf: 'center',
  },
  addCoSigner: {
    letterSpacing: 0.13,
    lineHeight: 18,
    width: wp(295),
  },
  title: {
    marginBottom: hp(15),
    marginTop: hp(10),
    lineHeight: 24,
    fontSize: 15,
  },
  buttonContainer: {
    alignItems: 'center',
  },
});

export default SetupAssistedVault;
