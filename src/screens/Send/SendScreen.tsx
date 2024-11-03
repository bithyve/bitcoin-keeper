import {
  FlatList,
  InteractionManager,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
// libraries
import { Box, useColorMode, View } from 'native-base';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { hp, windowHeight, wp } from 'src/constants/responsive';

import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import {
  EntityKind,
  NetworkType,
  PaymentInfoKind,
  VaultType,
  VisibilityType,
} from 'src/services/wallets/enums';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { TransferType } from 'src/models/enums/TransferType';
import { Vault } from 'src/services/wallets/interfaces/vault';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletOperations from 'src/services/wallets/operations';
import useWallets from 'src/hooks/useWallets';
import { UTXO } from 'src/services/wallets/interfaces';
import useVault from 'src/hooks/useVault';
import HexagonIcon from 'src/components/HexagonIcon';
import idx from 'idx';
import EmptyWalletIcon from 'src/assets/images/empty_wallet_illustration.svg';
import Buttons from 'src/components/Buttons';
import LoginMethod from 'src/models/enums/LoginMethod';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import useSignerMap from 'src/hooks/useSignerMap';
import useSigners from 'src/hooks/useSigners';
import PendingHealthCheckModal from 'src/components/PendingHealthCheckModal';
import Clipboard from '@react-native-community/clipboard';
import QRScanner from 'src/components/QRScanner';
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const network = WalletUtilities.getNetworkByType(sender.networkType);
  const { wallets } = useWallets({ getAll: true });
  const { allVaults } = useVault({ includeArchived: false });
  const otherWallets: (Wallet | Vault)[] = [...wallets, ...allVaults].filter(
    (item) =>
      item && item.presentationData.visibility !== VisibilityType.HIDDEN && item.id !== sender.id
  );

  const { satsEnabled }: { loginMethod: LoginMethod; satsEnabled: boolean } = useAppSelector(
    (state) => state.settings
  );
  const isSmallDevice = useIsSmallDevices();
  const { signerMap } = useSignerMap();
  const { signers: vaultKeys } = selectedItem || { signers: [] };
  const { vaultSigners: keys } = useSigners(
    selectedItem?.entityKind === EntityKind.VAULT ? selectedItem?.id : ''
  );
  const [pendingHealthCheckCount, setPendingHealthCheckCount] = useState(0);
  const prevTextRef = useRef('');

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

  const avgFees = useAppSelector((state) => state.network.averageTxFees);

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

    navigation.navigate('AddSendAmount', {
      sender,
      recipient,
      address,
      amount,
      transferType,
      selectedUTXOs,
      parentScreen,
    });
  };

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  const handleChangeText = async (text: string) => {
    setPaymentInfo(text);

    if (Math.abs(text.length - prevTextRef.current.length) > 1) {
      const clipboardContent = await Clipboard.getString();
      if (text === clipboardContent) {
        validateAddress(text);
      }
    }

    prevTextRef.current = text;
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
    if (selectedItem) {
      if (selectedItem.entityKind === EntityKind.VAULT) {
        if (sender.entityKind === EntityKind.VAULT) {
          navigateToNext(
            WalletOperations.getNextFreeAddress(selectedItem),
            TransferType.VAULT_TO_VAULT,
            null,
            selectedItem
          );
        } else if (sender.entityKind === EntityKind.WALLET) {
          if (!skipHealthCheck && pendingHealthCheckCount >= selectedItem.scheme.m) {
            setShowHealthCheckModal(true);
          } else {
            navigateToNext(
              WalletOperations.getNextFreeAddress(selectedItem),
              TransferType.VAULT_TO_WALLET,
              null,
              selectedItem
            );
          }
        }
      } else if (selectedItem.entityKind === EntityKind.WALLET) {
        if (sender.entityKind === EntityKind.VAULT) {
          navigateToNext(
            WalletOperations.getNextFreeAddress(selectedItem),
            TransferType.WALLET_TO_VAULT,
            null,
            selectedItem
          );
        } else if (sender.entityKind === EntityKind.WALLET) {
          navigateToNext(
            WalletOperations.getNextFreeAddress(selectedItem),
            TransferType.WALLET_TO_WALLET,
            null,
            selectedItem
          );
        }
      }
    } else {
      showToast('Please select a wallet or vault');
    }
  };

  const renderWallets = ({ item }: { item: Wallet }) => {
    const onPress = () => {
      setSelectedItem(item);
    };

    return (
      <Box
        justifyContent="center"
        alignItems="center"
        style={{ marginRight: wp(10) }}
        width={wp(60)}
      >
        <TouchableOpacity onPress={onPress}>
          <HexagonIcon
            width={42}
            height={36}
            backgroundColor={Colors.RussetBrown}
            icon={getWalletIcon(item)}
            showSelection={item?.id === selectedItem?.id}
          />
        </TouchableOpacity>
        <Box>
          <Text light fontSize={12} mt="1" numberOfLines={1}>
            {item.presentationData.name}
          </Text>
        </Box>
      </Box>
    );
  };

  const availableBalance =
    sender.networkType === NetworkType.MAINNET
      ? sender.specs.balances.confirmed
      : sender.specs.balances.confirmed + sender.specs.balances.unconfirmed;
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
          icon={
            <HexagonIcon
              width={44}
              height={38}
              backgroundColor={Colors.pantoneGreen}
              icon={getWalletIcon(sender)}
            />
          }
          availableBalance={
            <CurrencyInfo
              hideAmounts={false}
              amount={availableBalance}
              fontSize={14}
              color={`${colorMode}.primaryText`}
              variation={colorMode === 'light' ? 'dark' : 'light'}
            />
          }
        />
        <ScrollView
          style={styles.scrollViewWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={isSmallDevice && { paddingBottom: hp(100) }}
        >
          <Box>
            <QRScanner onScanCompleted={validateAddress} />
            <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <TextInput
                testID="input_receive_address"
                placeholder="or enter address manually"
                placeholderTextColor={Colors.Feldgrau} // TODO: change to colorMode and use native base component
                style={styles.textInput}
                value={paymentInfo}
                onChangeText={handleChangeText}
                onSubmitEditing={() => validateAddress(paymentInfo)}
                blurOnSubmit={true}
              />
            </Box>
            <Box style={styles.sendToWalletWrapper}>
              <Text
                color={`${colorMode}.headerText`}
                marginX={2}
                fontSize={14}
                letterSpacing={1.12}
              >
                or send to a wallet
              </Text>
              <View>
                <View style={styles.walletContainer} backgroundColor={`${colorMode}.seashellWhite`}>
                  <FlatList
                    data={otherWallets}
                    renderItem={renderWallets}
                    keyExtractor={(item) => item?.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={
                      <Box style={styles.emptyWalletsContainer}>
                        <EmptyWalletIcon />
                        <Box style={styles.emptyWalletText}>
                          <Text color={`${colorMode}.hexagonIconBackColor`}>
                            You don't have any wallets yet
                          </Text>
                        </Box>
                      </Box>
                    }
                  />
                </View>
              </View>
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
        selectedItem={selectedItem}
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
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
  scrollViewWrapper: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    marginTop: hp(10),
    marginHorizontal: hp(5),
    width: '98%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textInput: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: Colors.Isabelline,
    padding: 15,
    opacity: 0.5,
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
    position: 'absolute',
    bottom: windowHeight > 680 ? hp(15) : hp(8),
    width: '100%',
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(10) : hp(10),
  },
  emptyWalletsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWalletText: {
    position: 'absolute',
    width: 100,
    opacity: 0.8,
  },
  proceedButton: {
    marginVertical: 5,
  },
});
export default Sentry.withErrorBoundary(SendScreen, errorBourndaryOptions);
