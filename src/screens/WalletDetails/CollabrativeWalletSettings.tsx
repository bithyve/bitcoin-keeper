import React, { useContext, useState } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import { wp, hp } from 'src/constants/responsive';
// import Note from 'src/components/Note/Note';
import { genrateOutputDescriptors } from 'src/utils/service-utilities/utils';
import { StyleSheet, TouchableOpacity } from 'react-native';
import OptionCard from 'src/components/OptionCard';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useVault from 'src/hooks/useVault';
import useTestSats from 'src/hooks/useTestSats';
import HexagonIcon from 'src/components/HexagonIcon';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import EditWalletDetailsModal from './EditWalletDetailsModal';
import { VaultType, VisibilityType } from 'src/services/wallets/enums';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import Text from 'src/components/KeeperText';
import { VAULTSETTINGS } from 'src/navigation/contants';
import { Shadow } from 'react-native-shadow-2';
import { trimCWDefaultName } from 'src/utils/utilities';

function CollabrativeWalletSettings() {
  const { colorMode } = useColorMode();
  const route = useRoute();
  const { vaultId } = route.params as { vaultId: string };
  const { activeVault } = useVault({ vaultId });
  const navigation = useNavigation();
  const descriptorString = genrateOutputDescriptors(activeVault);
  const TestSatsComponent = useTestSats({ wallet: activeVault });
  const [showWalletBalanceAlert, setShowWalletBalanceAlert] = useState(false);
  const [vaultDetailVisible, setVaultDetailVisible] = useState(false);
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common, vault: vaultText } = translations;
  const isCanaryWalletType = activeVault.type === VaultType.CANARY;

  const updateWalletVisibility = (checkBalance = true) => {
    if (
      checkBalance &&
      activeVault.specs.balances.confirmed + activeVault.specs.balances.unconfirmed > 0
    ) {
      setShowWalletBalanceAlert(true);
      return;
    }
    try {
      dbManager.updateObjectById(RealmSchema.Vault, activeVault.id, {
        presentationData: {
          name: activeVault.presentationData.name,
          description: activeVault.presentationData.description,
          visibility: VisibilityType.HIDDEN,
          shell: activeVault.presentationData.shell,
        },
      });
      showToast(vaultText.vaultHiddenSuccessMessage, <TickIcon />);
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

  function WalletBalanceAlertModalContent() {
    return (
      <Box style={styles.modalContainer}>
        <Text color={`${colorMode}.secondaryText`} style={styles.unhideText}>
          {vaultText.hideVaultModalDesc}
        </Text>
        <Box style={styles.BalanceModalContainer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              updateWalletVisibility(false);
              setShowWalletBalanceAlert(false);
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.greenText`} bold>
              {common.continueToHide}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowWalletBalanceAlert(false);
              navigation.dispatch(
                CommonActions.navigate('Send', {
                  sender: activeVault,
                  parentScreen: VAULTSETTINGS,
                })
              );
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box style={styles.createBtn} backgroundColor={`${colorMode}.greenButtonBackground`}>
                <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.white`} bold>
                  {common.MoveFunds}
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Collaborative Wallet Settings"
        subtitle={activeVault.presentationData.description}
        icon={
          <HexagonIcon
            width={44}
            height={38}
            backgroundColor={Colors.pantoneGreen}
            icon={<CollaborativeIcon />}
          />
        }
      />

      <ScrollView
        contentContainerStyle={styles.optionsListContainer}
        showsVerticalScrollIndicator={false}
      >
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
              CommonActions.navigate('GenerateVaultDescriptor', { descriptorString })
            );
          }}
        />

        <OptionCard
          title={vaultText.vaultArchiveTitle}
          description={vaultText.vaultArchiveDesc}
          callback={() => {
            navigation.dispatch(CommonActions.navigate('ArchivedVault', { vaultId }));
          }}
          visible={!isCanaryWalletType}
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
        DarkCloseIcon={colorMode === 'dark'}
        showCloseIcon={false}
        Content={() => (
          <EditWalletDetailsModal
            wallet={trimCWDefaultName(activeVault)}
            close={() => setVaultDetailVisible(false)}
          />
        )}
      />

      <KeeperModal
        dismissible
        close={() => {
          setShowWalletBalanceAlert(false);
        }}
        visible={showWalletBalanceAlert}
        title={vaultText.vaultFundsTitle}
        subTitle={vaultText.vaultFundsSubtitle}
        Content={WalletBalanceAlertModalContent}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(240)}
        closeOnOverlayClick={true}
        showButtons
        showCloseIcon={false}
      />

      {/* <Box style={styles.note} backgroundColor={`${colorMode}.secondaryBackground`}>
        <Note
          title="Note"
          subtitle="Keeper only supports one Collaborative wallet, per hot wallet. So if you import another Wallet Configuration File, you will see a new Collaborative Wallet"
          subtitleColor="GreyText"
        />
      </Box>  */}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
    position: 'relative',
  },
  note: {
    marginHorizontal: '5%',
  },
  walletCardContainer: {
    borderRadius: hp(20),
    width: wp(320),
    paddingHorizontal: 5,
    paddingVertical: 20,
    position: 'relative',
    marginLeft: -wp(20),
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: wp(10),
  },
  walletDetailsWrapper: {
    width: wp(155),
  },
  walletName: {
    letterSpacing: 0.28,
    fontSize: 15,
  },
  walletDescription: {
    letterSpacing: 0.24,
    fontSize: 13,
  },
  walletBalance: {
    letterSpacing: 1.2,
    fontSize: 23,
    padding: 5,
  },
  optionsListContainer: {
    alignItems: 'center',
    marginTop: hp(35),
    height: hp(425),
  },
  optionContainer: {
    marginTop: hp(20),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  optionTitle: {
    fontSize: 14,
    letterSpacing: 1.12,
  },
  optionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: '90%',
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
    fontSize: 13,
    width: wp(200),
  },
});
export default CollabrativeWalletSettings;
