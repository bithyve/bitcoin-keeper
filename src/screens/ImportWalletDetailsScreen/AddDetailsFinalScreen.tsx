import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, View, useColorMode, ScrollView, Input } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import { DerivationPurpose, WalletType } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import WalletHeader from 'src/components/WalletHeader';
import Text from 'src/components/KeeperText';

const derivationPurposeToLabel = {
  [DerivationPurpose.BIP84]: 'P2WPKH: native segwit, single-sig',
  [DerivationPurpose.BIP86]: 'P2TR: taproot, single-sig',
};

function AddDetailsFinalScreen({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  const { translations } = useContext(LocalizationContext);
  const { home, importWallet, common, wallet: walletTranslation } = translations;
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);
  const [arrow, setArrow] = useState(false);

  const { importedKey, importedKeyType } = route.params;
  const [walletType, setWalletType] = useState(route.params?.type);
  const [walletName, setWalletName] = useState(route.params?.name);
  const [walletDescription, setWalletDescription] = useState(route.params?.description);

  const [showPurpose, setShowPurpose] = useState(false);
  const [purposeList, setPurposeList] = useState([
    { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
    { label: 'P2TR: taproot, single-sig', value: DerivationPurpose.BIP86 },
  ]);
  const [purpose, setPurpose] = useState(DerivationPurpose.BIP84);
  const [purposeLbl, setPurposeLbl] = useState(derivationPurposeToLabel[purpose]);
  const [path, setPath] = useState(
    route.params?.path || WalletUtilities.getDerivationPath(false, bitcoinNetworkType, 0, purpose)
  );
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const [walletLoading, setWalletLoading] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const path = WalletUtilities.getDerivationPath(false, bitcoinNetworkType, 0, purpose);
    setPath(path);
  }, [purpose]);

  const createNewWallet = useCallback(() => {
    setWalletLoading(true);
    const newWallet: NewWalletInfo = {
      walletType,
      walletDetails: {
        name: walletName,
        description: walletDescription,
        derivationPath: path,
      },
      importDetails: {
        importedKey,
        importedKeyType,
        derivationPath: path,
      },
    };
    dispatch(addNewWallets([newWallet]));
  }, [walletName, walletDescription, path]);

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      if (walletType === WalletType.DEFAULT) {
        showToast(walletTranslation.newWalletCreated, <TickIcon />);
        navigation.goBack();
      } else {
        showToast(walletTranslation.walletImported, <TickIcon />);
        navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Home' }] }));
      }
    }
    if (relayWalletError) {
      showToast(
        walletTranslation.walletCreationFailed + realyWalletErrorMessage,
        <ToastErrorIcon />
      );
      setWalletLoading(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError]);

  const onDropDownClick = () => {
    if (showPurpose) {
      setShowPurpose(false);
      setArrow(false);
    } else {
      setShowPurpose(true);
      setArrow(true);
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
        <WalletHeader title={home.ImportWallet} subTitle={importWallet.addDetails} />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={[styles.textInputWrapper]}>
              <Input
                placeholder={importWallet.derivationPath}
                style={styles.textInput}
                backgroundColor={`${colorMode}.seashellWhite`}
                placeholderTextColor={Colors.GreenishGrey} // TODO: change to colorMode and use native base component
                value={path}
                onChangeText={(value) => setPath(value)}
                autoCorrect={false}
                maxLength={20}
                editable={false}
                _input={
                  colorMode === 'dark' && {
                    selectionColor: Colors.bodyText,
                    cursorColor: Colors.bodyText,
                  }
                }
              />
            </Box>
            <TouchableOpacity onPress={onDropDownClick}>
              <Box style={styles.dropDownContainer} backgroundColor={`${colorMode}.seashellWhite`}>
                <Text style={styles.balanceCrossesText} color={`${colorMode}.primaryText`}>
                  {purposeLbl}
                </Text>
                <Box
                  style={[
                    styles.icArrow,
                    {
                      transform: [{ rotate: arrow ? '-90deg' : '90deg' }],
                    },
                  ]}
                >
                  {colorMode === 'light' ? <RightArrowIcon /> : <IconArrow />}
                </Box>
              </Box>
            </TouchableOpacity>
          </Box>
          {showPurpose && (
            <ScrollView
              style={styles.langScrollViewWrapper}
              backgroundColor={`${colorMode}.seashellWhite`}
            >
              {purposeList.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setShowPurpose(false);
                    setArrow(false);
                    setPurpose(item.value);
                    setPurposeLbl(item.label);
                  }}
                  style={styles.flagWrapper1}
                  testID={`purpose_item_${item.value}`}
                >
                  <Text style={styles.purposeText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>
        <View style={styles.dotContainer}>
          {!(walletLoading || relayWalletUpdateLoading) && (
            <View style={{ flexDirection: 'row', marginTop: hp(15) }}>
              {[1, 2, 3].map((item, index) => (
                <View
                  key={item.toString()}
                  style={index === 2 ? styles.selectedDot : styles.unSelectedDot}
                />
              ))}
            </View>
          )}
          <Box style={styles.ctaBtnWrapper}>
            <Box ml={windowWidth * -0.09}>
              <Buttons
                secondaryText={common.cancel}
                secondaryCallback={() => {
                  navigation.goBack();
                }}
                primaryText={walletTranslation.import}
                primaryDisable={!walletName || !walletDescription}
                primaryCallback={createNewWallet}
                primaryLoading={walletLoading || relayWalletUpdateLoading}
              />
            </Box>
          </Box>
        </View>
      </KeyboardAvoidingView>
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
  textInput: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    padding: 20,
  },
  dropDownContainer: {
    borderRadius: 10,
    paddingVertical: 20,
    marginTop: 10,
    flexDirection: 'row',
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
    marginTop: hp(35),
    // position: 'absolute',
    // bottom: windowHeight > 680 ? hp(20) : hp(8),
    width: '100%',
  },
  sendToWalletWrapper: {
    marginTop: windowHeight > 680 ? hp(20) : hp(10),
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(20),
  },
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.DimGray,
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.darkGrey,
    marginEnd: 5,
  },
  textInputWrapper: {
    flexDirection: 'row',
    marginTop: hp(15),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferText: {
    width: '100%',
    color: Colors.GreenishGrey,
    marginHorizontal: 20,
    fontSize: 12,
    marginTop: hp(22),
    letterSpacing: 0.6,
  },
  amountWrapper: {
    marginHorizontal: 20,
    marginTop: hp(10),
  },
  balanceCrossesText: {
    marginHorizontal: 20,
    fontSize: 12,
    letterSpacing: 0.96,
    flex: 1,
  },
  ctaBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  langScrollViewWrapper: {
    borderWidth: 1,
    borderColor: Colors.bodyText,
    borderRadius: 10,
    marginVertical: 15,
    width: '100%',
    zIndex: 10,
  },
  flagWrapper1: {
    flexDirection: 'row',
    height: wp(40),
    // alignSelf: 'center',
    alignItems: 'center',
  },
  purposeText: {
    fontSize: 13,
    marginLeft: wp(10),
    letterSpacing: 0.6,
  },
  icArrow: {
    marginLeft: wp(10),
    marginRight: wp(20),
    alignSelf: 'center',
  },
});
export default AddDetailsFinalScreen;
