import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, wp } from 'src/constants/responsive';
import { generateOutputDescriptors, getArchivedVaults } from 'src/utils/service-utilities/utils';
import Colors from 'src/theme/Colors';
import useVault from 'src/hooks/useVault';
import ScreenWrapper from 'src/components/ScreenWrapper';
import OptionCard from 'src/components/OptionCard';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import useTestSats from 'src/hooks/useTestSats';
import KeeperModal from 'src/components/KeeperModal';
import TickIcon from 'src/assets/images/icon_tick.svg';
import AssistedIcon from 'src/assets/images/assisted-vault-white-icon.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { EntityKind, VaultType, VisibilityType } from 'src/services/wallets/enums';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import { getKeyUID, trimCWDefaultName } from 'src/utils/utilities';
import { INHERITANCE_KEY1_IDENTIFIER } from 'src/services/wallets/operations/miniscript/default/InheritanceVault';
import EditWalletDetailsModal from '../WalletDetails/EditWalletDetailsModal';
import SelectionCard from 'src/components/SelectionCard';
import Buttons from 'src/components/Buttons';

const ConfigModalContent = ({
  configOptions,
  setConfigModalVisible,
  selectedConfigOption,
  setSelectedConfigOption,
}) => {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <Box style={styles.configModalContainer}>
      {configOptions.map((option) => (
        <SelectionCard
          key={option.id}
          id={option.id}
          title={option.title}
          subtitle={option.subtitle}
          callback={option.callback}
          setSelectedOption={setSelectedConfigOption}
          isSelected={selectedConfigOption?.id === option.id}
        />
      ))}
      <Box style={styles.configModalFooter}>
        <Buttons
          primaryText={common.proceed}
          primaryCallback={() => {
            selectedConfigOption.callback();
            setConfigModalVisible(false);
          }}
          fullWidth
        />
      </Box>
    </Box>
  );
};

const VaultSettings = ({ route }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId } = route.params;
  const { allVaults, activeVault: vault } = useVault({ includeArchived: true, vaultId });
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const TestSatsComponent = useTestSats({ wallet: vault });
  const { showToast } = useToastMessage();
  const descriptorString = generateOutputDescriptors(vault);
  const isDarkMode = colorMode === 'dark';
  const isCanaryWalletType = vault.type === VaultType.CANARY;
  const isCollaborativeWallet = vault.type === VaultType.COLLABORATIVE;
  const isInheritanceVault =
    vault?.type === VaultType.INHERITANCE && !!vault?.scheme?.miniscriptScheme;
  const inheritanceKey = vault?.signers?.find(
    (signer) =>
      signer.masterFingerprint ===
      vault?.scheme?.miniscriptScheme?.miniscriptElements?.signerFingerprints[
        INHERITANCE_KEY1_IDENTIFIER
      ]
  );
  const hasArchivedVaults = getArchivedVaults(allVaults, vault).length > 0;

  const [vaultDetailVisible, setVaultDetailVisible] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);

  const handleUpdateScheme = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'VaultSetup',
        params: {
          vaultId,
          isAddInheritanceKeyFromParams: vault.type === VaultType.INHERITANCE,
        },
      })
    );
  };

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

  const getWalletIcon = (wallet) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      if (wallet.type === VaultType.COLLABORATIVE) {
        return <CollaborativeIcon />;
      } else if (wallet.type === VaultType.ASSISTED) {
        return <AssistedIcon />;
      } else {
        return <VaultIcon />;
      }
    } else {
      return <WalletIcon />;
    }
  };

  const configOptions = [
    {
      id: 1,
      title: vaultText.updateScheme,
      subtitle: vaultText.revaultByScheme,
      callback: handleUpdateScheme,
    },
    {
      id: 2,
      title: vaultText.changeTimeline,
      subtitle: vaultText.revaultByIK,
      callback: () => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'ResetInheritanceKey',
            params: { signerId: getKeyUID(inheritanceKey), vault },
          })
        );
      },
    },
  ];

  const [selectedConfigOption, setSelectedConfigOption] = useState(configOptions[0]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={isCollaborativeWallet ? vaultText.collabSettingsTitle : vaultText.vaultSettingsTitle}
        subtitle={vaultText.vaultSettingsSubtitle}
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={isDarkMode ? Colors.DullGreenDark : Colors.pantoneGreen}
            icon={getWalletIcon(vault)}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.optionViewWrapper}>
        <OptionCard
          title={vaultText.vaultDetailsTitle}
          description={vaultText.vaultDetailsDesc}
          callback={() => setVaultDetailVisible(true)}
        />
        <OptionCard
          title={vaultText.vaultConfigurationFileTitle}
          description={vaultText.vaultConfigurationFileDesc}
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate('GenerateVaultDescriptor', { descriptorString, vaultId })
            );
          }}
        />
        <OptionCard
          title={vaultText.vaultArchiveTitle}
          description={vaultText.vaultArchiveDesc}
          callback={() => navigation.dispatch(CommonActions.navigate('ArchivedVault', { vaultId }))}
          visible={!isCanaryWalletType && hasArchivedVaults}
        />
        <OptionCard
          title={vaultText.vaultHideTitle}
          description={vaultText.vaultHideDesc}
          callback={updateWalletVisibility}
          visible={!isCanaryWalletType}
        />
        <OptionCard
          title={vaultText.vaultSchemeTitle}
          description={vaultText.vaultSchemeDesc}
          visible={!isCanaryWalletType && !isInheritanceVault}
          callback={handleUpdateScheme}
        />
        <OptionCard
          title={vaultText.changeConfigTitle}
          description={vaultText.changeConfigDesc}
          visible={!isCanaryWalletType && isInheritanceVault}
          callback={() => setConfigModalVisible(true)}
        />
        {TestSatsComponent}
      </ScrollView>

      <KeeperModal
        visible={vaultDetailVisible}
        close={() => setVaultDetailVisible(false)}
        title={vaultText.vaultEditTitle}
        subTitleWidth={wp(240)}
        subTitle={vaultText.vaultEditSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={false}
        Content={() => (
          <EditWalletDetailsModal
            wallet={isCollaborativeWallet ? trimCWDefaultName(vault) : vault}
            close={() => setVaultDetailVisible(false)}
          />
        )}
      />

      <KeeperModal
        visible={configModalVisible}
        close={() => setConfigModalVisible(false)}
        title={vaultText.changeConfigTitle}
        subTitleWidth={wp(240)}
        subTitle={vaultText.changeConfigSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        DarkCloseIcon={isDarkMode}
        Content={() => (
          <ConfigModalContent
            configOptions={configOptions}
            setConfigModalVisible={setConfigModalVisible}
            selectedConfigOption={selectedConfigOption}
            setSelectedConfigOption={setSelectedConfigOption}
          />
        )}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  optionViewWrapper: {
    marginTop: hp(30),
    paddingHorizontal: wp(10),
  },
  configModalContainer: {
    gap: hp(10),
  },
  configModalFooter: {
    marginTop: hp(30),
  },
});

export default VaultSettings;
