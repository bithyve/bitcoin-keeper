import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
// libraries
import { Box, Input, Select, View } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import HeaderTitle from 'src/components/HeaderTitle';
import { LocalizationContext } from 'src/common/content/LocContext';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import ScreenWrapper from 'src/components/ScreenWrapper';
// components
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { DerivationPurpose, EntityKind, WalletType } from 'src/core/wallets/enums';
import config from 'src/core/config';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { DerivationConfig, NewWalletInfo } from 'src/store/sagas/wallets';
import { updateWalletPathAndPurposeDetails } from 'src/store/sagaActions/wallets';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';

function UpdateWalletDetails({ route }) {
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { useQuery } = useContext(RealmWrapperContext);

  const { translations } = useContext(LocalizationContext);
  const [arrow, setArrow] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const [purposeList, setPurposeList] = useState([
    { label: 'P2PKH: legacy, single-sig', value: DerivationPurpose.BIP44 },
    { label: 'P2SH-P2WPKH: wrapped segwit, single-sg', value: DerivationPurpose.BIP49 },
    { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
  ]);
  const [purpose, setPurpose] = useState(`${DerivationPurpose.BIP84}`);
  const [purposeLbl, setPurposeLbl] = useState('P2PKH: legacy, single-sig');
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );
  const { wallet } = route.params;
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);

  useEffect(() => {
    const path = WalletUtilities.getDerivationPath(
      EntityKind.WALLET,
      config.NETWORK_TYPE,
      0,
      Number(purpose)
    );
    setPath(path);
  }, [purpose]);

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
      console.log('sskk call dispatch');
      
      const details = {
        path: path,
        purpose: purpose,
        
      };
      dispatch(updateWalletPathAndPurposeDetails(wallet, details));
    };

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
    <ScreenWrapper backgroundColor="light.mainBackground">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <HeaderTitle
          title="Wallet Details"
          subtitle="Update Path & Purpose"
          headerTitleColor={Colors.TropicalRainForest}
          paddingTop={hp(5)}
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
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
                maxLength={20}
              />
            </Box>
            <TouchableOpacity onPress={onDropDownClick} style={styles.dropDownContainer}>
              <Text style={styles.balanceCrossesText}>{purposeLbl}</Text>
              <Box
                style={[
                  styles.icArrow,
                  {
                    transform: [{ rotate: arrow ? '-90deg' : '90deg' }],
                  },
                ]}
              >
                <RightArrowIcon />
              </Box>
            </TouchableOpacity>
            {/* <Select
              style={styles.dropDownContainer}
              selectedValue={purpose}
              minWidth="200"
              accessibilityLabel="Choose Service"
              placeholder="Choose Purpose"
              mt={1}
              onValueChange={(itemValue) => setPurpose(itemValue)}
            >
              <Select.Item label="P2PKH: legacy, single-sig" value={`${DerivationPurpose.BIP44}`} />
              <Select.Item
                label="P2SH-P2WPKH: wrapped segwit, single-sg"
                value={`${DerivationPurpose.BIP49}`}
              />
              <Select.Item
                label="P2WPKH: native segwit, single-sig"
                value={`${DerivationPurpose.BIP84}`}
              />
            </Select> */}
          </Box>
          {showPurpose && (
            <ScrollView style={styles.langScrollViewWrapper}>
              {purposeList.map((item) => (
                <TouchableOpacity
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
          <Box style={styles.ctaBtnWrapper}>
            <Box ml={windowWidth * -0.09}>
              <Buttons
                secondaryText="Cancel"
                secondaryCallback={() => {
                  navigtaion.goBack();
                }}
                primaryText="save"
                primaryCallback={updateWallet}
                primaryLoading={relayWalletUpdateLoading}
              />
            </Box>
          </Box>
        </View>
      </KeyboardAvoidingView>
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
    marginTop: hp(15),
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
