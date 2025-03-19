import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { wp } from 'src/constants/responsive';
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
import { trimCWDefaultName } from 'src/utils/utilities';
import { getVaultEnhancedSigners } from 'src/services/wallets/operations/miniscript/default/EnhancedVault';
import WalletHeader from 'src/components/WalletHeader';
import LearnMoreIcon from 'src/assets/images/learnMoreIcon.svg';
import LearnMoreIconDark from 'src/assets/images/info-Dark-icon.svg';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import Text from 'src/components/KeeperText';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import SettingCard from '../Home/components/Settings/Component/SettingCard';
import EditWalletDetailsModal from '../WalletDetails/EditWalletDetailsModal';
import WalletConfiguration from './components/WalletConfiguration';

function VaultSettings({ route }) {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
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
  const { inheritanceSigners: inheritanceKeys, emergencySigners: emergencyKeys } = isMiniscriptVault
    ? getVaultEnhancedSigners(vault)
    : { inheritanceSigners: [], emergencySigners: [] };

  const hasArchivedVaults = getArchivedVaults(allVaults, vault).length > 0;
  const [needHelpModal, setNeedHelpModal] = useState(false);
  const [walletConfigModal, setWalletConfigModal] = useState(false);

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

  const archiveWallet = () => {
    try {
      dbManager.updateObjectById(RealmSchema.Vault, vault.id, {
        archived: true,
        isMigrating: false,
      });
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
        <Text color={`${colorMode}.headerWhite`} style={styles.modalDesc}>
          {vaultText.keeperSupportSigningDevice}
        </Text>
        <Text color={`${colorMode}.headerWhite`} style={styles.modalDesc}>
          {vaultText.additionalOptionForSignDevice}
        </Text>
      </Box>
    );
  }
  function WalletConfigModal() {
    return (
      <Box>
        <WalletConfiguration
          vaultId={vaultId}
          isMiniscriptVault={isMiniscriptVault}
          navigation={navigation}
          vault={vault}
          setWalletConfigModal={setWalletConfigModal}
        />
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
      onPress: () => setWalletConfigModal(true),
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
    vault.archivedId &&
      vault.isMigrating && {
        title: 'Archive this wallet',
        description: 'If you have finished migrating to the new vault archive the wallet here',
        icon: null,
        isDiamond: false,
        onPress: () => archiveWallet(),
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
    inheritanceKeys.length && {
      title: emergencyKeys.length
        ? vaultText.resetKeysTitle
        : vaultText.resetIKTitle + (inheritanceKeys.length > 1 ? 's' : ''),
      description: emergencyKeys.length
        ? vaultText.resetKeysDesc
        : vaultText.resetIKDesc + (inheritanceKeys.length > 1 ? 's' : ''),
      icon: null,
      isDiamond: false,
      onPress: () =>
        navigation.dispatch(
          CommonActions.navigate({
            name: 'ResetInheritanceKey',
            params: { vault },
          })
        ),
    },
    emergencyKeys.length &&
      inheritanceKeys.length === 0 && {
        title: vaultText.resetEKTitle + (emergencyKeys.length > 1 ? 's' : ''),
        description: vaultText.resetEKDesc + (emergencyKeys.length > 1 ? 's' : ''),
        icon: null,
        isDiamond: false,
        onPress: () =>
          navigation.dispatch(
            CommonActions.navigate({
              name: 'ResetEmergencyKey',
              params: { vault },
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
              <Pressable style={styles.learnMoreIcon} onPress={() => setNeedHelpModal(true)}>
                {isDarkMode ? <LearnMoreIconDark /> : <LearnMoreIcon />}
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
        textColor={`${colorMode}.textGreen`}
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
        modalBackground={`${colorMode}.pantoneGreen`}
        textColor={`${colorMode}.headerWhite`}
        Content={modalContent}
        subTitleWidth={wp(280)}
        DarkCloseIcon
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.textGreen`}
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
      <KeeperModal
        visible={walletConfigModal}
        close={() => setWalletConfigModal(false)}
        title={vaultText.exportWallet}
        subTitle={vaultText.exportWalletDesc}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={WalletConfigModal}
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
  learnMoreIcon: {
    marginRight: wp(10),
  },
});
export default VaultSettings;
