import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/constants/responsive';
import { getArchivedVaults } from 'src/utils/service-utilities/utils';
import useVault from 'src/hooks/useVault';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useTestSats from 'src/hooks/useTestSats';
import KeeperModal from 'src/components/KeeperModal';
import TickIcon from 'src/assets/images/icon_tick.svg';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { MiniscriptTypes, VaultType, VisibilityType } from 'src/services/wallets/enums';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { getKeyUID, trimCWDefaultName } from 'src/utils/utilities';
import { INHERITANCE_KEY1_IDENTIFIER } from 'src/services/wallets/operations/miniscript/default/InheritanceVault';
import EditWalletDetailsModal from '../WalletDetails/EditWalletDetailsModal';
import WalletHeader from 'src/components/WalletHeader';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import LearnMoreIcon from 'src/assets/images/learnMoreIcon.svg';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import Text from 'src/components/KeeperText';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';

function VaultSettings({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId } = route.params;
  const { allVaults, activeVault: vault } = useVault({ includeArchived: true, vaultId });
  const TestSatsComponent = useTestSats({ wallet: vault });
  const [vaultDetailVisible, setVaultDetailVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText, common } = translations;
  const isCanaryWalletType = vault.type === VaultType.CANARY;
  const isCollaborativeWallet = vault.type === VaultType.COLLABORATIVE;
  const { showToast } = useToastMessage();
  const isMiniscriptVault =
    vault?.type === VaultType.MINISCRIPT && !!vault?.scheme?.miniscriptScheme;
  const inheritanceKey = vault?.signers?.find(
    (signer) =>
      signer.masterFingerprint ===
      vault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints[
        INHERITANCE_KEY1_IDENTIFIER
      ]
  );
  const hasArchivedVaults = getArchivedVaults(allVaults, vault).length > 0;
  const [needHelpModal, setNeedHelpModal] = useState(false);

  const updateWalletVisibility = () => {
    try {
      dbManager.updateObjectById(RealmSchema.Vault, vault.id, {
        presentationData: {
          name: vault.presentationData.name,
          description: vault.presentationData.description,
          visibility: VisibilityType.HIDDEN,
          shell: vault.presentationData.shell,
        },
      });
      showToast(vaultText.vaultHiddenSuccessMessage, <TickIcon />, IToastCategory.DEFAULT, 5000);
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

  function modalContent() {
    return (
      <Box>
        <Box style={styles.illustration}>
          <VaultSetupIcon />
        </Box>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.modalDesc}>
          {vaultText.keeperSupportSigningDevice}
        </Text>
        <Text color={`${colorMode}.modalGreenContent`} style={styles.modalDesc}>
          {vaultText.additionalOptionForSignDevice}
        </Text>
      </Box>
    );
  }

  const actions = [
    {
      title: vaultText.vaultDetailsTitle,
      description: vaultText.vaultDetailsDesc,
      icon: null,
      isDiamond: false,
      onPress: () => setVaultDetailVisible(true),
    },
    {
      title: vaultText.vaultConfigurationFileTitle,
      description: vaultText.vaultConfigurationFileDesc,
      icon: null,
      isDiamond: false,
      onPress: () =>
        navigation.dispatch(
          CommonActions.navigate('GenerateVaultDescriptor', {
            vaultId,
            isMiniscriptVault,
          })
        ),
    },
    !isCanaryWalletType &&
      hasArchivedVaults && {
        title: vaultText.vaultArchiveTitle,
        description: vaultText.vaultArchiveDesc,
        icon: null,
        isDiamond: false,
        onPress: () => navigation.dispatch(CommonActions.navigate('ArchivedVault', { vaultId })),
      },
    !isCanaryWalletType && {
      title: vaultText.vaultHideTitle,
      description: vaultText.vaultHideDesc,
      icon: null,
      isDiamond: false,
      onPress: () => updateWalletVisibility(),
    },
    false && // disable update scheme as it gives wrong behavior
      !isCanaryWalletType && {
        title: vaultText.vaultSchemeTitle,
        description: vaultText.vaultSchemeDesc,
        icon: null,
        isDiamond: false,
        onPress: () =>
          navigation.dispatch(
            CommonActions.navigate({
              name: 'AddNewWallet',
              params: {
                vaultId,
                isAddInheritanceKeyFromParams:
                  vault.type === VaultType.MINISCRIPT &&
                  vault.scheme?.miniscriptScheme?.usedMiniscriptTypes?.includes(
                    MiniscriptTypes.INHERITANCE
                  ),
              },
            })
          ),
      },
    // TODO: Update to be generic instead of only for inheritance key
    isMiniscriptVault && {
      title: vaultText.resetIKTitle,
      description: vaultText.resetIKDesc,
      icon: null,
      isDiamond: false,
      onPress: () =>
        navigation.dispatch(
          CommonActions.navigate({
            name: 'ResetInheritanceKey',
            params: { signerId: getKeyUID(inheritanceKey), vault },
          })
        ),
    },
  ].filter(Boolean);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container}>
        <Box style={styles.header}>
          <WalletHeader
            title={
              isCollaborativeWallet ? vaultText.collabSettingsTitle : vaultText.vaultSettingsTitle
            }
            rightComponent={
              <Pressable onPress={() => setNeedHelpModal(true)}>
                <LearnMoreIcon />
              </Pressable>
            }
          />
        </Box>
        <SettingCard
          subtitleColor={`${colorMode}.balanceText`}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.separator`}
          items={actions}
        />
        {TestSatsComponent}
      </Box>
      <KeeperModal
        visible={vaultDetailVisible}
        close={() => setVaultDetailVisible(false)}
        title={vaultText.vaultEditTitle}
        subTitleWidth={wp(240)}
        subTitle={vaultText.vaultEditSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalHeaderTitle`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        showCloseIcon={false}
        Content={() => (
          <EditWalletDetailsModal
            wallet={isCollaborativeWallet ? trimCWDefaultName(vault) : vault}
            close={() => setVaultDetailVisible(false)}
          />
        )}
      />
      <KeeperModal
        visible={needHelpModal}
        close={() => setNeedHelpModal(false)}
        title={vaultText.keeperVault}
        subTitle={vaultText.vaultLearnMoreSubtitle}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={modalContent}
        subTitleWidth={wp(280)}
        DarkCloseIcon
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
        secondaryIcon={<ConciergeNeedHelp />}
        secondaryCallback={() => {
          setNeedHelpModal(false);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                tags: [ConciergeTag.WALLET],
                screenName: 'wallet-settings',
              },
            })
          );
        }}
        buttonCallback={() => setNeedHelpModal(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 18,
  },
  modalDesc: {
    fontSize: 14,
    padding: 1,
    marginBottom: 15,
    width: wp(295),
  },

  illustration: {
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 40,
  },
});
export default VaultSettings;
