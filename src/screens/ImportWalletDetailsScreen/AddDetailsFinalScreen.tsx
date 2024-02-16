import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Text, View, useColorMode, ScrollView, Input } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import { DerivationPurpose, EntityKind, WalletType } from 'src/core/wallets/enums';
import config from 'src/core/config';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { DerivationConfig, NewWalletInfo } from 'src/store/sagas/wallets';
import { parseInt } from 'lodash';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { v4 as uuidv4 } from 'uuid';

const derivationPurposeToLabel = {
  [DerivationPurpose.BIP84]: 'P2WPKH: native segwit, single-sig',
  [DerivationPurpose.BIP49]: 'P2SH-P2WPKH: wrapped segwit, single-sig',
  [DerivationPurpose.BIP44]: 'P2PKH: legacy, single-sig',
};

function AddDetailsFinalScreen({ route }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  const { translations } = useContext(LocalizationContext);
  const { home, importWallet } = translations;
  const [arrow, setArrow] = useState(false);

  const { importedKey, importedKeyDetails } = route.params;
  const [walletType, setWalletType] = useState(route.params?.type);
  const [walletName, setWalletName] = useState(route.params?.name);
  const [walletDescription, setWalletDescription] = useState(route.params?.description);
  const [transferPolicy, setTransferPolicy] = useState(route.params?.policy);

  const [showPurpose, setShowPurpose] = useState(false);
  const [purposeList, setPurposeList] = useState([
    { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
    { label: 'P2SH-P2WPKH: wrapped segwit, single-sig', value: DerivationPurpose.BIP49 },
    { label: 'P2PKH: legacy, single-sig', value: DerivationPurpose.BIP44 },
  ]);
  const [purpose, setPurpose] = useState(importedKeyDetails?.purpose || DerivationPurpose.BIP84);
  const [purposeLbl, setPurposeLbl] = useState(derivationPurposeToLabel[purpose]);
  const [path, setPath] = useState(
    route.params?.path ||
      WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError } = useAppSelector(
    (state) => state.bhr
  );
  const [walletLoading, setWalletLoading] = useState(false);
  const { colorMode } = useColorMode();

  useEffect(() => {
    const path = WalletUtilities.getDerivationPath(
      EntityKind.WALLET,
      config.NETWORK_TYPE,
      0,
      purpose
    );
    setPath(path);
  }, [purpose]);

  const createNewWallet = useCallback(() => {
    setWalletLoading(true);
    //TODO: remove this timeout once the crypto is optimised
    setTimeout(() => {
      const derivationConfig: DerivationConfig = {
        path,
        purpose,
      };

      const newWallet: NewWalletInfo = {
        walletType,
        walletDetails: {
          name: walletName,
          description: walletDescription,
          derivationConfig: walletType === WalletType.DEFAULT ? derivationConfig : null,
          transferPolicy: {
            id: uuidv4(),
            threshold: parseInt(transferPolicy),
          },
        },
        importDetails: {
          importedKey,
          importedKeyDetails,
          derivationConfig,
        },
      };
      dispatch(addNewWallets([newWallet]));
    }, 200);
  }, [walletName, walletDescription, transferPolicy, path]);

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      if (walletType === WalletType.DEFAULT) {
        showToast('New wallet created!', <TickIcon />);
        navigation.goBack();
      } else {
        showToast('Wallet imported', <TickIcon />);
        navigation.dispatch(CommonActions.reset({ index: 1, routes: [{ name: 'Home' }] }));
      }
    }
    if (relayWalletError) {
      showToast('Wallet creation failed!', <ToastErrorIcon />);
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
        <KeeperHeader title={home.ImportWallet} subtitle={importWallet.addDetails} />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={[styles.textInputWrapper]}>
              <Input
                placeholder={importWallet.derivationPath}
                style={styles.textInput}
                backgroundColor={`${colorMode}.seashellWhite`}
                placeholderTextColor={Colors.Feldgrau} // TODO: change to colorMode and use native base component
                value={path}
                onChangeText={(value) => setPath(value)}
                autoCorrect={false}
                maxLength={20}
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
                >
                  <Text style={styles.purposeText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </ScrollView>
        <View style={styles.dotContainer}>
          <View style={{ flexDirection: 'row', marginTop: hp(15) }}>
            {[1, 2, 3].map((item, index) => (
              <View
                key={item.toString()}
                style={index === 2 ? styles.selectedDot : styles.unSelectedDot}
              />
            ))}
          </View>
          <Box style={styles.ctaBtnWrapper}>
            <Box ml={windowWidth * -0.09}>
              <Buttons
                secondaryText="Cancel"
                secondaryCallback={() => {
                  navigation.goBack();
                }}
                primaryText="Import"
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
  qrContainer: {
    alignSelf: 'center',
    marginVertical: hp(40),
    flex: 1,
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
    backgroundColor: Colors.GrayX11,
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
    color: Colors.Feldgrau,
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
    borderColor: Colors.Platinum,
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
