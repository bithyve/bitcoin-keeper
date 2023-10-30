import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  // TextInput,
  TouchableOpacity,
} from 'react-native';
import { Box, useColorMode, Input } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperText from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
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
import KeeperHeader from 'src/components/KeeperHeader';

function UpdateWalletDetails({ route }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { wallet, isFromSeed, words } = route.params;

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
  const [purpose, setPurpose] = useState(
    purposeList.find((item) => item.label.split(':')[0] === wallet?.scriptType).value
  );
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
      const p = WalletUtilities.getPurpose(path);
      const scriptType = purposeList.find((item) => item.value === p).label.split(':')[0];
      wallet.derivationDetails = derivationDetails;
      wallet.specs = specs;
      wallet.scriptType = scriptType;
      const isUpdated = dbManager.updateObjectById(RealmSchema.Wallet, wallet.id, {
        derivationDetails,
        specs,
        scriptType,
      });
      if (isUpdated) {
        updateAppImageWorker({ payload: { wallet } });
        navigtaion.goBack();
        showToast('Wallet details updated', <TickIcon />);
      } else showToast('Failed to update', <ToastErrorIcon />);
    } catch (error) {
      console.log(error);
      showToast('Failed to update', <ToastErrorIcon />);
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
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader
          title={isFromSeed ? 'Recovery Phrase' : 'Wallet Details'}
          subtitle={
            isFromSeed
              ? 'The QR below comprises of your 12 word Recovery Phrase'
              : 'Update Wallet Path'
          }
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box>
            {showPurpose && (
              <ScrollView style={styles.langScrollViewWrapper}>
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
            <KeeperText
              style={[styles.autoTransferText, { marginTop: hp(25), marginBottom: 5 }]}
              color={`${colorMode}.GreyText`}
            >
              Path
            </KeeperText>
            <Box style={styles.textInputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Input
                placeholder="Derivation Path"
                // style={styles.textInput}
                placeholderTextColor={`${colorMode}.White`} // TODO: change to colorMode and use native base component
                value={path}
                onChangeText={(value) => setPath(value)}
                autoCorrect={false}
                // editable={!isFromSeed}
                editable={false}
                maxLength={20}
                onFocus={() => {
                  setShowPurpose(false);
                  setArrow(false);
                }}
                w={'100%'}
                h={10}
                variant="unstyled"
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
        {/* {!isFromSeed && (
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
        )} */}
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  autoTransferText: {
    fontSize: 12,
    paddingHorizontal: wp(5),
    letterSpacing: 0.6,
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
    padding: 20,
  },
  qrcontainer: {
    overflow: 'hidden',
    borderRadius: 10,
    marginVertical: hp(25),
    alignItems: 'center',
  },
  dotContainer: {
    justifyContent: 'space-between',
    marginTop: hp(20),
  },
  textInputWrapper: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  transferText: {
    width: '100%',
    color: Colors.Feldgrau,
    marginHorizontal: 20,
    fontSize: 12,
    marginTop: hp(22),
    letterSpacing: 0.6,
  },
  ctaBtnWrapper: {
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
    alignItems: 'center',
  },
  purposeText: {
    fontSize: 13,
    marginLeft: wp(10),
    letterSpacing: 0.6,
    color: 'light.GreyText',
  },
});

export default UpdateWalletDetails;
