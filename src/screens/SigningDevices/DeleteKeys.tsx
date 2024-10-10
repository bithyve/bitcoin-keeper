import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import HiddenKeyIcon from 'src/assets/images/hidden-key.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import KeeperModal from 'src/components/KeeperModal';
import useSigners from 'src/hooks/useSigners';
import { StyleSheet, ScrollView } from 'react-native';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import Text from 'src/components/KeeperText';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import DeleteIcon from 'src/assets/images/delete_bin.svg';
import EmptyState from 'src/assets/images/empty-state-illustration.svg';
import ShowIcon from 'src/assets/images/show.svg';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import useVault from 'src/hooks/useVault';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ActionCard from 'src/components/ActionCard';
import WalletVault from 'src/assets/images/wallet_vault.svg';
import { archiveSigningDevice, deleteSigningDevice } from 'src/store/sagaActions/vaults';
import useArchivedVault from 'src/hooks/useArchivedVaults';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { SignerType } from 'src/services/wallets/enums';
import { RECOVERY_KEY_SIGNER_NAME } from 'src/constants/defaultData';
import KeyCard from 'src/components/SigningDevices/KeyCard';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { useAppSelector } from 'src/store/hooks';
import { hideDeletingKeyModal, hideKeyDeletedSuccessModal } from 'src/store/reducers/bhr';
import BounceLoader from 'src/components/BounceLoader';
import TorAsset from 'src/components/Loader';
import moment from 'moment';

