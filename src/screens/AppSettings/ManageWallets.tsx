import React, { useContext, useEffect, useState } from 'react';
import Text from 'src/components/KeeperText';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Box, Pressable, useColorMode, HStack } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { EntityKind, VaultType, VisibilityType } from 'src/services/wallets/enums';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import EmptyState from 'src/assets/images/empty-state-illustration.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HideWalletIcon from 'src/assets/images/hide_wallet.svg';
import ShowIcon from 'src/assets/images/show.svg';
import dbManager from 'src/storage/realm/dbManager';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Shadow } from 'react-native-shadow-2';
import KeeperModal from 'src/components/KeeperModal';
import { captureError } from 'src/services/sentry';
import useWallets from 'src/hooks/useWallets';
import { useDispatch } from 'react-redux';
import { setNetBalance } from 'src/store/reducers/wallets';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import useVault from 'src/hooks/useVault';
import { Vault } from 'src/services/wallets/interfaces/vault';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc.svg';
import ActionChip from 'src/components/ActionChip';
import DeleteIcon from 'src/assets/images/delete_bin.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { deleteVault } from 'src/store/sagaActions/vaults';
import ShowAllIcon from 'src/assets/images/show_wallet.svg';
import HideAllIcon from 'src/assets/images/hide_wallet.svg';
import usePlan from 'src/hooks/usePlan';
import { deleteAppImageEntity } from 'src/store/sagaActions/bhr';
import { MANAGEWALLETS } from 'src/navigation/contants';

enum PasswordMode {
  DEFAULT = 'DEFAULT',
  SHOWALL = 'SHOWALL',
}
function ListItem({ title, subtitle, balance, visibilityToggle, isHidden, onDelete, icon, type }) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    // TODO: Drag and rearrange wallet functionality
    // <Box style={{ flexDirection: 'row', gap: 10, width: '90%' }}>
    //   <TouchableOpacity style={{ gap: 2, alignItems: 'center', justifyContent: 'center' }}>
    //     <AlignIcon />
    //   </TouchableOpacity>
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.walletInfoContainer}>
      <Box style={styles.textContainer}>
        <HexagonIcon width={44} height={38} backgroundColor={Colors.pantoneGreen} icon={icon} />
        <Box>
          <Text fontSize={13} color={`${colorMode}.primaryText`}>
            {title}
          </Text>
          <Text fontSize={12} color={`${colorMode}.secondaryText`}>
            {subtitle}
          </Text>
        </Box>
      </Box>
      <Box style={styles.justifyContent}>
        <Box style={styles.alignCenter}>
          {getCurrencyIcon(BTC, 'green')}
          <Text fontSize={15} color={`${colorMode}.primaryText`}>
            {` ${getBalance(balance)} ${getSatUnit()}`}
          </Text>
        </Box>
        <HStack>
          {isHidden && (type == 'VAULT' || (type == 'WALLET' && balance === 0)) && (
            <ActionChip text="Delete" onPress={onDelete} Icon={<DeleteIcon />} />
          )}
          <ActionChip
            text={isHidden ? 'Unhide' : 'Hide'}
            onPress={visibilityToggle}
            Icon={isHidden ? <ShowIcon /> : <HideWalletIcon />}
          />
        </HStack>
      </Box>
    </Box>
    // </Box>
  );
}

