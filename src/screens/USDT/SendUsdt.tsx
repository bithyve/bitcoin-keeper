import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, KeyboardAvoidingView, ScrollView, useColorMode, useToast } from 'native-base';
import React, { useContext, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import HexagonIcon from 'src/components/HexagonIcon';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import { EntityKind, VaultType } from 'src/services/wallets/enums';
import CollaborativeSmallIcon from 'src/assets/images/collaborative-icon-small.svg';
import VaultSmallIcon from 'src/assets/images/vault-icon-small.svg';
import WalletSmallIcon from 'src/assets/images/daily-wallet-small.svg';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import { Vault } from 'src/services/wallets/interfaces/vault';
import ScannerIcon from 'src/assets/images/scanner-icon.svg';
import ScannerIconDark from 'src/assets/images/scanner-icon-white.svg';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import RemoveIcon from 'src/assets/images/remove-green-icon.svg';
import RemoveIconDark from 'src/assets/images/remove-white-icon.svg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import { isValidTronAddress } from 'src/services/wallets/operations/dollars/Tron';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

const SendUsdt = ({ route }) => {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation, common, usdtWalletText } = translations;
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const isSmallDevice = useIsSmallDevices();
  const navigation = useNavigation();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<Wallet | Vault>(null);
  const { showToast } = useToastMessage();
  const [isSendToWalletDisabled, setIsSendToWalletDisabled] = useState(false);
  const HexagonIconColor = ThemedColor({ name: 'HexagonIcon' });
  const sender: USDTWallet = route.params?.usdtWallet;
  if (!sender) {
    showToast('USDT Wallet not found', <ToastErrorIcon />);
    return null;
  }

  // const getSmallWalletIcon = (wallet) => {
  //   if (wallet.entityKind === EntityKind.VAULT) {
  //     return wallet.type === VaultType.COLLABORATIVE ? (
  //       <CollaborativeSmallIcon />
  //     ) : (
  //       <VaultSmallIcon />
  //     );
  //   } else {
  //     return <WalletSmallIcon />;
  //   }
  // };
  // const handleSelectWallet = (wallet) => {
  //   setPaymentInfo('');
  //   setSelectedWallet(wallet);
  // };
  // const handleSelectWalletPress = () => {
  //   if (isSendToWalletDisabled) {
  //     return;
  //   }

  //   if (!selectedWallet) {
  //     navigation.dispatch(
  //       CommonActions.navigate({
  //         name: 'SelectWallet',
  //         params: {
  //           sender,
  //           handleSelectWallet,
  //         },
  //       })
  //     );
  //   } else {
  //     setSelectedWallet(null);
  //   }
  // };

  // const navigateToSelectWallet = () => {
  //   navigation.dispatch(
  //     CommonActions.navigate('SelectWallet', {
  //       sender,
  //       handleSelectWallet,
  //       selectedWalletIdFromParams: selectedWallet?.id,
  //     })
  //   );
  // };

  const handleProcess = () => {
    if (recipientAddress) {
      if (isValidTronAddress(recipientAddress.trim(), sender.networkType)) {
        if (recipientAddress === sender.accountStatus.gasFreeAddress) {
          showToast('Self transfers are not supported', <ToastErrorIcon />);
          return;
        }

        navigation.dispatch(
          CommonActions.navigate({
            name: 'usdtAmount',
            params: {
              recipientAddress: recipientAddress.trim(),
              sender,
            },
          })
        );
      } else showToast('Invalid TRON address', <ToastErrorIcon />);
    } else showToast('Missing receive address', <ToastErrorIcon />);
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
                value={recipientAddress}
                onChangeText={(data: string) => {
                  setRecipientAddress(data);
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
              {/* <Box style={styles.sendToWalletContainer}>    // TODO: integrate later
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
                    <Text color={`${colorMode}.primaryText`}>{usdtWalletText.sendToWallet}</Text>
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
                      <Text color={`${colorMode}.greenText`}>{usdtWalletText.chnageWallet}</Text>
                    </Box>
                  </Pressable>
                )}
              </Box> */}
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>

      <Box mt="auto" p={4}>
        <Text bold mb={2} color={`${colorMode}.dashedButtonBorderColor`}>
          {common.note}
        </Text>
        <Text color={`${colorMode}.primaryText`}>{usdtWalletText.sendtoTron}</Text>
      </Box>

      <Box backgroundColor={`${colorMode}.primaryBackground`}>
        <Buttons
          primaryCallback={handleProcess}
          primaryText={common.proceed}
          primaryDisable={!recipientAddress.trim() && !selectedWallet}
          fullWidth
        />
      </Box>
    </ScreenWrapper>
  );
};

export default SendUsdt;

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
