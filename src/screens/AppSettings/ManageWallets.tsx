import React, { useContext, useEffect, useState, useRef } from 'react';
import Text from 'src/components/KeeperText';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Box, Pressable, useColorMode, HStack } from 'native-base';
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
import { useDispatch, useSelector } from 'react-redux';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import useVault from 'src/hooks/useVault';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { useUSDTWallets } from 'src/hooks/useUSDTWallets';
import {
  getAvailableBalanceUSDTWallet,
  USDTWallet,
} from 'src/services/wallets/factories/USDTWalletFactory';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import HexagonIcon from 'src/components/HexagonIcon';
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
import { resetRealyVaultState } from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';
import WalletHeader from 'src/components/WalletHeader';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

enum PasswordMode {
  DEFAULT = 'DEFAULT',
  SHOWALL = 'SHOWALL',
}
function ListItem({
  title,
  subtitle,
  balance,
  visibilityToggle,
  isHidden,
  onDelete,
  icon,
  type,
  isWatchOnly,
}) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const HexagonIconColor = ThemedColor({ name: 'HexagonIcon' });

  const isUSDTWallet = type === EntityKind.USDT_WALLET;

  return (
    <Box
      backgroundColor={`${colorMode}.seashellWhite`}
      style={styles.walletInfoContainer}
      borderColor={`${colorMode}.separator`}
    >
      <Box style={styles.textContainer}>
        <HexagonIcon width={44} height={38} backgroundColor={HexagonIconColor} icon={icon} />
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
          {isUSDTWallet ? (
            <UsdtWalletLogo width={16} height={16} />
          ) : (
            getCurrencyIcon(BTC, privateTheme ? 'light' : 'green')
          )}
          <Text fontSize={15} color={`${colorMode}.primaryText`}>
            {isUSDTWallet ? ` ${balance} USDT` : ` ${getBalance(balance)} ${getSatUnit()}`}
          </Text>
        </Box>
        <HStack>
          {isHidden &&
            (type == 'VAULT' ||
              (type == 'WALLET' && (balance === 0 || isWatchOnly)) ||
              isUSDTWallet) && (
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
  );
}

function ManageWallets() {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings, error: errorText, common, wallet: walletText } = translations;

  const { wallets } = useWallets({ getAll: true });

  const {
    usdtWallets,
    updateWallet: updateUSDTWallet,
    deleteWallet: deleteUSDTWallet,
  } = useUSDTWallets({
    getAll: true,
    includeHidden: true,
  });

  const { allVaults } = useVault({ includeArchived: false });
  const allWallets: (Wallet | Vault | USDTWallet)[] = [
    ...wallets,
    ...allVaults,
    ...usdtWallets,
  ].filter((item) => item !== null);
  const [showAll, setshowAll] = useState(false);
  const [showAllForced, setShowAllForced] = useState(false);
  const [passwordMode, setPasswordMode] = useState(PasswordMode.DEFAULT);

  const visibleWallets = allWallets.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.DEFAULT
  );

  const hiddenWallets = allWallets.filter(
    (wallet) => wallet.presentationData.visibility === VisibilityType.HIDDEN
  );

  const [showDeleteVaultBalanceAlert, setShowDeleteVaultBalanceAlert] = useState(false);
  const [confirmPassVisible, setConfirmPassVisible] = useState(false);
  const [confirmPasscodeVisible, setConfirmPasscodeVisible] = useState(false);

  const { relayVaultError, relayVaultUpdate } = useAppSelector((state) => state.bhr);

  const { isOnL2Above } = usePlan();
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const { showToast } = useToastMessage();
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);

  useEffect(() => {
    if (selectedWallet?.id) {
      if (relayVaultUpdate) {
        showToast(errorText.vaultDeleted, <TickIcon />);
      }
      if (relayVaultError) {
        showToast(errorText.failedToDeleteVault, <ToastErrorIcon />);
      }
      dispatch(resetRealyVaultState());
    }
  }, [relayVaultUpdate, relayVaultError]);

  const isWallet = selectedWallet?.entityKind === EntityKind.WALLET;
  const isUSDTWallet = selectedWallet?.entityKind === EntityKind.USDT_WALLET;

  const onProceed = () => {
    if (passwordMode === PasswordMode.DEFAULT) {
      updateWalletVisibility(selectedWallet, false);
      showToast(errorText.walletUnhidden, <TickIcon />);
    }
    if (passwordMode === PasswordMode.SHOWALL) {
      setshowAll(true);
      showToast(errorText.showingAllWallets, <TickIcon />);
    }
  };

  const onForceProceed = () => {
    if (passwordMode === PasswordMode.SHOWALL) {
      setShowAllForced(true);
      showToast(errorText.showingHiddenWallets, <TickIcon />);
    }
  };

  const deleteSelectedEntity = async () => {
    if (selectedWallet && selectedWallet.entityKind === EntityKind.VAULT) {
      dispatch(deleteVault(selectedWallet.id));
    }
    if (selectedWallet && selectedWallet.entityKind === EntityKind.WALLET) {
      dispatch(deleteAppImageEntity({ walletIds: [selectedWallet.id] }));
      showToast(errorText.waletDeleted, <TickIcon />);
    }
    if (selectedWallet && selectedWallet.entityKind === EntityKind.USDT_WALLET) {
      const success = await deleteUSDTWallet(selectedWallet.id);
      if (success) showToast(errorText.waletDeleted, <TickIcon />);
      else showToast('Failed to delete USDT wallet', <ToastErrorIcon />);
    }
  };

  const updateWalletVisibility = async (wallet: Wallet | Vault | USDTWallet, hide: boolean) => {
    const { id, entityKind } = wallet;
    const isWallet = entityKind === EntityKind.WALLET;
    const isUSDTWallet = entityKind === EntityKind.USDT_WALLET;

    setSelectedWallet(wallet);

    try {
      const visibilityType = hide ? VisibilityType.HIDDEN : VisibilityType.DEFAULT;

      if (isUSDTWallet) {
        // case: USDT wallet update
        const updatedUSDTWallet = {
          ...(wallet as USDTWallet),
          presentationData: {
            ...wallet.presentationData,
            visibility: visibilityType,
          },
        };
        await updateUSDTWallet(updatedUSDTWallet);
      } else {
        // case: regular wallet/vault update
        const schema = isWallet ? RealmSchema.Wallet : RealmSchema.Vault;
        dbManager.updateObjectById(schema, id, {
          presentationData: {
            name: wallet.presentationData.name,
            description: wallet.presentationData.description,
            visibility: visibilityType,
          },
        });
      }
    } catch (error) {
      captureError(error);
    }
  };

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else if (wallet.entityKind === EntityKind.USDT_WALLET) {
      return <UsdtWalletLogo />;
    } else {
      return <WalletIcon />;
    }
  };

  const getWalletBalance = (wallet) => {
    if (wallet.entityKind === EntityKind.USDT_WALLET) {
      return getAvailableBalanceUSDTWallet(wallet);
    } else {
      return wallet.specs.balances.confirmed + wallet.specs.balances.unconfirmed;
    }
  };

  const isWatchOnly = (wallet: Wallet | Vault | USDTWallet): boolean => {
    if (wallet.entityKind === EntityKind.USDT_WALLET) {
      return false; // USDT wallets are never watch-only
    }
    return wallet.entityKind === 'WALLET' && (wallet as Wallet).specs.xpriv === null;
  };

  function DeleteVaultBalanceAlertModalContent() {
    const isWallet = selectedWallet?.entityKind === EntityKind.WALLET;
    const isUSDTWallet = selectedWallet?.entityKind === EntityKind.USDT_WALLET;
    return (
      <Box style={styles.modalContainer}>
        <Text color={`${colorMode}.secondaryText`} style={styles.unhideText}>
          {isWallet
            ? settings.DeleteWalletModalDesc
            : isUSDTWallet
            ? 'Are you sure you want to delete this USDT wallet? Please move your funds first.'
            : settings.DeleteVaultModalDesc}
        </Text>
        <Box style={styles.BalanceModalContainer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => {
              if (isWallet || isUSDTWallet) {
                // Cancel action
                updateWalletVisibility(selectedWallet, true);
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
              {isWallet || isUSDTWallet ? common.cancel : common.continue}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="manageWallets_moveFunds"
            onPress={() => {
              setShowDeleteVaultBalanceAlert(false);

              if (isUSDTWallet) {
                // navigation.navigate('usdtDetails', { usdtWalletId: selectedWallet.id }); // navigation crashing
                showToast(
                  'Please move your funds and empty this USDT wallet first',
                  <ToastErrorIcon />
                );
              } else if (selectedWallet.type === VaultType.MINISCRIPT) {
                try {
                  selectVaultSpendingPaths();
                } catch (err) {
                  showToast(err, <ToastErrorIcon />);
                }
              } else {
                navigation.dispatch(
                  CommonActions.navigate('Send', {
                    sender: selectedWallet,
                    parentScreen: MANAGEWALLETS,
                  })
                );
              }
            }}
          >
            <Shadow distance={10} startColor="#073E3926" offset={[3, 4]}>
              <Box style={styles.createBtn} backgroundColor={`${colorMode}.pantoneGreen`}>
                <Text
                  numberOfLines={1}
                  style={styles.btnText}
                  color={`${colorMode}.buttonText`}
                  bold
                >
                  {walletText.MoveFunds}
                </Text>
              </Box>
            </Shadow>
          </TouchableOpacity>
        </Box>
      </Box>
    );
  }

  const selectVaultSpendingPaths = async () => {
    if (miniscriptPathSelectorRef.current) {
      await miniscriptPathSelectorRef.current.selectVaultSpendingPaths();
    }
  };

  const handlePathSelected = (miniscriptSelectedSatisfier) => {
    navigation.dispatch(
      CommonActions.navigate('Send', {
        sender: selectedWallet,
        parentScreen: MANAGEWALLETS,
        miniscriptSelectedSatisfier,
      })
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={settings.ManageWalletsTitle} subTitle={settings.ManageWalletsSub} />
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
              balance={getWalletBalance(item)}
              isHidden={item.presentationData.visibility === VisibilityType.HIDDEN}
              isWatchOnly={isWatchOnly(item)}
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
                if (getWalletBalance(item) > 0 && !isWatchOnly(item)) {
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
          {showAll || showAllForced ? walletText.hideHiddenWallets : walletText.showHiddenWallets}
        </Text>
      </Pressable>
      <KeeperModal
        dismissible
        close={() => {
          setShowDeleteVaultBalanceAlert(false);
          (isWallet || isUSDTWallet) && updateWalletVisibility(selectedWallet, true);
        }}
        visible={showDeleteVaultBalanceAlert}
        title={
          isWallet
            ? settings.DeleteWalletModalTitle
            : isUSDTWallet
            ? 'Delete USDT Wallet'
            : settings.DeleteVaultModalTitle
        }
        subTitle={
          isWallet
            ? settings.DeleteWalletModalSubTitle
            : isUSDTWallet
            ? 'This action cannot be undone'
            : settings.DeleteVaultModalSubTitle
        }
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={DeleteVaultBalanceAlertModalContent}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonTextColor={`${colorMode}.buttonText`}
        subTitleWidth={wp(240)}
        closeOnOverlayClick={isWallet || isUSDTWallet ? false : true}
        showCloseIcon={false}
      />
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={true}
        close={() => setConfirmPassVisible(false)}
        showCloseIcon={false}
        title={settings.EnterPasscodeTitle}
        subTitleWidth={wp(240)}
        subTitle={settings.confirmPasscodetounhide}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
        title={settings.EnterPasscodeTitle}
        subTitleWidth={wp(240)}
        subTitle={settings.confirmPasscodetodelete}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
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
      {selectedWallet && (
        <MiniscriptPathSelector
          ref={miniscriptPathSelectorRef}
          vault={selectedWallet}
          onPathSelected={handlePathSelected}
          onError={(err) => showToast(err, <ToastErrorIcon />)}
          onCancel={() => {}}
        />
      )}
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
    borderWidth: 1,
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
