import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode, ScrollView } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
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
import { WalletDerivationDetails } from 'src/core/wallets/interfaces/wallet';
import { generateWalletSpecsFromMnemonic } from 'src/core/wallets/factories/WalletFactory';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { updateAppImageWorker } from 'src/store/sagas/bhr';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import KeeperTextInput from 'src/components/KeeperTextInput';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';

function WalletPath({ wallet, secondaryBtnPress }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const dispatch = useDispatch();

  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation, common, settings } = translations;
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
        updateAppImageWorker({ payload: { wallet } });
        navigtaion.goBack();
        showToast(walletTranslation.walletDetailsUpdate, <TickIcon />);
      } else showToast(walletTranslation.failToUpdate, <ToastErrorIcon />);
    } catch (error) {
      setWarringsVisible(false);
      console.log(error);
      showToast(walletTranslation.failToUpdate, <ToastErrorIcon />);
    }
  };

  function WarningContent() {
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
              secondaryText={common.cancel}
              secondaryCallback={() => {
                setWarringsVisible(false);
              }}
              primaryText={common.proceed}
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
    <Box backgroundColor={`${colorMode}.modalWhiteBackground`} style={styles.modalContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollViewWrapper}
        showsVerticalScrollIndicator={false}
      >
        <Box>
          <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.inputFieldWrapper}>
            <KeeperTextInput
              placeholder={'Paste Wallet Path'}
              placeholderTextColor={`${colorMode}.SlateGreen`}
              value={path}
              onChangeText={(value) => {
                setPath(value);
              }}
              testID={`change_wallet_path`}
            />
          </Box>

          <TouchableOpacity onPress={() => setShowPurpose(!showPurpose)}>
            <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.dropdown}>
              <Text color={`${colorMode}.SlateGreen`}>Select Wallet Purpose</Text>
              <Box
                style={{
                  transform: [{ rotate: showPurpose ? '-90deg' : '90deg' }],
                }}
              >
                <RightArrowIcon />
              </Box>
            </Box>
          </TouchableOpacity>

          {showPurpose && (
            <ScrollView
              backgroundColor={`${colorMode}.seashellWhite`}
              style={styles.langScrollViewWrapper}
            >
              {purposeList.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setShowPurpose(false);
                    setPurpose(item.value);
                    setPurposeLbl(item.label);
                  }}
                  style={styles.flagWrapper1}
                >
                  <Text
                    color={
                      item.value === purpose ? `${colorMode}.headerText` : `${colorMode}.GreyText`
                    }
                    bold={item.value === purpose}
                    style={styles.purposeText}
                  >
                    {item.label}
                  </Text>
                  <Box backgroundColor={`${colorMode}.DarkSage`} style={styles.horizontalLine} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Box>
      </ScrollView>
      <Box style={styles.dotContainer}>
        <Box style={styles.ctaBtnWrapper}>
          <Box>
            <Buttons
              secondaryText={common.back}
              secondaryCallback={secondaryBtnPress}
              primaryText={settings.SaveChanges}
              primaryDisable={
                path === wallet?.derivationDetails.xDerivationPath &&
                wallet?.specs?.balances?.confirmed === 0 &&
                wallet?.specs?.balances?.unconfirmed === 0
              }
              primaryCallback={() => {
                if (
                  wallet?.specs?.balances?.confirmed === 0 &&
                  wallet?.specs?.balances?.unconfirmed === 0
                ) {
                  setWarringsVisible(true);
                } else {
                  showToast(walletTranslation.walletBalanceMsg, <ToastErrorIcon />);
                }
              }}
              primaryLoading={relayWalletUpdateLoading}
            />
          </Box>
        </Box>
      </Box>
      <KeeperModal
        visible={warringsVisible}
        close={() => setWarringsVisible(false)}
        title={walletTranslation.changePathOfDefaultWallet}
        subTitle={walletTranslation.changePathOfDefaultWalletSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={false}
        Content={WarningContent}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    width: wp(300),
    height: hp(450),
    borderRadius: 10,
  },
  dropdown: {
    width: '100%',
    marginTop: 12,
    height: hp(50),
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    justifyContent: 'space-between',
  },
  inputFieldWrapper: {
    borderRadius: 10,
  },
  horizontalLine: {
    width: '95%',
    height: 2,
    alignSelf: 'center',
    opacity: 0.3,
  },
  title: {
    fontSize: 12,
    letterSpacing: 0.24,
  },
  scrollViewWrapper: {
    flex: 1,
  },
  dotContainer: {
    justifyContent: 'space-between',
    marginTop: hp(20),
  },
  ctaBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  langScrollViewWrapper: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: 6,
    paddingVertical: 10,
  },
  flagWrapper1: {
    height: wp(40),
    gap: 10,
    justifyContent: 'center',
  },
  purposeText: {
    fontSize: 13,
    marginLeft: wp(20),
    letterSpacing: 0.6,
  },
  contentText: {
    fontSize: 13,
    paddingHorizontal: 1,
    paddingVertical: 5,
    letterSpacing: 0.65,
  },
});

export default WalletPath;
