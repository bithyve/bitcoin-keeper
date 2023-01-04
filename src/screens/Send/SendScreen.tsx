import {
  Alert,
  FlatList,
  InteractionManager,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
// libraries
import { Box, View } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Permissions from 'react-native-permissions';

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
import { getNextFreeAddress } from 'src/store/sagas/send_and_receive';
import { sendPhasesReset } from 'src/store/reducers/send_and_receive';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { TransferType } from 'src/common/data/enums/TransferType';
import { Vault } from 'src/core/wallets/interfaces/vault';
import UploadImage from 'src/components/UploadImage';
import useToastMessage from 'src/hooks/useToastMessage';

function SendScreen({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);

  const { sender } = route.params;
  const [showNote, setShowNote] = useState(true);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [paymentInfo, setPaymentInfo] = useState('');
  const [image, setImage] = useState(null);

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

  const requestPermission = () => {
    Permissions.openSettings();
  }
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

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        showToast('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        showToast('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        showToast(response.errorMessage);
        return;
      } else {
        setImage(response.assets[0].uri)
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
      Alert.alert("Average transaction fees couldn't be fetched!");
      return;
    }

    navigation.navigate('AddSendAmount', {
      sender,
      recipient,
      address,
      amount,
      transferType,
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
        sender.entityKind === 'VAULT'
          ? navigateToNext(
            address,
            TransferType.VAULT_TO_ADDRESS,
            amount ? amount.toString() : null
          )
          : navigateToNext(
            address,
            TransferType.WALLET_TO_ADDRESS,
            amount ? amount.toString() : null
          );
        break;
      default:
    }
  };

  const renderWallets = ({ item }: { item: Wallet }) => {
    const onPress = () => {
      if (sender.entityKind === 'VAULT') {
        navigateToNext(getNextFreeAddress(item), TransferType.VAULT_TO_WALLET, null, item);
      } else {
        navigateToNext(getNextFreeAddress(item), TransferType.WALLET_TO_WALLET, null, item);
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
    <ScreenWrapper>
      <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          enabled
          keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        >
          <HeaderTitle
            title={common.send}
            subtitle="Scan a bitcoin address"
            headerTitleColor="light.textBlack"
            paddingTop={hp(5)}
          />
          <Box>
            <Box style={styles.qrcontainer}>
              <RNCamera
                style={styles.cameraView}
                captureAudio={false}
                onBarCodeRead={(data) => {
                  handleTextChange(data.data);
                }}
                notAuthorizedView={
                  <View style={{ ...styles.cameraView, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Camera permission is denied</Text>
                    <TouchableOpacity onPress={requestPermission}>
                      <Text>Tap to go to settings</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </Box>
            {/* Upload Image */}

            <UploadImage onPress={handleChooseImage} />

            {/* send manually option */}
            <Box style={styles.inputWrapper}>
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
              <Text marginX={5} fontSize={14} letterSpacing={1.12}>
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
        </KeyboardAvoidingView>
      </ScrollView>
      {/* {Bottom note} */}
      {showNote && (
        <Box style={styles.noteWrapper} backgroundColor="light.secondaryBackground">
          <Note
            title={common.note}
            subtitle="Make sure the address or QR is the one where you want to send the funds to"
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
    marginVertical: hp(2),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    width: '90%',
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
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: hp(100),
    width: wp(330),
    borderRadius: hp(10),
    marginHorizontal: wp(16),
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
    paddingLeft: 20,
    position: 'absolute',
    bottom: hp(20),
    width: wp(300),
  },
  sendToWalletWrapper: {
    marginTop: hp(20),
  },
});
export default SendScreen;
