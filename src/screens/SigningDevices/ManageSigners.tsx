import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import useSigners from 'src/hooks/useSigners';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { hp, windowWidth } from 'src/constants/responsive';
import AddCard from 'src/components/AddCard';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import { UNVERIFYING_SIGNERS, getSignerDescription, getSignerNameFromType } from 'src/hardware';
import SignerIcon from 'src/assets/images/signer_brown.svg';
import useVault from 'src/hooks/useVault';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { NetworkType, SignerStorage, SignerType } from 'src/services/wallets/enums';
import config from 'src/utils/service-utilities/config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import SettingIcon from 'src/assets/images/settings.svg';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';
import useSubscriptionLevel from 'src/hooks/useSubscriptionLevel';
import SignerCard from '../AddSigner/SignerCard';
import KeyAddedModal from 'src/components/KeyAddedModal';
import KeeperModal from 'src/components/KeeperModal';
import Note from 'src/components/Note/Note';
import CountdownTimer from 'src/components/Timer/CountDownTimer';
import Buttons from 'src/components/Buttons';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'ManageSigners'>;

function ManageSigners({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId = '', addedSigner, addSignerFlow, showModal } = route.params || {};
  const { activeVault } = useVault({ vaultId });
  const { signers: vaultKeys } = activeVault || { signers: [] };
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();
  const { realySignersUpdateErrorMessage } = useAppSelector((state) => state.bhr);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const [keyAddedModalVisible, setKeyAddedModalVisible] = useState(false);
  const [timerModal, setTimerModal] = useState(false);
  const [timerExpiredModal, setTimerExpiredModal] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);

  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslation } = translations;

  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.SIGNING_DEVICES_HEALTH_CHECK],
  });

  useEffect(() => {
    if (showModal) {
      setKeyAddedModalVisible(true);
    }
  }, [showModal]);

  useEffect(() => {
    if (realySignersUpdateErrorMessage) {
      showToast(realySignersUpdateErrorMessage, null, IToastCategory.SIGNING_DEVICE);
      dispatch(resetSignersUpdateState());
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [realySignersUpdateErrorMessage]);

  const handleTimerEnd = () => {
    setIsTimerActive(false);
  };

  const handleCardSelect = (signer, item) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signerId: signer.masterFingerprint,
        vaultId,
        vaultKey: vaultKeys.length ? item : undefined,
        vaultSigners: vaultKeys,
      })
    );
  };

  const handleAddSigner = () => {
    navigation.dispatch(CommonActions.navigate('SigningDeviceList', { addSignerFlow: true }));
  };

  const { top } = useSafeAreaInsets();

  const navigateToSettings = () => {
    navigation.dispatch(CommonActions.navigate('SignerSettings'));
  };

  const handleModalClose = () => {
    setKeyAddedModalVisible(false);
    navigation.dispatch(CommonActions.setParams({ showModal: false }));
  };

  return (
    <Box
      backgroundColor={`${colorMode}.BrownNeedHelp`}
      style={[styles.wrapper, { paddingTop: top }]}
    >
      <Box style={styles.topSection}>
        <KeeperHeader
          title={signerTranslation.ManageKeys}
          subtitle={signerTranslation.ViewAndChangeKeyDetails}
          mediumTitle
          titleColor={`${colorMode}.seashellWhite`}
          subTitleColor={`${colorMode}.seashellWhite`}
          rightComponent={
            <TouchableOpacity onPress={navigateToSettings} testID="btn_manage_singner_setting">
              <SettingIcon />
            </TouchableOpacity>
          }
          icon={
            <CircleIconWrapper
              backgroundColor={`${colorMode}.seashellWhite`}
              icon={<SignerIcon />}
            />
          }
          contrastScreen
        />
      </Box>
      <Box style={styles.signersContainer} backgroundColor={`${colorMode}.primaryBackground`}>
        <SignersList
          colorMode={colorMode}
          vaultKeys={vaultKeys}
          signers={signers}
          signerMap={signerMap}
          handleCardSelect={handleCardSelect}
          handleAddSigner={handleAddSigner}
          vault={activeVault}
          typeBasedIndicator={typeBasedIndicator}
        />
      </Box>
      <KeeperModal
        title={signerTranslation.keyReceived}
        subTitle={signerTranslation.keyReceiveMessage}
        DarkCloseIcon={colorMode === 'dark'}
        close={() => setTimerModal(false)}
        visible={timerModal}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.modalGreenButton`}
        secButtonTextColor={`${colorMode}.modalGreenButton`}
        buttonText={signerTranslation.addKey}
        secondaryButtonText={signerTranslation.reject}
        Content={() => (
          <Box style={styles.modalContent}>
            <Box style={styles.timerWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <CountdownTimer initialTime={30} onTimerEnd={handleTimerEnd} />
            </Box>
            <Note subtitle={signerTranslation.remoteKeyReceiveNote} />
          </Box>
        )}
      />
      <KeeperModal
        title={signerTranslation.keyExpired}
        subTitle={signerTranslation.keyExpireMessage}
        DarkCloseIcon={colorMode === 'dark'}
        close={() => setTimerExpiredModal(false)}
        visible={timerExpiredModal}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonTextColor={`${colorMode}.white`}
        Content={() => (
          <Box>
            <Box style={styles.timerWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <CountdownTimer initialTime={0} />
            </Box>
            <Buttons primaryText={signerTranslation.acceptKey} primaryDisable />
          </Box>
        )}
      />
      <KeyAddedModal visible={keyAddedModalVisible} close={handleModalClose} signer={addedSigner} />
    </Box>
  );
}

function SignersList({
  colorMode,
  vaultKeys,
  signers,
  signerMap,
  handleCardSelect,
  handleAddSigner,
  vault,
  typeBasedIndicator,
}: {
  colorMode: string;
  vaultKeys: VaultSigner[];
  signers: Signer[];
  signerMap: Record<string, Signer>;
  handleCardSelect: (signer: Signer, item: VaultSigner) => void;
  handleAddSigner: () => void;
  vault: Vault;
  typeBasedIndicator: Record<string, Record<string, boolean>>;
}) {
  const list = vaultKeys.length ? vaultKeys : signers.filter((signer) => !signer.hidden);
  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslation } = translations;
  const { level } = useSubscriptionLevel();
  const { showToast } = useToastMessage();
  const isNonVaultManageSignerFlow = !vault; // Manage Signers flow accessible via home screen
  const shellKeys = [];

  const shellAssistedKeys = useMemo(() => {
    const generateShellAssistedKey = (signerType: SignerType) => ({
      type: signerType,
      storageType: SignerStorage.WARM,
      signerName: getSignerNameFromType(signerType, false, false),
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      masterFingerprint: Date.now().toString() + signerType,
      signerXpubs: {},
      hidden: false,
    });

    let hasSigningServer = false; // actual signing server present?
    let hasInheritanceKey = false; // actual inheritance key present?
    let isSigningServerShellCreated = false;
    let isInheritanceKeyShellCreated = false;

    if (shellKeys.filter((signer) => signer.type === SignerType.POLICY_SERVER).length > 0)
      isSigningServerShellCreated = true;

    if (shellKeys.filter((signer) => signer.type === SignerType.INHERITANCEKEY).length > 0)
      isInheritanceKeyShellCreated = true;

    for (const signer of signers) {
      if (signer.type === SignerType.POLICY_SERVER) hasSigningServer = true;
      else if (signer.type === SignerType.INHERITANCEKEY) hasInheritanceKey = true;
    }

    if (!isSigningServerShellCreated && !hasSigningServer && level >= AppSubscriptionLevel.L2) {
      shellKeys.push(generateShellAssistedKey(SignerType.POLICY_SERVER));
    }

    if (!isInheritanceKeyShellCreated && !hasInheritanceKey && level >= AppSubscriptionLevel.L3) {
      shellKeys.push(generateShellAssistedKey(SignerType.INHERITANCEKEY));
    }

    return shellKeys;
  }, []);

  const renderAssistedKeysShell = () => {
    return shellAssistedKeys.map((shellSigner) => {
      const isAMF = false;
      return (
        <SignerCard
          key={shellSigner.masterFingerprint}
          onCardSelect={() => {
            showToast('Please add the key to a Vault in order to use it');
          }}
          name={getSignerNameFromType(shellSigner.type, shellSigner.isMock, isAMF)}
          description="Setup required"
          icon={SDIcons(shellSigner.type, colorMode !== 'dark').Icon}
          showSelection={false}
          showDot={true}
          isFullText
          colorVarient="green"
          colorMode={colorMode}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.topContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        style={styles.scrollMargin}
      >
        <Box style={styles.addedSignersContainer}>
          {list.map((item) => {
            const signer = vaultKeys.length ? signerMap[item.masterFingerprint] : item;
            if (signer.archived) {
              return null;
            }
            const isRegistered = vaultKeys.length
              ? item.registeredVaults.find((info) => info.vaultId === vault.id)
              : false;

            const showDot =
              (vaultKeys.length &&
                !UNVERIFYING_SIGNERS.includes(signer.type) &&
                !isRegistered &&
                !signer.isMock &&
                vault.isMultiSig) ||
              typeBasedIndicator?.[uaiType.SIGNING_DEVICES_HEALTH_CHECK]?.[item.masterFingerprint];

            const isAMF =
              signer.type === SignerType.TAPSIGNER &&
              config.NETWORK_TYPE === NetworkType.TESTNET &&
              !signer.isMock;

            return (
              <SignerCard
                key={signer.masterFingerprint}
                onCardSelect={() => {
                  handleCardSelect(signer, item);
                }}
                name={
                  !signer.isBIP85
                    ? getSignerNameFromType(signer.type, signer.isMock, isAMF)
                    : `${getSignerNameFromType(signer.type, signer.isMock, isAMF)} +`
                }
                description={getSignerDescription(signer)}
                icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
                image={signer?.extraData?.thumbnailPath}
                showSelection={false}
                showDot={showDot}
                isFullText
                colorVarient="green"
                colorMode={colorMode}
              />
            );
          })}
          {isNonVaultManageSignerFlow && renderAssistedKeysShell()}
          {!vaultKeys.length ? (
            <AddCard
              name={signerTranslation.addKey}
              cardStyles={styles.addCard}
              callback={handleAddSigner}
            />
          ) : null}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    marginBottom: 20,
  },
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  topSection: {
    height: '35%',
    paddingLeft: 10,
    paddingTop: 20,
  },
  signersContainer: {
    paddingHorizontal: '5%',
    flex: 1,
  },
  scrollContainer: {
    zIndex: 2,
    gap: 40,
    marginVertical: 30,
    paddingBottom: 30,
  },
  scrollMargin: {
    marginTop: '-30%',
  },
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addCard: {
    height: 125,
    width: windowWidth / 3 - windowWidth * 0.05,
    margin: 3,
  },
  warningText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
  modalContent: {
    marginBottom: hp(40),
  },
  timerWrapper: {
    width: '100%',
    borderRadius: 10,
    marginBottom: hp(30),
  },
});

export default Sentry.withErrorBoundary(ManageSigners, errorBourndaryOptions);
