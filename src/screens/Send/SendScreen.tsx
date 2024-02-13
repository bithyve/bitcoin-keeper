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
import React, { useContext, useEffect, useState } from 'react';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { QRreader } from 'react-native-qr-decode-image-camera';

import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';

import { LocalizationContext } from 'src/context/Localization/LocContext';
import Note from 'src/components/Note/Note';
import { EntityKind, PaymentInfoKind, VaultType, VisibilityType } from 'src/core/wallets/enums';
import { RNCamera } from 'react-native-camera';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { TransferType } from 'src/models/enums/TransferType';
import { Vault } from 'src/core/wallets/interfaces/vault';
import UploadImage from 'src/components/UploadImage';
import useToastMessage from 'src/hooks/useToastMessage';
import CameraUnauthorized from 'src/components/CameraUnauthorized';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletOperations from 'src/core/wallets/operations';
import useWallets from 'src/hooks/useWallets';
import { UTXO } from 'src/core/wallets/interfaces';
import useVault from 'src/hooks/useVault';
import HexagonIcon from 'src/components/HexagonIcon';
import EmptyWalletIcon from 'src/assets/images/empty_wallet_illustration.svg';

function SendScreen({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  const { sender, selectedUTXOs } = route.params as {
    sender: Wallet | Vault;
    selectedUTXOs?: UTXO[];
  };

  const [showNote, setShowNote] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [paymentInfo, setPaymentInfo] = useState('');

  const network = WalletUtilities.getNetworkByType(sender.networkType);
  const { wallets } = useWallets({ getAll: true });
  const { allVaults } = useVault({ includeArchived: false });
  const nonHiddenWallets = wallets.filter(
    (wallet) => wallet.presentationData.visibility !== VisibilityType.HIDDEN
  );
  const allWallets: (Wallet | Vault)[] = [...nonHiddenWallets, ...allVaults].filter(
    (item) => item !== null
  );
  const otherWallets = allWallets.filter((existingWallet) => existingWallet.id !== sender.id);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      dispatch(sendPhasesReset());
    });
  }, []);

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

  const handleChooseImage = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
      mediaType: 'photo',
    } as ImageLibraryOptions;

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        showToast('Camera device has been canceled');
      } else if (response.errorCode === 'camera_unavailable') {
        showToast('Camera not available on device');
      } else if (response.errorCode === 'permission') {
        showToast('Permission not satisfied');
      } else if (response.errorCode === 'others') {
        showToast(response.errorMessage);
      } else {
        QRreader(response.assets[0].uri)
          .then((data) => {
            handleTextChange(data);
          })
          .catch((err) => {
            showToast('Invalid or No related QR code');
          });
      }
    });
  };

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
    });
  };

  const getWalletIcon = (wallet) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  const handleTextChange = (info: string) => {
    info = info.trim();
    const { type: paymentInfoKind, address, amount } = WalletUtilities.addressDiff(info, network);
    setPaymentInfo(address);
    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        const type =
          sender.entityKind === 'VAULT'
            ? TransferType.VAULT_TO_ADDRESS
            : TransferType.WALLET_TO_ADDRESS;
        navigateToNext(address, type, amount ? amount.toString() : null, null);
        break;
      case PaymentInfoKind.PAYMENT_URI:
        const transferType =
          sender.entityKind === 'VAULT'
            ? TransferType.VAULT_TO_ADDRESS
            : TransferType.WALLET_TO_ADDRESS;
        navigateToNext(address, transferType, amount ? amount.toString() : null, null);
        break;
      default:
        showToast('Invalid bitcoin address', <ToastErrorIcon />);
    }
  };

  const renderWallets = ({ item }: { item: Wallet }) => {
    const onPress = () => {
      if (sender.entityKind === EntityKind.VAULT) {
        navigateToNext(
          WalletOperations.getNextFreeAddress(item),
          TransferType.VAULT_TO_WALLET,
          null,
          item
        );
      } else {
        navigateToNext(
          WalletOperations.getNextFreeAddress(item),
          TransferType.WALLET_TO_WALLET,
          null,
          item
        );
      }
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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader title={common.send} subtitle="Scan a bitcoin address" />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={styles.qrcontainer}>
              <RNCamera
                testID="qrscanner"
                style={styles.cameraView}
                captureAudio={false}
                onBarCodeRead={(data) => {
                  handleTextChange(data.data);
                }}
                notAuthorizedView={<CameraUnauthorized />}
              />
            </Box>
            <UploadImage onPress={handleChooseImage} />
            <Box style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <TextInput
                testID="input_address"
                placeholder="or enter address manually"
                placeholderTextColor={Colors.Feldgrau} // TODO: change to colorMode and use native base component
                style={styles.textInput}
                value={paymentInfo}
                onChangeText={handleTextChange}
              />
            </Box>
            <Box style={styles.sendToWalletWrapper}>
              <Text marginX={2} fontSize={14} letterSpacing={1.12}>
                or send to a wallet
              </Text>
              <View>
                <View style={styles.walletContainer} backgroundColor={`${colorMode}.seashellWhite`}>
                  <FlatList
                    data={otherWallets}
                    renderItem={renderWallets}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    ListEmptyComponent={
                      <Box style={styles.emptyWalletsContainer}>
                        <EmptyWalletIcon />
                        <Box style={styles.emptyWalletText}>
                          <Text color={`${colorMode}.deepTeal`}>
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
      {showNote && (
        <Box style={styles.noteWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
          <Note
            title={sender.entityKind === 'VAULT' ? 'Security Tip' : common.note}
            subtitle={
              sender.entityKind === 'VAULT'
                ? 'Check the send-to address on a signer you are going to use to sign the transaction.'
                : 'Make sure the address or QR is the one where you want to send the funds to'
            }
            subtitleColor="GreyText"
          />
        </Box>
      )}
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
  qrContainer: {
    alignSelf: 'center',
    marginVertical: hp(40),
    flex: 1,
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
  cameraView: {
    height: hp(250),
    width: wp(375),
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: hp(25),
    alignItems: 'center',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(100),
    width: '95%',
    borderRadius: hp(10),
    marginHorizontal: wp(10),
    paddingHorizontal: wp(25),
    marginTop: hp(5),
  },
  noteWrapper: {
    marginLeft: wp(20),
    position: 'absolute',
    bottom: windowHeight > 680 ? hp(20) : hp(8),
    width: '100%',
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(20) : hp(10),
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
});
export default SendScreen;
