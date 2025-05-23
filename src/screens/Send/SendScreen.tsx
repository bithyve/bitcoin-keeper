import {
  InteractionManager,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import WalletSmallIcon from 'src/assets/images/daily-wallet-small.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import AssistedIcon from 'src/assets/images/assisted-vault-white-icon.svg';
import CollaborativeSmallIcon from 'src/assets/images/collaborative-icon-small.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import VaultSmallIcon from 'src/assets/images/vault-icon-small.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import RemoveIcon from 'src/assets/images/remove-green-icon.svg';
import RemoveIconDark from 'src/assets/images/remove-white-icon.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { EntityKind, PaymentInfoKind, VaultType, VisibilityType } from 'src/services/wallets/enums';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions, StackActions } from '@react-navigation/native';
import { MiniscriptTxSelectedSatisfier, Vault } from 'src/services/wallets/interfaces/vault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletOperations from 'src/services/wallets/operations';
import { UTXO } from 'src/services/wallets/interfaces';
import idx from 'idx';
import Buttons from 'src/components/Buttons';
import LoginMethod from 'src/models/enums/LoginMethod';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import PendingHealthCheckModal from 'src/components/PendingHealthCheckModal';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScannerIcon from 'src/assets/images/scanner-icon.svg';
import ScannerIconDark from 'src/assets/images/scanner-icon-white.svg';
import useWallets from 'src/hooks/useWallets';
import useVault from 'src/hooks/useVault';
import { SentryErrorBoundary } from 'src/services/sentry';
import IconSettings from 'src/assets/images/settings.svg';
import IconGreySettings from 'src/assets/images/settings_grey.svg';
import { TouchableOpacity } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { NumberInput } from '../AddWalletScreen/AddNewWallet';
import WalletHeader from 'src/components/WalletHeader';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import HexagonIcon from 'src/components/HexagonIcon';

function SendScreen({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { wallets } = useWallets({ getAll: true });
  const { allVaults: vaults } = useVault({});
  const allWallets = useMemo(() => [...wallets, ...vaults], [wallets, vaults]);
  const [isSendToWalletDisabled, setIsSendToWalletDisabled] = useState(false);
  const {
    sender,
    selectedUTXOs = [],
    parentScreen,
    isSendMax,
    internalRecipientWallet,
    internalRecipients = [],
    recipients: finalRecipients = [],
    totalRecipients = 1,
    currentRecipientIdx = 1,
    note: txNote = '',
    miniscriptSelectedSatisfier = null,
  } = route.params as {
    sender: Wallet | Vault;
    selectedUTXOs?: UTXO[];
    parentScreen?: string;
    isSendMax?: boolean;
    internalRecipientWallet?: Wallet | Vault;
    internalRecipients: (Wallet | Vault)[];
    recipients?: Array<{
      address: string;
      amount: number;
      name?: string;
    }>;
    totalRecipients: number;
    currentRecipientIdx: number;
    note: string;
    miniscriptSelectedSatisfier?: MiniscriptTxSelectedSatisfier;
  };

  const { translations } = useContext(LocalizationContext);
  const { common, error: errorTranslation, wallet: walletTranslation, settings } = translations;
  const [paymentInfo, setPaymentInfo] = useState('');
  const [note, setNote] = useState(txNote);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | Vault>(null);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const network = WalletUtilities.getNetworkByType(sender.networkType);
  const { satsEnabled }: { loginMethod: LoginMethod; satsEnabled: boolean } = useAppSelector(
    (state) => state.settings
  );
  const isSmallDevice = useIsSmallDevices();
  const { signerMap } = useSignerMap();
  const { signers: vaultKeys } = selectedWallet || { signers: [] };
  const { vaultSigners: keys } = useSigners(
    selectedWallet?.entityKind === EntityKind.VAULT ? selectedWallet?.id : ''
  );
  const [pendingHealthCheckCount, setPendingHealthCheckCount] = useState(0);
  const isDarkMode = colorMode === 'dark';
  const availableBalance = sender.specs.balances.confirmed + sender.specs.balances.unconfirmed;
  const avgFees = useAppSelector((state) => state.network.averageTxFees);
  const totalUtxosAmount = selectedUTXOs?.reduce((sum, utxo) => sum + utxo.value, 0);
  const [showAdvancedSettingsModal, setShowAdvancedSettingsModal] = useState(false);
  const [localTotalRecipients, setLocalTotalRecipients] = useState(totalRecipients);
  const HexagonIconColor = ThemedColor({ name: 'HexagonIcon' });

  const visibleWallets = useMemo(
    () =>
      allWallets.filter(
        (wallet) =>
          wallet.presentationData.visibility !== VisibilityType.HIDDEN && wallet.id !== sender.id
      ),
    [allWallets, sender.id]
  );

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      dispatch(sendPhasesReset());
    });
  }, []);

  useEffect(() => {
    if (sender.entityKind === EntityKind.WALLET) {
      // disabling send flow for watch-only wallets
      const isWatchOnly = !idx(sender as Wallet, (_) => _.specs.xpriv);
      if (isWatchOnly) {
        showToast(errorTranslation.cannotSendViaWatchOnly, <ToastErrorIcon />);
        navigation.goBack();
      }
    }
    if (sender.entityKind === EntityKind.VAULT) {
      if ((sender as Vault).isMigrating) {
        const newVault = vaults
          .reverse()
          .find(
            (vault) =>
              vault.id !== sender.id &&
              !vault.archived &&
              vault.archivedId === (sender as Vault).archivedId
          );
        if (newVault) {
          showToast(errorTranslation.automaticallySelected);
          handleSelectWallet(newVault);
        }
      }
    }
  }, [sender]);

  useEffect(() => {
    setIsSendToWalletDisabled(visibleWallets.length <= 0);
  }, [visibleWallets]);

  useEffect(() => {
    if (internalRecipientWallet) handleSelectWallet(internalRecipientWallet);
  }, [internalRecipientWallet]);

  const handleSelectWallet = (wallet) => {
    setPaymentInfo('');
    setSelectedWallet(wallet);
  };

  const navigateToNext = (address: string, amount?: string, recipient?: Wallet | Vault) => {
    if (!avgFees) {
      showToast(errorTranslation.averageFeeError);
      return;
    }

    if (finalRecipients.some((recipient) => recipient.address === address)) {
      showToast(errorTranslation.cannotSelectSameAddress);
      return;
    }

    internalRecipients[currentRecipientIdx - 1] = recipient;

    navigation.dispatch(
      StackActions.push('AddSendAmount', {
        sender,
        internalRecipients,
        address,
        amount,
        note,
        selectedUTXOs,
        totalUtxosAmount,
        parentScreen,
        isSendMax,
        recipients: finalRecipients,
        totalRecipients: localTotalRecipients,
        currentRecipientIdx,
        miniscriptSelectedSatisfier,
      })
    );
  };

  const handleSelectWalletPress = () => {
    if (isSendToWalletDisabled) {
      return;
    }

    if (!selectedWallet) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'SelectWallet',
          params: {
            sender,
            handleSelectWallet,
          },
        })
      );
    } else {
      setSelectedWallet(null);
    }
  };

  const navigateToSelectWallet = () => {
    navigation.dispatch(
      CommonActions.navigate('SelectWallet', {
        sender,
        handleSelectWallet,
        selectedWalletIdFromParams: selectedWallet?.id,
      })
    );
  };
  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
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

  const getSmallWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? (
        <CollaborativeSmallIcon />
      ) : (
        <VaultSmallIcon />
      );
    } else {
      return <WalletSmallIcon />;
    }
  };

  const onQrScan = async (qrData) => {
    try {
      const { address } = WalletUtilities.addressDiff(qrData, network);
      if (address) {
        setPaymentInfo(qrData);
      } else {
        setPaymentInfo('');
        showToast(errorTranslation.invalidBitCoinAddress, <ToastErrorIcon />);
      }
      navigation.goBack();
    } catch (error) {
      showToast(errorTranslation.invalidBitCoinAddress, <ToastErrorIcon />);
      showToast(error.message, <ToastErrorIcon />);
    }
  };

  const validateAddress = (info: string) => {
    info = info.trim();
    let { type: paymentInfoKind, address, amount } = WalletUtilities.addressDiff(info, network);
    amount = satsEnabled ? Math.trunc(amount * 1e8) : amount;

    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        navigateToNext(address, amount ? amount.toString() : null, null);
        break;
      case PaymentInfoKind.PAYMENT_URI:
        navigateToNext(address, amount ? amount.toString() : null, null);
        break;
      default:
        Keyboard.dismiss();
        showToast(errorTranslation.invalidBitCoinAddress, <ToastErrorIcon />);
    }
  };
  const handleProceed = (skipHealthCheck = false) => {
    if (selectedWallet) {
      if (
        selectedWallet.entityKind === EntityKind.VAULT &&
        !skipHealthCheck &&
        pendingHealthCheckCount >= (selectedWallet as Vault).scheme.m
      ) {
        setShowHealthCheckModal(true);
      } else {
        navigateToNext(WalletOperations.getNextFreeAddress(selectedWallet), null, selectedWallet);
      }
    } else if (paymentInfo) {
      try {
        validateAddress(paymentInfo);
      } catch (error) {
        showToast(errorTranslation.invalidBitCoinAddress, <ToastErrorIcon />);
      }
    } else {
      showToast(errorTranslation.selectWalletOrVault);
    }
  };

  const updateTotalRecipients = (newValue: number) => {
    setLocalTotalRecipients(newValue);
    navigation.setParams({
      ...route.params,
      totalRecipients: newValue,
    });
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <WalletHeader
          title={walletTranslation.sendingTo}
          subTitle={walletTranslation.enterRecipientAddress}
          rightComponent={
            currentRecipientIdx === 1 && (
              <TouchableOpacity
                onPress={() => setShowAdvancedSettingsModal(true)}
                style={{ marginRight: wp(15) }}
              >
                {colorMode === 'light' ? <IconGreySettings /> : <IconSettings />}
              </TouchableOpacity>
            )
          }
        />

        <ScrollView
          style={styles.scrollViewWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isSmallDevice && { paddingBottom: hp(100) }}
        >
          <Box style={styles.container}>
            <Box style={styles.inputWrapper}>
              <KeeperTextInput
                testID="input_receive_address"
                placeholder={walletTranslation.enterAddress}
                inpuBackgroundColor={`${colorMode}.textInputBackground`}
                inpuBorderColor={`${colorMode}.dullGreyBorder`}
                height={50}
                value={paymentInfo}
                onChangeText={(data: string) => {
                  setPaymentInfo(data);
                }}
                paddingLeft={5}
                isDisabled={selectedWallet}
                InputRightComponent={
                  <Pressable
                    onPress={() => {
                      if (!selectedWallet) {
                        navigation.dispatch(
                          CommonActions.navigate({
                            name: 'ScanQR',
                            params: {
                              title: walletTranslation.scanAddress,
                              subtitle: walletTranslation.recipientAddress,
                              onQrScan,
                              importOptions: false,
                              isSingning: true,
                            },
                          })
                        );
                      }
                    }}
                  >
                    <Box style={styles.scannerContainer}>
                      {isDarkMode ? <ScannerIconDark /> : <ScannerIcon />}
                    </Box>
                  </Pressable>
                }
              />
              {finalRecipients.length === 0 && (
                <KeeperTextInput
                  testID="input_receive_address"
                  placeholder={`${common.addNote} (${common.optional})`}
                  inpuBackgroundColor={`${colorMode}.textInputBackground`}
                  inpuBorderColor={`${colorMode}.dullGreyBorder`}
                  height={50}
                  value={note}
                  onChangeText={(text: string) => {
                    setNote(text);
                  }}
                  blurOnSubmit={true}
                  paddingLeft={5}
                />
              )}

              <Box style={styles.sendToWalletContainer}>
                <Pressable onPress={handleSelectWalletPress} disabled={isSendToWalletDisabled}>
                  <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    style={[
                      styles.sendToWalletWrapper,
                      isSendToWalletDisabled && styles.disabledButton,
                    ]}
                  >
                    <Text color={`${colorMode}.primaryText`}>Send to one of your wallets</Text>
                    {!selectedWallet ? (
                      <ArrowIcon opacity={isSendToWalletDisabled ? 0.5 : 1} />
                    ) : isDarkMode ? (
                      <RemoveIconDark />
                    ) : (
                      <RemoveIcon />
                    )}
                  </Box>
                </Pressable>
                {selectedWallet && (
                  <Pressable onPress={navigateToSelectWallet}>
                    <Box
                      flexDirection="row"
                      justifyContent="space-between"
                      alignItems="center"
                      style={styles.sendToWalletWrapper}
                    >
                      <Box style={styles.walletDetails}>
                        <Box>
                          <HexagonIcon
                            width={29}
                            height={26}
                            icon={getSmallWalletIcon(selectedWallet)}
                            backgroundColor={HexagonIconColor}
                          />
                        </Box>
                        <Text color={`${colorMode}.primaryText`}>
                          {selectedWallet?.presentationData.name}
                        </Text>
                      </Box>
                      <Text color={`${colorMode}.greenText`}>Change Wallet</Text>
                    </Box>
                  </Pressable>
                )}
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      <Box backgroundColor={`${colorMode}.primaryBackground`}>
        <Buttons
          primaryCallback={handleProceed}
          primaryText={common.proceed}
          primaryDisable={!paymentInfo.trim() && !selectedWallet}
          fullWidth
        />
      </Box>

      <KeeperModal
        visible={showAdvancedSettingsModal}
        title={settings.SingerSettingsTitle}
        close={() => setShowAdvancedSettingsModal(false)}
        buttonText={common.done}
        buttonCallback={() => {
          setShowAdvancedSettingsModal(false);
        }}
        secondaryButtonText={common.cancel}
        Content={() => (
          <Box>
            <Text>{settings.numberOfRecipients}</Text>
            <NumberInput
              value={localTotalRecipients}
              onDecrease={() => {
                if (localTotalRecipients > 1) {
                  updateTotalRecipients(localTotalRecipients - 1);
                }
              }}
              onIncrease={() => {
                if (localTotalRecipients < 50) {
                  updateTotalRecipients(localTotalRecipients + 1);
                }
              }}
            />
          </Box>
        )}
      />

      <PendingHealthCheckModal
        selectedItem={selectedWallet}
        vaultKeys={vaultKeys}
        signerMap={signerMap}
        keys={keys}
        showHealthCheckModal={showHealthCheckModal}
        setShowHealthCheckModal={setShowHealthCheckModal}
        pendingHealthCheckCount={pendingHealthCheckCount}
        setPendingHealthCheckCount={setPendingHealthCheckCount}
        primaryButtonCallback={() => {
          setShowHealthCheckModal(false);
          handleProceed(true);
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: hp(30),
  },
  scrollViewWrapper: {
    flex: 1,
  },
  inputWrapper: {
    alignSelf: 'center',
    width: '100%',
    paddingLeft: wp(11),
    paddingRight: wp(21),
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(70),
    width: '95%',
    borderRadius: hp(10),
    marginHorizontal: wp(10),
    paddingHorizontal: wp(25),
    marginTop: hp(5),
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(10) : hp(10),
  },
  scannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(11),
    paddingVertical: hp(14),
  },
  walletDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sendToWalletContainer: {
    gap: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
export default SentryErrorBoundary(SendScreen);
