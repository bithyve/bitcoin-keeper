import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import useSigners from 'src/hooks/useSigners';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import useSignerMap from 'src/hooks/useSignerMap';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import SignerIcon from 'src/assets/images/signer-icon-brown.svg';
import HardwareIllustration from 'src/assets/images/diversify-hardware.svg';
import { UNVERIFYING_SIGNERS, getSignerDescription, getSignerNameFromType } from 'src/hardware';
import useVault from 'src/hooks/useVault';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { useDispatch } from 'react-redux';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';
import useSubscriptionLevel from 'src/hooks/useSubscriptionLevel';
import SignerCard from '../AddSigner/SignerCard';
import KeyAddedModal from 'src/components/KeyAddedModal';
import KeeperModal from 'src/components/KeeperModal';
import Note from 'src/components/Note/Note';
import Text from 'src/components/KeeperText';
import { ConciergeTag } from 'src/store/sagaActions/concierge';
import Relay from 'src/services/backend/Relay';
import { notificationType } from 'src/models/enums/Notifications';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import AddKeyButton from './components/AddKeyButton';
import EmptyListIllustration from '../../components/EmptyListIllustration';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { RealmSchema } from 'src/storage/realm/enum';
import { useQuery } from '@realm/react';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { setupKeeperSigner } from 'src/hardware/signerSetup';
import { getKeyUID } from 'src/utils/utilities';
import { SentryErrorBoundary } from 'src/services/sentry';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { INHERITANCE_KEY1_IDENTIFIER } from 'src/services/wallets/operations/miniscript/default/InheritanceVault';
import InheritanceKeySection from './components/InheritanceKeySection';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'ManageSigners'>;

