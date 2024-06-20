import React, { useEffect, useState } from 'react';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import SettingsIcon from 'src/assets/images/SignerShow.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import KeeperModal from 'src/components/KeeperModal';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import useSigners from 'src/hooks/useSigners';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { SDIcons } from '../Vault/SigningDeviceIcons';
import Text from 'src/components/KeeperText';
import { getSignerDescription, getSignerNameFromType } from 'src/hardware';
import ActionChip from 'src/components/ActionChip';
import DeleteIcon from 'src/assets/images/delete_bin.svg';
import EmptyState from 'src/assets/images/empty-state-illustration.svg';
import ShowIcon from 'src/assets/images/show.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { Signer, Vault } from 'src/services/wallets/interfaces/vault';
import useVault from 'src/hooks/useVault';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ActionCard from 'src/components/ActionCard';
import WalletVault from 'src/assets/images/wallet_vault.svg';
import { archiveSigningDevice, deleteSigningDevice } from 'src/store/sagaActions/vaults';
import useArchivedVault from 'src/hooks/useArchivedVaults';

function Content({ colorMode, vaultUsed }: { colorMode: string; vaultUsed: Vault }) {
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
          Please delete the vault to perform this operation.
        </Text>
      </Box>
    </Box>
  );
}

function DeleteKeys({ route }) {
  const { colorMode } = useColorMode();
  const isUaiFlow: boolean = route.params?.isUaiFlow ?? false;
  const [confirmPassVisible, setConfirmPassVisible] = useState(isUaiFlow);
  const { signers } = useSigners();
  const hiddenSigners = signers.filter((signer) => signer.hidden && !signer.archived);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [unhidingMfp, setUnhidingMfp] = useState('');
  const { allVaults } = useVault({ includeArchived: true });
  const { archivedVaults } = useArchivedVault();
  const [warningEnabled, setHideWarning] = React.useState(false);
  const [vaultUsed, setVaultUsed] = React.useState<Vault>();
  const [signerToDelete, setSignerToDelete] = React.useState<Signer>();

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
      setSignerToDelete(null);
    }
  };

  const unhide = (signer: Signer) => {
    setUnhidingMfp(signer.masterFingerprint);
    dispatch(updateSignerDetails(signer, 'hidden', false));
  };

  useEffect(() => {
    if (unhidingMfp && !hiddenSigners.find((signer) => signer.masterFingerprint === unhidingMfp)) {
      setUnhidingMfp('');
    }
  }, [hiddenSigners]);

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={'Hidden Keys'}
        mediumTitle
        subtitle={'Only showing hidden keys'}
        icon={
          <CircleIconWrapper
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={<SettingsIcon />}
          />
        }
      />
      <Box paddingY={'5'} />
      {hiddenSigners.length === 0 ? (
        <Box style={styles.emptyWrapper}>
          <Text style={styles.emptyText} semiBold>
            No Hidden Keys
          </Text>
          <Text style={styles.emptySubText}>There are no hidden keys to show</Text>
          <EmptyState />
        </Box>
      ) : (
        hiddenSigners.map((signer) => {
          return (
            <Box
              key={signer.masterFingerprint}
              backgroundColor={`${colorMode}.seashellWhite`}
              style={styles.signerContainer}
            >
              <VStack>
                <Box alignItems={'flex-start'}>
                  <HexagonIcon
                    width={40}
                    height={40}
                    backgroundColor={Colors.pantoneGreen}
                    icon={SDIcons(signer.type, true).Icon}
                  />
                </Box>
                <Text fontSize={12}>{getSignerNameFromType(signer.type)}</Text>
                <Text fontSize={11} color={`${colorMode}.secondaryText`}>
                  {getSignerDescription(signer.type, signer.extraData?.instanceNumber, signer)}
                </Text>
              </VStack>
              <HStack>
                <ActionChip
                  text="Delete"
                  onPress={() => {
                    // check if signer is a part of any of the vaults
                    const vaultsInvolved = allVaults.filter(
                      (vault) =>
                        !vault.archived &&
                        vault.signers.find((s) => s.masterFingerprint === signer.masterFingerprint)
                    );
                    if (vaultsInvolved.length > 0) {
                      setVaultUsed(vaultsInvolved[0]);
                      setHideWarning(true);
                      return;
                    }
                    setConfirmPassVisible(true);
                    setSignerToDelete(signer);
                  }}
                  Icon={<DeleteIcon />}
                />
                <ActionChip
                  text="Unhide"
                  onPress={() => unhide(signer)}
                  Icon={
                    signer.masterFingerprint === unhidingMfp ? (
                      <ActivityIndicator color={'white'} />
                    ) : (
                      <ShowIcon />
                    )
                  }
                />
              </HStack>
              <KeeperModal
                visible={warningEnabled && !!vaultUsed}
                close={() => setHideWarning(false)}
                title="Key is being used for Vault"
                subTitle="The Key you are trying to hide is used in one of the visible vaults."
                buttonText="View Vault"
                secondaryButtonText="Back"
                secondaryCallback={() => setHideWarning(false)}
                secButtonTextColor={`${colorMode}.greenText`}
                modalBackground={`${colorMode}.modalWhiteBackground`}
                buttonBackground={`${colorMode}.greenButtonBackground`}
                buttonTextColor={`${colorMode}.white`}
                DarkCloseIcon={colorMode === 'dark'}
                buttonCallback={() => {
                  setHideWarning(false);
                  navigation.dispatch(
                    CommonActions.navigate('VaultDetails', { vaultId: vaultUsed.id })
                  );
                }}
                textColor={`${colorMode}.primaryText`}
                Content={() => <Content vaultUsed={vaultUsed} colorMode={colorMode} />}
              />
            </Box>
          );
        })
      )}

      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Enter Passcode"
        subTitleWidth={wp(240)}
        subTitle={'Confirm passcode to delete key'}
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.8,
  },
  emptyText: {
    marginBottom: hp(3),
  },
  emptySubText: {
    marginBottom: hp(30),
  },
});

export default DeleteKeys;
