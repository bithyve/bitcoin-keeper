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
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import WalletSmallIcon from 'src/assets/images/daily-wallet-small.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import CollaborativeSmallIcon from 'src/assets/images/collaborative-icon-small.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import VaultSmallIcon from 'src/assets/images/vault-icon-small.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import RemoveIcon from 'src/assets/images/remove-green-icon.svg';
import RemoveIconDark from 'src/assets/images/remove-white-icon.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import { EntityKind, NetworkType, PaymentInfoKind, VaultType } from 'src/services/wallets/enums';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { TransferType } from 'src/models/enums/TransferType';
import { Vault } from 'src/services/wallets/interfaces/vault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletOperations from 'src/services/wallets/operations';
import { UTXO } from 'src/services/wallets/interfaces';
import HexagonIcon from 'src/components/HexagonIcon';
import idx from 'idx';
import Buttons from 'src/components/Buttons';
import LoginMethod from 'src/models/enums/LoginMethod';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import PendingHealthCheckModal from 'src/components/PendingHealthCheckModal';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScannerIcon from 'src/assets/images/scanner-icon.svg';
import ScannerIconDark from 'src/assets/images/scanner-icon-white.svg';
function SendScreen({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  const { sender, selectedUTXOs, parentScreen } = route.params as {
    sender: Wallet | Vault;
    selectedUTXOs?: UTXO[];
    parentScreen?: string;
  };
  const [showNote, setShowNote] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [paymentInfo, setPaymentInfo] = useState('');
  const [note, setNote] = useState('');
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
  const availableBalance =
    sender.networkType === NetworkType.MAINNET
      ? sender.specs.balances.confirmed
      : sender.specs.balances.confirmed + sender.specs.balances.unconfirmed;
  const avgFees = useAppSelector((state) => state.network.averageTxFees);

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
        showToast('Cannot send via Watch-only wallet', <ToastErrorIcon />);
        navigation.goBack();
      }
    }
  }, [sender]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setShowNote(false);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setShowNote(true);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
  };

  const navigateToNext = (
    address: string,
    transferType: TransferType,
    amount?: string,
    recipient?: Wallet | Vault
  ) => {
    if (!avgFees) {
      showToast("Average transaction fees couldn't be fetched!");
      return;
    }

    navigation.dispatch(
      CommonActions.navigate('AddSendAmount', {
        sender,
        recipient,
        address,
        amount,
        note,
        transferType,
        selectedUTXOs,
        parentScreen,
      })
    );
  };

  const handleScannerPress = () => {
    if (!selectedWallet) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'ScanQR',
          params: {
            title: 'Scan Address',
            subtitle: 'Please scan until all the QR data has been retrieved',
            onQrScan,
          },
        })
      );
    }
  };
  const handleSelectWalletPress = () => {
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
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
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

  const onQrScan = async (qrData, resetQR) => {
    try {
      setPaymentInfo(qrData);
      navigation.goBack();
      resetQR();
    } catch (error) {
      showToast('Invalid bitcoin address', <ToastErrorIcon />);
    }
  };

  const validateAddress = (info: string) => {
    info = info.trim();
    let { type: paymentInfoKind, address, amount } = WalletUtilities.addressDiff(info, network);
    amount = satsEnabled ? Math.trunc(amount * 1e8) : amount;

    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        const type =
          sender?.entityKind === EntityKind.VAULT
            ? TransferType.VAULT_TO_ADDRESS
            : TransferType.WALLET_TO_ADDRESS;
        setPaymentInfo('');
        navigateToNext(address, type, amount ? amount.toString() : null, null);
        break;
      case PaymentInfoKind.PAYMENT_URI:
        const transferType =
          sender?.entityKind === EntityKind.VAULT
            ? TransferType.VAULT_TO_ADDRESS
            : TransferType.WALLET_TO_ADDRESS;
        setPaymentInfo('');
        navigateToNext(address, transferType, amount ? amount.toString() : null, null);
        break;
      default:
        Keyboard.dismiss();
        showToast('Invalid bitcoin address', <ToastErrorIcon />);
    }
  };
  const handleProceed = (skipHealthCheck = false) => {
    if (selectedWallet) {
      if (selectedWallet.entityKind === EntityKind.VAULT) {
        if (sender.entityKind === EntityKind.VAULT) {
          navigateToNext(
            WalletOperations.getNextFreeAddress(selectedWallet),
            TransferType.VAULT_TO_VAULT,
            null,
            selectedWallet
          );
        } else if (sender.entityKind === EntityKind.WALLET) {
          if (!skipHealthCheck && pendingHealthCheckCount >= selectedWallet.scheme.m) {
            setShowHealthCheckModal(true);
          } else {
            navigateToNext(
              WalletOperations.getNextFreeAddress(selectedWallet),
              TransferType.VAULT_TO_WALLET,
              null,
              selectedWallet
            );
          }
        }
      } else if (selectedWallet.entityKind === EntityKind.WALLET) {
        if (sender.entityKind === EntityKind.VAULT) {
          navigateToNext(
            WalletOperations.getNextFreeAddress(selectedWallet),
            TransferType.WALLET_TO_VAULT,
            null,
            selectedWallet
          );
        } else if (sender.entityKind === EntityKind.WALLET) {
          navigateToNext(
            WalletOperations.getNextFreeAddress(selectedWallet),
            TransferType.WALLET_TO_WALLET,
            null,
            selectedWallet
          );
        }
      }
    } else if (paymentInfo) {
      try {
        validateAddress(paymentInfo);
      } catch (error) {
        showToast('Invalid bitcoin address', <ToastErrorIcon />);
      }
    } else {
      showToast('Please select a wallet or vault');
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader
          title="Sending from"
          subtitle={sender.presentationData.name}
          subTitleSize={16}
          icon={
            <HexagonIcon
              width={44}
              height={38}
              backgroundColor={isDarkMode ? Colors.DullGreenDark : Colors.pantoneGreen}
              icon={getWalletIcon(sender)}
            />
          }
          availableBalance={
            <CurrencyInfo
              hideAmounts={false}
              amount={availableBalance}
              fontSize={16}
              satsFontSize={12}
              color={`${colorMode}.primaryText`}
              variation={!isDarkMode ? 'dark' : 'light'}
            />
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
                placeholder="Enter Address"
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
                  <Pressable onPress={handleScannerPress}>
                    <Box style={styles.scannerContainer}>
                      {isDarkMode ? <ScannerIconDark /> : <ScannerIcon />}
                    </Box>
                  </Pressable>
                }
              />
              <KeeperTextInput
                testID="input_receive_address"
                placeholder="Add a note (Optional)"
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
              <Box style={styles.sendToWalletContainer}>
                <Pressable onPress={handleSelectWalletPress}>
                  <Box
                    flexDirection={'row'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    style={styles.sendToWalletWrapper}
                  >
                    <Text color={`${colorMode}.primaryText`}>Send to one of your wallets</Text>
                    {!selectedWallet ? (
                      <ArrowIcon />
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
                      flexDirection={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                      style={styles.sendToWalletWrapper}
                    >
                      <Box style={styles.walletDetails}>
                        <Box>
                          <HexagonIcon
                            width={29}
                            height={26}
                            icon={getSmallWalletIcon(selectedWallet)}
                            backgroundColor={
                              isDarkMode ? Colors.DullGreenDark : Colors.pantoneGreen
                            }
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

      <Box style={styles.noteWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
        {showNote && (
          <Note
            title={sender.entityKind === EntityKind.VAULT ? 'Security Tip' : common.note}
            subtitle={
              sender.entityKind === EntityKind.VAULT
                ? 'Check the send-to address on a signer you are going to use to sign the transaction.'
                : 'Make sure the address or QR is the one where you want to send the funds to'
            }
            subtitleColor="GreyText"
          />
        )}
        <Box style={styles.proceedButton}>
          <Buttons primaryCallback={handleProceed} primaryText={common.proceed} fullWidth />
        </Box>
      </Box>

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
  noteWrapper: {
    marginLeft: wp(20),
    marginBottom: hp(10),
    paddingHorizontal: wp(11),
    position: 'absolute',
    bottom: windowHeight > 680 ? hp(15) : hp(8),
    width: '100%',
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(10) : hp(10),
  },
  proceedButton: {
    marginVertical: 5,
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
});
export default Sentry.withErrorBoundary(SendScreen, errorBourndaryOptions);
