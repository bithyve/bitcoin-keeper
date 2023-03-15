import {
  FlatList,
  InteractionManager,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
// libraries
import { Box, View } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { QRreader } from 'react-native-qr-decode-image-camera';

import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import IconWallet from 'src/assets/images/icon_wallet.svg';
import { LocalizationContext } from 'src/common/content/LocContext';
import Note from 'src/components/Note/Note';
import { PaymentInfoKind } from 'src/core/wallets/enums';
import { RNCamera } from 'react-native-camera';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
// components
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { TransferType } from 'src/common/data/enums/TransferType';
import { Vault } from 'src/core/wallets/interfaces/vault';
import UploadImage from 'src/components/UploadImage';
import useToastMessage from 'src/hooks/useToastMessage';
import CameraUnauthorized from 'src/components/CameraUnauthorized';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletOperations from 'src/core/wallets/operations';
import { UTXO } from 'src/core/wallets/interfaces';

function SendScreen({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);

  const { sender, selectedUTXOs } = route.params as {
    sender: Wallet | Vault;
    selectedUTXOs?: UTXO[];
  };

  const [showNote, setShowNote] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [paymentInfo, setPaymentInfo] = useState('');

  const network = WalletUtilities.getNetworkByType(sender.networkType);
  const allWallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const otherWallets: Wallet[] = allWallets.filter(
    (existingWallet) => existingWallet.id !== sender.id
  );

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
        showToast('Camera device has been cancled');
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

  const handleTextChange = (info: string) => {
    info = info.trim();
    const { type: paymentInfoKind, address, amount } = WalletUtilities.addressDiff(info, network);
    setPaymentInfo(address);
    switch (paymentInfoKind) {
      case PaymentInfoKind.ADDRESS:
        sender.entityKind === 'VAULT'
          ? navigateToNext(address, TransferType.VAULT_TO_ADDRESS)
          : navigateToNext(address, TransferType.WALLET_TO_ADDRESS);
        break;
      case PaymentInfoKind.PAYMENT_URI:
        const transferType =
          sender.entityKind === 'VAULT'
            ? TransferType.VAULT_TO_ADDRESS
            : TransferType.WALLET_TO_ADDRESS;
        navigateToNext(address, transferType, amount ? amount.toString() : null);
        break;
      default:
        showToast('Invalid bitcoin address', <ToastErrorIcon />);
    }
  };

  const renderWallets = ({ item }: { item: Wallet }) => {
    const onPress = () => {
      if (sender.entityKind === 'VAULT') {
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
        <TouchableOpacity onPress={onPress} style={styles.buttonBackground}>
          <IconWallet />
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
    <ScreenWrapper backgroundColor="light.mainBackground">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <HeaderTitle
          title={common.send}
          subtitle="Scan a bitcoin address"
          headerTitleColor="light.textBlack"
          paddingTop={hp(5)}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={styles.qrcontainer}>
              <RNCamera
                style={styles.cameraView}
                captureAudio={false}
                onBarCodeRead={(data) => {
                  handleTextChange(data.data);
                }}
                notAuthorizedView={<CameraUnauthorized />}
              />
            </Box>
            {/* Upload Image */}

            <UploadImage onPress={handleChooseImage} />

            {/* send manually option */}
            <Box style={styles.inputWrapper} backgroundColor="light.textInputBackground">
              <TextInput
                placeholder="or enter address manually"
                placeholderTextColor="light.GreyText"
                style={styles.textInput}
                value={paymentInfo}
                onChangeText={handleTextChange}
              />
            </Box>

            {/* Send to Wallet options */}
            <Box style={styles.sendToWalletWrapper}>
              <Text marginX={2} fontSize={14} letterSpacing={1.12}>
                or send to a wallet
              </Text>
              <View>
                <View style={styles.walletContainer} backgroundColor="light.textInputBackground">
                  <FlatList
                    data={otherWallets}
                    renderItem={renderWallets}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              </View>
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* {Bottom note} */}
      {showNote && (
        <Box style={styles.noteWrapper} backgroundColor="light.secondaryBackground">
          <Note
            title={sender.entityKind === 'VAULT' ? 'Security Tip' : common.note}
            subtitle={
              sender.entityKind === 'VAULT'
                ? 'Check the send-to address on a signing device you are going to use to sign the transaction.'
                : 'Make sure the address or QR is the one where you want to send the funds to'
            }
            subtitleColor="GreyText"
          />
        </Box>
      )}
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 12,
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: '0.20@s',
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
    backgroundColor: Colors.Isabelline,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 15,
    fontFamily: Fonts.RobotoCondensedRegular,
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
    width: wp(330),
    borderRadius: hp(10),
    marginHorizontal: wp(12),
    paddingHorizontal: wp(25),
    marginTop: hp(5),
  },
  buttonBackground: {
    backgroundColor: '#FAC48B',
    width: 40,
    height: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
});
export default SendScreen;
