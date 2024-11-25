import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import { ScrollView, useColorMode } from 'native-base';
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
import EditWalletDetailsModal from '../WalletDetails/EditWalletDetailsModal';
import TickIcon from 'src/assets/images/icon_tick.svg';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { VaultType, VisibilityType } from 'src/services/wallets/enums';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import { trimCWDefaultName } from 'src/utils/utilities';

function VaultSettings({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { vaultId } = route.params;
  const { allVaults, activeVault: vault } = useVault({ includeArchived: true, vaultId });
  const descriptorString = generateOutputDescriptors(vault);
  const TestSatsComponent = useTestSats({ wallet: vault });
  const [vaultDetailVisible, setVaultDetailVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;
  const isCanaryWalletType = vault.type === VaultType.CANARY;
  const isCollaborativeWallet = vault.type === VaultType.COLLABORATIVE;
  const { showToast } = useToastMessage();

  const hasArchivedVaults = getArchivedVaults(allVaults, vault).length > 0;

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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={isCollaborativeWallet ? vaultText.collabSettingsTitle : vaultText.vaultSettingsTitle}
        subtitle={vaultText.vaultSettingsSubtitle}
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={Colors.pantoneGreen}
            icon={isCollaborativeWallet ? <CollaborativeIcon /> : <VaultIcon />}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.optionViewWrapper}>
        <OptionCard
          title={vaultText.vaultDetailsTitle}
          description={vaultText.vaultDetailsDesc}
          callback={() => {
            setVaultDetailVisible(true);
          }}
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
          callback={() => {
            navigation.dispatch(CommonActions.navigate('ArchivedVault', { vaultId }));
          }}
          visible={!isCanaryWalletType && hasArchivedVaults}
        />
        <OptionCard
          title={vaultText.vaultHideTitle}
          description={vaultText.vaultHideDesc}
          callback={() => updateWalletVisibility()}
          visible={!isCanaryWalletType}
        />
        <OptionCard
          title={vaultText.vaultSchemeTitle}
          description={vaultText.vaultSchemeDesc}
          visible={!isCanaryWalletType}
          callback={() => {
            navigation.dispatch(
              CommonActions.navigate({ name: 'VaultSetup', params: { vaultId } })
            );
          }}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  optionViewWrapper: {
    marginTop: hp(30),
    paddingHorizontal: wp(10),
  },
  cancelBtn: {
    marginRight: wp(20),
    borderRadius: 10,
  },
  btnText: {
    fontSize: 12,
    letterSpacing: 0.84,
  },
  createBtn: {
    paddingVertical: hp(15),
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  BalanceModalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalContainer: {
    gap: 40,
  },
  unhideText: {
    fontSize: 14,
    width: wp(200),
  },
});
export default VaultSettings;