function ManageWallets() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  const { wallets } = useWallets({ getAll: true }); // contains all wallets(hidden/unhidden) except for whirlpool wallets

  const { allVaults } = useVault({ includeArchived: false });
  const allWallets: (Wallet | Vault)[] = [...wallets, ...allVaults].filter((item) => item !== null);
  const [showAll, setshowAll] = useState(false);
  const [showAllForced, setShowAllForced] = useState(false);
  const [passwordMode, setPasswordMode] = useState(PasswordMode.DEFAULT);

  const visibleWallets = allWallets.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.DEFAULT
  );

  const hiddenWallets = allWallets.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.HIDDEN
  );
  const [showWalletBalanceAlert, setShowWalletBalanceAlert] = useState(false);
  const [showDeleteVaultBalanceAlert, setShowDeleteVaultBalanceAlert] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [confirmPasscodeVisible, setConfirmPasscodeVisible] = useState(false);

  const { isOnL2Above } = usePlan();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const { showToast } = useToastMessage();
  useEffect(() => {
    calculateBalanceAfterVisblityChange();
  }, [wallets]);

  const isWallet = selectedWallet?.entityKind === EntityKind.WALLET;

  const calculateBalanceAfterVisblityChange = () => {
    const nonHiddenWallets = wallets.filter(
      (wallet) => wallet.presentationData.visibility === VisibilityType.DEFAULT
    );
    let netBalance = 0;
    nonHiddenWallets.forEach((wallet) => {
      const { confirmed, unconfirmed } = wallet.specs.balances;
      netBalance = netBalance + confirmed + unconfirmed;
    });
    dispatch(setNetBalance(netBalance));
  };

  const onProceed = () => {
    if (passwordMode === PasswordMode.DEFAULT) {
      updateWalletVisibility(selectedWallet, false);
      showToast('Wallet is now unhidden', <TickIcon />);
    }
    if (passwordMode === PasswordMode.SHOWALL) {
      setshowAll(true);
      showToast('Showing all wallets', <TickIcon />);
    }
  };

  const onForceProceed = () => {
    if (passwordMode === PasswordMode.SHOWALL) {
      setShowAllForced(true);
      showToast('Showing hidden wallets', <TickIcon />);
    }
  };

  const deleteSelectedEntity = () => {
    if (selectedWallet && selectedWallet.entityKind === EntityKind.VAULT) {
      dispatch(deleteVault(selectedWallet.id));
      showToast('Vault deleted successfully', <TickIcon />);
    }
    if (selectedWallet && selectedWallet.entityKind === EntityKind.WALLET) {
      dispatch(deleteAppImageEntity({ walletIds: [selectedWallet.id] }));
      showToast('Wallet deleted successfully', <TickIcon />);
    }
  };

  const updateWalletVisibility = (wallet: Wallet | Vault, hide: boolean, checkBalance = true) => {
    const { id, entityKind, specs } = wallet;
    const isWallet = entityKind === EntityKind.WALLET;

    if (hide && checkBalance && specs.balances.confirmed + specs.balances.unconfirmed > 0) {
      setShowWalletBalanceAlert(true);
      setSelectedWallet(wallet);

      return;
    }

    try {
      const visibilityType = hide ? VisibilityType.HIDDEN : VisibilityType.DEFAULT;
      const schema = isWallet ? RealmSchema.Wallet : RealmSchema.Vault;

      dbManager.updateObjectById(schema, id, {
        presentationData: {
          name: wallet.presentationData.name,
          description: wallet.presentationData.description,
          visibility: visibilityType,
          shell: wallet.presentationData.shell,
        },
      });
    } catch (error) {
      console.log(error);
      captureError(error);
    }
  };

  function WalletBalanceAlertModalContent() {
    return (
      <Box style={styles.modalContainer}>
        <Text
          color={`${colorMode}.secondaryText`}
          style={styles.unhideText}
        >{`You can unhide this wallet anytime from App Settings > Manage Wallets > Unhide`}</Text>
        <Box style={styles.BalanceModalContainer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              updateWalletVisibility(selectedWallet, true, false);
              setShowWalletBalanceAlert(false);
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.greenText`} bold>
              Continue to Hide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowWalletBalanceAlert(false);
              navigation.dispatch(
                CommonActions.navigate('Send', {
                  sender: selectedWallet,
                  parentScreen: MANAGEWALLETS,
                })
              );
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box style={styles.createBtn} backgroundColor={`${colorMode}.greenButtonBackground`}>
                <Text
                  numberOfLines={1}
                  style={styles.btnText}
                  color={`${colorMode}.buttonText`}
                  bold
                >
                  Move Funds
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  }

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  function DeleteVaultBalanceAlertModalContent() {
    const isWallet = selectedWallet?.entityKind === EntityKind.WALLET;
    return (
      <Box style={styles.modalContainer}>
        <Text color={`${colorMode}.secondaryText`} style={styles.unhideText}>
          {isWallet ? settings.DeleteWalletModalDesc : settings.DeleteVaultModalDesc}
        </Text>
        <Box style={styles.BalanceModalContainer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              if (isWallet) {
                // Cancel action
                updateWalletVisibility(selectedWallet, true, false);
                setShowDeleteVaultBalanceAlert(false);
              } else {
                // Delete Vault action
                setShowDeleteVaultBalanceAlert(false);
                setConfirmPasscodeVisible(true);
              }
            }}
            activeOpacity={0.5}
          >
            <Text numberOfLines={1} style={styles.btnText} color={`${colorMode}.greenText`} bold>
              {isWallet ? 'Cancel' : 'Continue'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowDeleteVaultBalanceAlert(false);
              navigation.dispatch(
                CommonActions.navigate('Send', {
                  sender: selectedWallet,
                  parentScreen: MANAGEWALLETS,
                })
              );
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box style={styles.createBtn} backgroundColor={`${colorMode}.greenButtonBackground`}>
                <Text
                  numberOfLines={1}
                  style={styles.btnText}
                  color={`${colorMode}.buttonText`}
                  bold
                >
                  Move Funds
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
      <KeeperHeader title={settings.ManageWalletsTitle} subtitle={settings.ManageWalletsSub} />
      {!showAll && visibleWallets.length === 0 ? (
        <Box style={styles.emptyWrapper}>
          <Text color={`${colorMode}.primaryText`} style={styles.emptyText} semiBold>
            {settings.ManageWalletsEmptyTitle}
          </Text>
          <Text color={`${colorMode}.secondaryText`} style={styles.emptySubText}>
            {settings.ManageWalletsEmptySubtitle}
          </Text>
          <EmptyState />
        </Box>
      ) : (
        <FlatList
          data={showAll ? [...visibleWallets, ...hiddenWallets] : [...visibleWallets]}
          extraData={[visibleWallets, hiddenWallets]}
          contentContainerStyle={styles.walletsContainer}
          renderItem={({ item }) => (
            <ListItem
              icon={getWalletIcon(item)}
              type={item.entityKind}
              title={item.presentationData.name}
              subtitle={item.presentationData.description}
              balance={item.specs.balances.confirmed + item.specs.balances.unconfirmed}
              isHidden={item.presentationData.visibility === VisibilityType.HIDDEN}
              visibilityToggle={() => {
                setSelectedWallet(item);
                if (item.presentationData.visibility === VisibilityType.HIDDEN) {
                  setPasswordMode(PasswordMode.DEFAULT);
                  setConfirmPassVisible(true);
                } else {
                  updateWalletVisibility(item, true);
                }
              }}
              onDelete={() => {
                if (item.specs.balances.confirmed + item.specs.balances.unconfirmed > 0) {
                  setSelectedWallet(item);
                  setShowDeleteVaultBalanceAlert(true);
                } else {
                  setSelectedWallet(item);
                  setConfirmPasscodeVisible(true);
                }
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
        />
      )}

      <Box backgroundColor="#BABABA" height={0.9} width="100%" />
      <Pressable
        onPress={() => {
          if (showAll) {
            setshowAll(!showAll);
            setShowAllForced(false);
          } else if (showAllForced) {
            setShowAllForced(!showAllForced);
          } else {
            setPasswordMode(PasswordMode.SHOWALL);
            setConfirmPassVisible(true);
          }
        }}
        style={styles.footer}
      >
        <Box backgroundColor={`${colorMode}.BrownNeedHelp`} style={styles.bottomIcon}>
          {showAll || showAllForced ? <HideAllIcon /> : <ShowAllIcon />}
        </Box>
        <Text style={{ fontWeight: '500' }} color={`${colorMode}.primaryText`}>
          {showAll || showAllForced ? `Hide hidden wallets` : `Show hidden wallets`}
        </Text>
      </Pressable>
      <KeeperModal
        dismissible
        close={() => {
          setShowWalletBalanceAlert(false);
        }}
        visible={showWalletBalanceAlert}
        title={`You have funds in your ${isWallet ? 'wallet' : 'vault'}`}
        subTitle={`You have sats in your ${
          isWallet ? 'wallet' : 'vault'
        }. Are you sure you want to hide it?`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        Content={WalletBalanceAlertModalContent}
        buttonTextColor={`${colorMode}.buttonText`}
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(240)}
        closeOnOverlayClick={true}
        showCloseIcon={false}
      />
      <KeeperModal
        dismissible
        close={() => {
          setShowDeleteVaultBalanceAlert(false);
          !isWallet && updateWalletVisibility(selectedWallet, true, false);
        }}
        visible={showDeleteVaultBalanceAlert}
        title={isWallet ? settings.DeleteWalletModalTitle : settings.DeleteVaultModalTitle}
        subTitle={isWallet ? settings.DeleteWalletModalSubTitle : settings.DeleteVaultModalSubTitle}
        textColor={`${colorMode}.primaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={DeleteVaultBalanceAlertModalContent}
        subTitleColor={`${colorMode}.secondaryText`}
        buttonTextColor={`${colorMode}.buttonText`}
        subTitleWidth={wp(240)}
        closeOnOverlayClick={isWallet ? false : true}
        showCloseIcon={false}
      />
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={true}
        close={() => setConfirmPassVisible(false)}
        showCloseIcon={false}
        title="Enter Passcode"
        subTitleWidth={wp(240)}
        subTitle="Confirm passcode to unhide wallets"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            forcedMode={passwordMode === PasswordMode.SHOWALL && isOnL2Above}
            useBiometrics={false}
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={onProceed}
            onForceSuccess={onForceProceed}
          />
        )}
      />
      <KeeperModal
        visible={confirmPasscodeVisible}
        closeOnOverlayClick={true}
        close={() => setConfirmPasscodeVisible(false)}
        title="Enter Passcode"
        subTitleWidth={wp(240)}
        subTitle={'Confirm passcode to delete the vault'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics={false}
            close={() => {
              setConfirmPasscodeVisible(false);
            }}
            onSuccess={deleteSelectedEntity}
          />
        )}
      />
    </ScreenWrapper>
  );
}

export default ManageWallets;

const styles = StyleSheet.create({
  learnMoreContainer: {
    flexDirection: 'row',
    gap: 3,
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learnMoreText: {
    fontSize: 12,
    letterSpacing: 0.24,
    alignSelf: 'center',
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
  walletInfoContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    gap: 5,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    gap: 10,
  },
  bottomIcon: {
    width: 38,
    height: 38,
    borderRadius: 38 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  justifyContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  BalanceModalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  walletsContainer: {
    marginHorizontal: 10,
    marginTop: '5%',
    paddingVertical: hp(20),
  },
  modalContainer: {
    gap: 40,
  },
  unhideText: {
    fontSize: 14,
    width: wp(280),
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
});