function DeleteKeys({ route }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerText } = translations;
  const isUaiFlow: boolean = route.params?.isUaiFlow ?? false;
  const [confirmPassVisible, setConfirmPassVisible] = useState(isUaiFlow);
  const { signers } = useSigners();
  const hiddenSigners = signers.filter(
    (signer) => signer.signerName !== RECOVERY_KEY_SIGNER_NAME && signer.hidden && !signer.archived
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [unhidingMfp, setUnhidingMfp] = useState('');
  const { allVaults } = useVault({ includeArchived: true });
  const { archivedVaults } = useArchivedVault();
  const [warningEnabled, setHideWarning] = useState(false);
  const [vaultUsed, setVaultUsed] = useState<Vault>();
  const [signerToDelete, setSignerToDelete] = useState<Signer>();
  const [deletedSigner, setDeletedSigner] = useState<Signer>();
  const deletingKeyModalVisible = useAppSelector((state) => state.bhr.deletingKeyModalVisible);
  const keyDeletedSuccessModalVisible = useAppSelector(
    (state) => state.bhr.keyDeletedSuccessModalVisible
  );

  const onSuccess = () => {
    if (signerToDelete) {
      const involvedArchivedVaults = archivedVaults.filter((vault) =>
        vault.signers.find((s) => s.masterFingerprint === signerToDelete.masterFingerprint)
      );
      if (involvedArchivedVaults.length) {
        dispatch(archiveSigningDevice([signerToDelete]));
      } else {
        dispatch(deleteSigningDevice([signerToDelete]));
      }
      setDeletedSigner(signerToDelete);
      setSignerToDelete(null);
    }
  };

  const unhide = (signer: Signer) => {
    setUnhidingMfp(signer.masterFingerprint);
    dispatch(updateSignerDetails(signer, 'hidden', false));
  };

  const handleDelete = (signer: Signer) => {
    const vaultsInvolved = allVaults.filter(
      (vault) =>
        !vault.archived &&
        vault.signers.find((s) => s.masterFingerprint === signer.masterFingerprint)
    );
    if (vaultsInvolved.length > 0) {
      setVaultUsed(vaultsInvolved[0]);
      setConfirmPassVisible(false);
      return;
    }
    setConfirmPassVisible(true);
    setSignerToDelete(signer);
  };

  useEffect(() => {
    if (unhidingMfp && !hiddenSigners.find((signer) => signer.masterFingerprint === unhidingMfp)) {
      setUnhidingMfp('');
    }
  }, [hiddenSigners]);

  function DeleteLoadingContent() {
    return (
      <Box style={styles.loadingModalContainer}>
        <Box style={styles.loadingIcon}>
          <TorAsset />
        </Box>
        <Box style={styles.loadingText}>
          <Text color={`${colorMode}.primaryText`}>{signerText.thisStepTakesTime}</Text>
          <BounceLoader />
        </Box>
      </Box>
    );
  }

  function DeletedSuccessContent() {
    return (
      <Box style={styles.successModalContainer} backgroundColor={`${colorMode}.seashellWhite`}>
        <Box style={styles.signerContentContainer}>
          <HexagonIcon
            width={43}
            height={38}
            backgroundColor={Colors.pantoneGreen}
            icon={SDIcons(deletedSigner?.type, true).Icon}
          />
          <Box>
            <Text numberOfLines={1} fontSize={14} color={`${colorMode}.greenText`}>
              {getSignerNameFromType(deletedSigner?.type)}
            </Text>
            <Text numberOfLines={1} fontSize={12} color={`${colorMode}.secondaryText`}>
              {getSignerDescription(deletedSigner)}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  function Content({ colorMode, vaultUsed }) {
    return (
      <Box>
        <ActionCard
          description={vaultUsed.presentationData?.description}
          cardName={vaultUsed.presentationData.name}
          icon={<WalletVault />}
          callback={() => {}}
        />
        <Box style={{ paddingVertical: 20 }}>
          <Text color={`${colorMode}.primaryText`} style={styles.warningText}>
            {signerText.deleteVaultInstruction}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={signerText.hiddenKeys}
        mediumTitle
        subtitle={signerText.showingHiddenKeys}
        icon={
          <HexagonIcon
            width={49}
            height={44}
            backgroundColor={colorMode === 'dark' ? Colors.pantoneGreenDark : Colors.pantoneGreen}
            icon={<HiddenKeyIcon style={{ marginLeft: wp(4) }} />}
          />
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {hiddenSigners.length === 0 ? (
          <Box style={styles.emptyWrapper}>
            <Text color={`${colorMode}.primaryText`} style={styles.emptyText} semiBold>
              {signerText.hideSignerTitle}
            </Text>
            <Text color={`${colorMode}.secondaryText`} style={styles.emptySubText}>
              {signerText.hideSignerSubtitle}
            </Text>
            <EmptyState />
          </Box>
        ) : (
          hiddenSigners.map((signer) => {
            const showDelete =
              signer.type !== SignerType.INHERITANCEKEY && signer.type !== SignerType.POLICY_SERVER;

            return (
              <KeyCard
                key={signer.masterFingerprint}
                isLoading={signer.masterFingerprint === unhidingMfp}
                primaryAction={showDelete ? () => handleDelete(signer) : null}
                secondaryAction={() => unhide(signer)}
                primaryText={showDelete ? signerText.delete : null}
                secondaryText={signerText.unhide}
                primaryIcon={showDelete ? <DeleteIcon /> : null}
                secondaryIcon={<ShowIcon />}
                icon={{ element: SDIcons(signer.type, true).Icon, backgroundColor: 'pantoneGreen' }}
                name={getSignerNameFromType(signer.type)}
                description={getSignerDescription(signer)}
                descriptionTitle={'Description'}
                dateAdded={`Added ${moment(signer?.addedOn).calendar()}`}
              />
            );
          })
        )}
      </ScrollView>
      <KeeperModal
        visible={warningEnabled && !!vaultUsed}
        close={() => setHideWarning(false)}
        title={signerText.deleteVaultWarning}
        subTitle={signerText.vaultWarningSubtitle}
        buttonText={signerText.viewVault}
        secondaryButtonText={signerText.back}
        secondaryCallback={() => setHideWarning(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonTextColor={`${colorMode}.white`}
        DarkCloseIcon={colorMode === 'dark'}
        buttonCallback={() => {
          setHideWarning(false);
          navigation.dispatch(CommonActions.navigate('VaultDetails', { vaultId: vaultUsed.id }));
        }}
        textColor={`${colorMode}.primaryText`}
        Content={() => <Content vaultUsed={vaultUsed} colorMode={colorMode} />}
      />
      <KeeperModal
        visible={deletingKeyModalVisible}
        close={() => dispatch(hideDeletingKeyModal())}
        showCloseIcon={false}
        title={signerText.deletingKey}
        subTitle={signerText.keyWillBeDeleted}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        Content={DeleteLoadingContent}
      />
      <KeeperModal
        visible={keyDeletedSuccessModalVisible}
        close={() => dispatch(hideKeyDeletedSuccessModal())}
        closeOnOverlayClick
        showCloseIcon={false}
        title={signerText.keyDeletedSuccessfully}
        subTitle={signerText.keyDeletedSuccessMessage}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        buttonTextColor={`${colorMode}.white`}
        buttonText={signerText.manageKeys}
        buttonCallback={() => {
          dispatch(hideKeyDeletedSuccessModal());
          navigation.dispatch(CommonActions.navigate('ManageSigners'));
        }}
        Content={DeletedSuccessContent}
      />

      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title={signerText.enterPasscode}
        subTitleWidth={wp(240)}
        subTitle={signerText.confirmPasscodeToDeleteKey}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <Box>
            {signerToDelete && (
              <Box style={styles.signerContentContainer} marginBottom={hp(20)}>
                <HexagonIcon
                  width={43}
                  height={38}
                  backgroundColor={Colors.pantoneGreen}
                  icon={SDIcons(signerToDelete.type, true).Icon}
                />
                <Box>
                  <Text numberOfLines={1} fontSize={14} color={`${colorMode}.greenText`}>
                    {getSignerNameFromType(signerToDelete.type)}
                  </Text>
                  <Text numberOfLines={1} fontSize={12} color={`${colorMode}.secondaryText`}>
                    {getSignerDescription(signerToDelete)}
                  </Text>
                </Box>
              </Box>
            )}
            <PasscodeVerifyModal
              useBiometrics={false}
              close={() => setConfirmPassVisible(false)}
              onSuccess={onSuccess}
            />
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  signerContainer: {
    width: windowWidth * 0.85,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  warningText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
  emptyWrapper: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: hp(3),
  },
  emptySubText: {
    fontSize: 14,
    lineHeight: 20,
    width: wp(250),
    textAlign: 'center',
    marginBottom: hp(30),
  },
  signerContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(12),
  },
  loadingModalContainer: {
    marginBottom: hp(20),
  },
  loadingIcon: {
    width: windowWidth * 0.85,
    marginTop: hp(30),
    marginBottom: hp(50),
  },
  loadingText: {
    width: windowWidth * 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successModalContainer: {
    paddingHorizontal: wp(25),
    justifyContent: 'center',
    height: hp(108),
    marginBottom: hp(20),
    borderRadius: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingVertical: 30,
  },
});

export default DeleteKeys;
