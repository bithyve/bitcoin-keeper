import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperText from 'src/components/KeeperText';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import Buttons from 'src/components/Buttons';
import { DerivationPurpose } from 'src/services/wallets/enums';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import ShowXPub from 'src/components/XPub/ShowXPub';
import { Wallet, WalletDerivationDetails } from 'src/services/wallets/interfaces/wallet';
import { generateWalletSpecsFromMnemonic } from 'src/services/wallets/factories/WalletFactory';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { updateAppImageWorker } from 'src/store/sagas/bhr';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';

function UpdateWalletDetails({ route }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { wallet, isFromSeed, words } = route.params;

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation, seed, importWallet, common } = translations;
  const [arrow, setArrow] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const purposeList = [
    { label: 'P2PKH: legacy, single-sig', value: DerivationPurpose.BIP44 },
    { label: 'P2SH-P2WPKH: wrapped segwit, single-sg', value: DerivationPurpose.BIP49 },
    { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
    { label: 'P2TR: taproot, single-sig', value: DerivationPurpose.BIP86 },
  ];
  const getPurpose = (key) => {
    switch (key) {
      case 'P2PKH':
        return 'P2PKH: legacy, single-sig';
      case 'P2SH-P2WPKH':
        return 'P2SH-P2WPKH: wrapped segwit, single-sg';
      case 'P2WPKH':
        return 'P2WPKH: native segwit, single-sig';
      case 'P2TR':
        return 'P2TR: taproot, single-sig';
      default:
        return '';
    }
  };
  const [purpose, setPurpose] = useState(
    purposeList.find((item) => item.label.split(':')[0] === wallet?.scriptType).value
  );
  const [purposeLbl, setPurposeLbl] = useState(getPurpose(wallet?.scriptType));
  const [path, setPath] = useState(`${(wallet as Wallet)?.derivationDetails?.xDerivationPath}`);
  const [warringsVisible, setWarringsVisible] = useState(false);
  const { showToast } = useToastMessage();
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);

  useEffect(() => {
    if (relayWalletError) {
      showToast(realyWalletErrorMessage, <ToastErrorIcon />);
      dispatch(resetRealyWalletState());
    }
    if (relayWalletUpdate) {
      showToast(walletTranslation.walletDetailsUpdate, <TickIcon />);
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
      const specs = generateWalletSpecsFromMnemonic(
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
        setWarringsVisible(false);
        updateAppImageWorker({ payload: { wallets: [wallet] } });
        navigtaion.goBack();
        showToast(walletTranslation.walletDetailsUpdate, <TickIcon />);
      } else showToast(walletTranslation.failToUpdate, <ToastErrorIcon />);
    } catch (error) {
      setWarringsVisible(false);
      console.log(error);
      showToast(walletTranslation.failToUpdate, <ToastErrorIcon />);
    }
  };
  function WaringsContent() {
    return (
      <Box width={wp(300)}>
        <Box>
          <Text color={`${colorMode}.black`} style={styles.contentText}>
            {`\u2022 ${walletTranslation.changePathOfDefaultWalletPara01} `}
          </Text>
        </Box>
        <Box>
          <Text color={`${colorMode}.black`} style={styles.contentText}>
            {`\u2022  ${walletTranslation.changePathOfDefaultWalletPara02}`}
          </Text>
        </Box>
        <Box style={styles.ctaBtnWrapper} mt={10}>
          <Box ml={windowWidth * -0.09}>
            <Buttons
              secondaryText="Cancel"
              secondaryCallback={() => {
                setWarringsVisible(false);
              }}
              primaryText="I understand, Proceed"
              primaryCallback={() => {
                updateWallet();
              }}
              primaryLoading={relayWalletUpdateLoading}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        enabled
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.scrollViewWrapper}
      >
        <KeeperHeader
          title={isFromSeed ? seed.walletSeedWords : walletTranslation.WalletDetails}
          subtitle={
            isFromSeed ? walletTranslation.qrofRecoveryPhrase : walletTranslation.viewWalletPath
          }
        />
        <ScrollView style={styles.scrollViewWrapper} showsVerticalScrollIndicator={false}>
          <Box style={styles.container}>
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
                    <Text style={styles.purposeText} color={`${colorMode}.GreyText`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <KeeperText
              style={[styles.autoTransferText, { marginTop: hp(25), marginBottom: 5 }]}
              color={`${colorMode}.GreyText`}
            >
              {common.path}
            </KeeperText>
            <Box style={styles.textInputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Text medium>{path}</Text>
            </Box>
            <KeeperText
              style={[styles.autoTransferText, { marginTop: hp(25), marginBottom: 5 }]}
              color={`${colorMode}.GreyText`}
            >
              {common.purpose}
            </KeeperText>
            <Box style={styles.textInputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Text medium>{purposeLbl}</Text>
            </Box>
            {isFromSeed ? (
              <Box style={{ marginTop: wp(20) }}>
                <ShowXPub
                  data={words.toString().replace(/,/g, ' ')}
                  subText={seed.walletSeedWords}
                  noteSubText={seed.showXPubNoteSubText}
                  copyable={false}
                />
              </Box>
            ) : null}
          </Box>
        </ScrollView>
        <KeeperModal
          visible={warringsVisible}
          close={() => setWarringsVisible(false)}
          title={walletTranslation.changePathOfDefaultWallet}
          subTitle={walletTranslation.changePathOfDefaultWalletSubTitle}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          subTitleColor={`${colorMode}.secondaryText`}
          textColor={`${colorMode}.primaryText`}
          DarkCloseIcon={colorMode === 'dark'}
          Content={WaringsContent}
        />
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '95%',
    alignSelf: 'center',
  },
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
  scrollViewWrapper: {
    flex: 1,
  },
  textInput: {
    width: '100%',
    padding: 20,
  },
  dotContainer: {
    justifyContent: 'space-between',
    marginTop: hp(20),
  },
  textInputWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: hp(50),
    paddingHorizontal: 10,
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
  },
  contentText: {
    fontSize: 13,
    paddingHorizontal: 1,
    paddingVertical: 5,
    letterSpacing: 0.65,
  },
});

export default UpdateWalletDetails;
