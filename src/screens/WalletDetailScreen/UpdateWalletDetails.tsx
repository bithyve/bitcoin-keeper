import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
// libraries
import { Box, Input, Select, View } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
// components
import KeeperText from 'src/components/KeeperText';

import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { DerivationPurpose } from 'src/core/wallets/enums';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import ShowXPub from 'src/components/XPub/ShowXPub';
import { WalletDerivationDetails } from 'src/core/wallets/interfaces/wallet';
import { generateWalletSpecs } from 'src/core/wallets/factories/WalletFactory';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { updateAppImageWorker } from 'src/store/sagas/bhr';

function UpdateWalletDetails({ route }) {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { wallet, isFromSeed, words } = route.params;

  const { useQuery } = useContext(RealmWrapperContext);

  const { translations } = useContext(LocalizationContext);
  const [arrow, setArrow] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const purposeList = [
    { label: 'P2PKH: legacy, single-sig', value: DerivationPurpose.BIP44 },
    { label: 'P2SH-P2WPKH: wrapped segwit, single-sg', value: DerivationPurpose.BIP49 },
    { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
  ];
  const getPupose = (key) => {
    switch (key) {
      case 'P2PKH':
        return 'P2PKH: legacy, single-sig';
      case 'P2SH-P2WPKH':
        return 'P2SH-P2WPKH: wrapped segwit, single-sg';
      case 'P2WPKH':
        return 'P2WPKH: native segwit, single-sig';
      default:
        return '';
    }
  };
  const [purpose, setPurpose] = useState(purposeList.find(item => item.label.split(':')[0] === wallet?.scriptType).value);
  const [purposeLbl, setPurposeLbl] = useState(getPupose(wallet?.scriptType));
  const [path, setPath] = useState(`${wallet?.derivationDetails.xDerivationPath}`);
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);

  useEffect(() => {
    if (relayWalletError) {
      showToast(realyWalletErrorMessage, <ToastErrorIcon />);
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      showToast('Wallet details updated', <TickIcon />);
      dispatch(resetRealyWalletState());
      navigtaion.goBack();
    }
  }, [relayWalletUpdate, relayWalletError, realyWalletErrorMessage]);

  const updateWallet = () => {
    try {
      const derivationDetails: WalletDerivationDetails = {
        ...wallet.derivationDetails,
        xDerivationPath: path,
      };
      const specs = generateWalletSpecs(
        derivationDetails.mnemonic,
        WalletUtilities.getNetworkByType(wallet.networkType),
        derivationDetails.xDerivationPath
      );
      console.log('purpose', purpose)
      const scriptType = purposeList.find(item => item.value === purpose).label.split(':')[0]
      wallet.derivationDetails = derivationDetails;
      wallet.specs = specs;
      wallet.scriptType = scriptType;
      const isUpdated = dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, {
        derivationDetails,
        // specs,
        scriptType
      })
      if (isUpdated) {
        updateAppImageWorker({ payload: { wallet } })
        navigtaion.goBack()
        showToast('Wallet details updated', <TickIcon />);
      } else showToast("Failed to update", <ToastErrorIcon />);

    } catch (error) {
      console.log(error)
      showToast("Failed to update", <ToastErrorIcon />);
    }
  };

  const onDropDownClick = () => {
    if (!isFromSeed) {
      if (showPurpose) {
        setShowPurpose(false);
        setArrow(false);
      } else {
        setShowPurpose(true);
        setArrow(true);
      }
    }
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
          title={isFromSeed ? 'Recovery Phrase' : 'Wallet Details'}
          subtitle={
            isFromSeed
              ? 'The QR below comprises of your 12 word Recovery Phrase'
              : 'Update Path & Purpose'
          }
          headerTitleColor={Colors.TropicalRainForest}
          paddingTop={hp(5)}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            <KeeperText
              type="regular"
              style={[styles.autoTransferText, { color: 'light.GreyText', marginTop: hp(20), }]}
            >
              Purpose
            </KeeperText>
            <TouchableOpacity
              activeOpacity={!isFromSeed ? 0 : 1}
              onPress={onDropDownClick}
              style={styles.dropDownContainer}
            >
              <Text style={styles.balanceCrossesText}>{purposeLbl}</Text>
              <Box
                style={[
                  styles.icArrow,
                  {
                    transform: [{ rotate: arrow ? '-90deg' : '90deg' }],
                  },
                ]}
              >
                {!isFromSeed && <RightArrowIcon />}
              </Box>
            </TouchableOpacity>
            {showPurpose && (
              <ScrollView style={styles.langScrollViewWrapper}>
                {purposeList.map((item) => (
                  <TouchableOpacity
                    onPress={() => {
                      setShowPurpose(false);
                      setArrow(false);
                      setPurpose(item.value);
                      setPurposeLbl(item.label);
                      // setPath('');
                    }}
                    style={styles.flagWrapper1}
                  >
                    <Text style={styles.purposeText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <KeeperText
              type="regular"
              style={[styles.autoTransferText, { color: 'light.GreyText', marginTop: hp(15), }]}
            >
              Path
            </KeeperText>
            <Box style={[styles.textInputWrapper]}>
              <TextInput
                placeholder="Derivation Path"
                style={styles.textInput}
                placeholderTextColor="light.GreyText"
                value={path}
                onChangeText={(value) => setPath(value)}
                // width={wp(260)}
                autoCorrect={false}
                // marginY={2}
                // borderWidth="0"
                editable={!isFromSeed}
                maxLength={20}
                onFocus={() => {
                  setShowPurpose(false);
                  setArrow(false);
                }}
              />
            </Box>
            {isFromSeed ? (
              <Box style={{ marginTop: wp(20) }}>
                <ShowXPub
                  data={words.toString().replace(/,/g, ' ')}
                  subText="Wallet Recovery Phrase"
                  noteSubText="Losing your Recovery Phrase may result in permanent loss of funds. Store them carefully."
                  copyable={false}
                />
              </Box>
            ) : null}
          </Box>
        </ScrollView>
        {!isFromSeed && (
          <View style={styles.dotContainer}>
            <Box style={styles.ctaBtnWrapper}>
              <Box ml={windowWidth * -0.09}>
                <Buttons
                  secondaryText="Cancel"
                  secondaryCallback={() => {
                    navigtaion.goBack();
                  }}
                  primaryText="Save"
                  primaryCallback={updateWallet}
                  primaryLoading={relayWalletUpdateLoading}
                />
              </Box>
            </Box>
          </View>
        )}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = ScaledSheet.create({
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  autoTransferText: {
    fontSize: 12,
    paddingHorizontal: wp(5),
    letterSpacing: '0.6@s',
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
  textInput: {
    width: '100%',
    backgroundColor: Colors.Isabelline,
    borderRadius: 10,
    // borderBottomLeftRadius: 10,
    padding: 20,
    fontFamily: Fonts.RobotoCondensedRegular,
  },
  dropDownContainer: {
    backgroundColor: Colors.Isabelline,
    borderRadius: 10,
    // borderTopLeftRadius: 10,
    // borderBottomLeftRadius: 10,
    paddingVertical: 20,
    // marginTop: 10,
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
    // flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
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
    // marginTop: hp(15),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferText: {
    width: '100%',
    color: Colors.Feldgrau,
    marginHorizontal: 20,
    // padding: 20,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 12,
    marginTop: hp(22),
    letterSpacing: 0.6,
  },
  amountWrapper: {
    marginHorizontal: 20,
    marginTop: hp(10),
  },
  balanceCrossesText: {
    // width: '100%',
    color: Colors.Feldgrau,
    marginHorizontal: 20,
    // padding: 20,
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 12,
    marginTop: hp(10),
    letterSpacing: 0.96,
    flex: 1,
  },
  ctaBtnWrapper: {
    // marginBottom: hp(5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  langScrollViewWrapper: {
    borderWidth: 1,
    borderColor: Colors.Platinum,
    borderRadius: 10,
    margin: 15,
    width: '90%',
    zIndex: 10,
    backgroundColor: '#FAF4ED',
    position: 'absolute',
    top: hp(60),
  },
  flagWrapper1: {
    flexDirection: 'row',
    height: wp(40),
    // alignSelf: 'center',
    alignItems: 'center',
  },
  purposeText: {
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 13,
    marginLeft: wp(10),
    letterSpacing: 0.6,
    color: 'light.GreyText',
  },
  icArrow: {
    marginLeft: wp(10),
    marginRight: wp(10),
    alignSelf: 'center',
  },
});

export default UpdateWalletDetails;