function ManageSigners({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId = '', addedSigner, remoteData } = route.params || {};
  const { activeVault } = useVault({ vaultId });
  const { signers: vaultKeys } = activeVault || { signers: [] };
  const { signerMap } = useSignerMap();
  const { signers } = useSigners();
  const {
    realySignersUpdateErrorMessage,
    relaySignersUpdate,
    relaySignersUpdateLoading,
    realySignersAdded,
  } = useAppSelector((state) => state.bhr);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const [keyAddedModalVisible, setKeyAddedModalVisible] = useState(false);
  const [timerModal, setTimerModal] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [newSigner, setNewSigner] = useState(null);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslation, common, settings } = translations;
  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.SIGNING_DEVICES_HEALTH_CHECK, uaiType.RECOVERY_PHRASE_HEALTH_CHECK],
  });

  useEffect(() => {
    if (remoteData?.key && !timerModal) setTimerModal(true);
  }, [remoteData]);

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

  useFocusEffect(
    useCallback(() => {
      if (relaySignersUpdate) {
        setInProgress(false);
        if (realySignersAdded && navigation.isFocused()) {
          setKeyAddedModalVisible(true);
        }
        dispatch(resetSignersUpdateState());
      }
    }, [relaySignersUpdate])
  );

  const handleCardSelect = (signer, item, isInheritanceKey?) => {
    navigation.dispatch(
      CommonActions.navigate('SigningDeviceDetails', {
        signerId: getKeyUID(signer),
        vaultId,
        isInheritanceKey,
        vaultKey: vaultKeys.length ? item : undefined,
        vaultSigners: vaultKeys,
      })
    );
  };

  const handleAddSigner = () => {
    navigation.dispatch(CommonActions.navigate('SignerCategoryList', { addSignerFlow: true }));
  };

  const handleModalClose = () => {
    setKeyAddedModalVisible(false);
  };

  const onSuccess = () => navigation.dispatch(CommonActions.navigate('DeleteKeys'));

  const acceptRemoteKey = async () => {
    try {
      setTimerModal(false);
      const hw = setupKeeperSigner(remoteData.key);
      dispatch(addSigningDevice([hw.signer]));
      setNewSigner(hw.signer);
      await Relay.sendSingleNotification({
        fcm: remoteData.fcm,
        notification: {
          title: 'Remote key accepted',
          body: 'The remote key that you shared has been accepted by the user',
        },
        data: {
          notificationType: notificationType.REMOTE_KEY_SHARE,
        },
      });
    } catch (error) {
      console.log('🚀 ~ ManageSigners ~ error:', { error });
      showToast('Error while adding External Key');
    }
  };

  const rejectRemoteKey = async () => {
    setTimerModal(false);
    await Relay.sendSingleNotification({
      fcm: remoteData.fcm,
      notification: {
        title: 'Remote key rejected',
        body: 'The remote key that you shared has been rejected by the user',
      },
      data: {
        notificationType: notificationType.REMOTE_KEY_SHARE,
      },
    });
  };

  return (
    <Box safeAreaTop backgroundColor={`${colorMode}.BrownNeedHelp`} style={[styles.wrapper]}>
      <Box style={styles.topSection}>
        <KeeperHeader
          title={signerTranslation.ManageKeys}
          subtitle={signerTranslation.ViewAndChangeKeyDetails}
          mediumTitle
          learnMore
          learnMorePressed={() => setShowLearnMoreModal(true)}
          learnTextColor={`${colorMode}.buttonText`}
          titleColor={`${colorMode}.seashellWhiteText`}
          subTitleColor={`${colorMode}.seashellWhiteText`}
          icon={
            <CircleIconWrapper
              backgroundColor={`${colorMode}.seashellWhiteText`}
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
        close={() => setTimerModal(false)}
        visible={timerModal}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.modalGreenButton`}
        secButtonTextColor={`${colorMode}.modalGreenButton`}
        buttonText={signerTranslation.addKey}
        secondaryButtonText={signerTranslation.reject}
        buttonCallback={acceptRemoteKey}
        secondaryCallback={rejectRemoteKey}
        Content={() => (
          <Box style={{ marginBottom: hp(10) }}>
            <Note subtitle={signerTranslation.remoteKeyReceiveNote} />
          </Box>
        )}
      />
      <KeyAddedModal
        visible={keyAddedModalVisible}
        close={handleModalClose}
        signer={addedSigner ?? newSigner}
      />
      <KeeperModal
        close={() => {
          setShowLearnMoreModal(false);
        }}
        visible={showLearnMoreModal}
        title={signerTranslation.ManageKeys}
        subTitle={signerTranslation.manageKeysModalSubtitle}
        subTitleColor={`${colorMode}.modalGreenContent`}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        DarkCloseIcon={colorMode === 'dark' ? true : false}
        buttonTextColor={`${colorMode}.whiteButtonText`}
        buttonBackground={`${colorMode}.whiteButtonBackground`}
        secButtonTextColor={`${colorMode}.whiteSecButtonText`}
        secondaryButtonText={common.needHelp}
        secondaryIcon={<ConciergeNeedHelp />}
        secondaryCallback={() => {
          setShowLearnMoreModal(false);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                tags: [ConciergeTag.KEYS],
                screenName: 'manage-keys',
              },
            })
          );
        }}
        buttonText={common.Okay}
        buttonCallback={() => setShowLearnMoreModal(false)}
        Content={() => (
          <Box style={styles.modalContent}>
            <Box style={styles.illustrationContainer}>
              <HardwareIllustration />
            </Box>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.modalDesc}>
              {signerTranslation.manageKeysModalDesc}
            </Text>
          </Box>
        )}
      />
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title={settings.EnterPasscodeTitle}
        subTitleWidth={wp(240)}
        subTitle={settings.EnterPasscodeSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics={false}
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={onSuccess}
          />
        )}
      />
      {inProgress && <ActivityIndicatorView visible={inProgress} />}
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
  handleCardSelect: (signer: Signer, item: VaultSigner, isInheritanceKey?: boolean) => void;
  handleAddSigner: () => void;
  vault: Vault;
  typeBasedIndicator: Record<string, Record<string, boolean>>;
}) {
  const list = vaultKeys.length ? vaultKeys : signers.filter((signer) => !signer.hidden);
  const { level } = useSubscriptionLevel();
  const { showToast } = useToastMessage();
  const isNonVaultManageSignerFlow = !vault; // Manage Signers flow accessible via home screen
  const shellKeys = [];
  const { id: appRecoveryKeyId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];

  const [currentBlockHeight, setCurrentBlockHeight] = useState(null);
  const inheritanceKeyMeta = vault?.signers?.find(
    (signer) =>
      signer?.masterFingerprint ===
      vault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints[
        INHERITANCE_KEY1_IDENTIFIER
      ]
  );
  const inheritanceKey = inheritanceKeyMeta ? signerMap[getKeyUID(inheritanceKeyMeta)] : null;

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
    let isSigningServerShellCreated = false;

    if (shellKeys.filter((signer) => signer.type === SignerType.POLICY_SERVER).length > 0) {
      isSigningServerShellCreated = true;
    }

    for (const signer of signers) {
      if (signer.type === SignerType.POLICY_SERVER) hasSigningServer = true;
    }

    if (!isSigningServerShellCreated && !hasSigningServer && level >= AppSubscriptionLevel.L2) {
      shellKeys.push(generateShellAssistedKey(SignerType.POLICY_SERVER));
    }

    const addedSignersTypes = signers.map((signer) => signer.type);
    return shellKeys.filter((shellSigner) => !addedSignersTypes.includes(shellSigner.type));
  }, [signers]);

  const renderAssistedKeysShell = () => {
    return shellAssistedKeys.map((shellSigner) => {
      return (
        <SignerCard
          key={getKeyUID(shellSigner)}
          onCardSelect={() => {
            showToast('Please add the key to a Vault in order to use it');
          }}
          name={getSignerNameFromType(shellSigner.type, shellSigner.isMock, false)}
          description="Setup required"
          icon={SDIcons(shellSigner.type).Icon}
          showSelection={false}
          showDot={true}
          colorVarient="green"
          colorMode={colorMode}
          customStyle={styles.signerCard}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.topContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {!vaultKeys.length && (
          <Box style={{ marginBottom: hp(25), marginRight: wp(15) }}>
            <AddKeyButton onPress={handleAddSigner} />
          </Box>
        )}
        <Box style={styles.addedSignersContainer}>
          {list.map((item) => {
            const signer = vaultKeys.length ? signerMap[getKeyUID(item)] : item;
            if (
              !signer ||
              signer.archived ||
              signer?.masterFingerprint === inheritanceKeyMeta?.masterFingerprint
            ) {
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
              (signer.type !== SignerType.MY_KEEPER &&
                typeBasedIndicator?.[uaiType.SIGNING_DEVICES_HEALTH_CHECK]?.[
                  item.masterFingerprint
                ]);

            return (
              <SignerCard
                key={getKeyUID(signer)}
                onCardSelect={() => {
                  handleCardSelect(signer, item);
                }}
                name={
                  !signer.isBIP85
                    ? getSignerNameFromType(signer.type, signer.isMock, false)
                    : `${getSignerNameFromType(signer.type, signer.isMock, false)} +`
                }
                description={getSignerDescription(signer)}
                icon={SDIcons(signer.type, true).Icon}
                image={signer?.extraData?.thumbnailPath}
                showSelection={false}
                showDot={showDot}
                colorVarient="green"
                colorMode={colorMode}
                customStyle={styles.signerCard}
              />
            );
          })}
          {isNonVaultManageSignerFlow && renderAssistedKeysShell()}
          {isNonVaultManageSignerFlow && list.length == 0 && shellAssistedKeys.length == 0 && (
            <EmptyListIllustration listType="keys" />
          )}
        </Box>

        {inheritanceKey && (
          <InheritanceKeySection
            vault={vault}
            currentBlockHeight={currentBlockHeight}
            signerMap={signerMap}
            handleCardSelect={handleCardSelect}
            setCurrentBlockHeight={setCurrentBlockHeight}
          />
        )}
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
    height: '25%',
    paddingHorizontal: 20,
    paddingTop: hp(15),
  },
  signersContainer: {
    paddingHorizontal: '5%',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    flex: 1,
  },
  scrollContainer: {
    zIndex: 2,
    marginVertical: wp(30),
    paddingBottom: hp(30),
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
    marginBottom: hp(10),
  },
  illustrationContainer: {
    marginBottom: hp(30),
  },
  timerWrapper: {
    width: '100%',
    borderRadius: 10,
    marginBottom: hp(30),
    marginTop: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 13,
    letterSpacing: 0.65,
    gap: 30,
  },
  modalDesc: {
    width: '95%',
  },
  settingsButton: {
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  signerCard: {
    width: windowWidth * 0.43,
    height: wp(130),
  },
});

export default SentryErrorBoundary(ManageSigners);
