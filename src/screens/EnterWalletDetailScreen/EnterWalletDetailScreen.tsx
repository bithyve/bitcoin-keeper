import React, { useCallback, useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Input, Pressable, ScrollView, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import Buttons from 'src/components/Buttons';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import { DerivationPurpose, EntityKind, WalletType } from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BitcoinInput from 'src/assets/images/btc_black.svg';
import BitcoinWhite from 'src/assets/images/btc_white.svg';
import KeeperText from 'src/components/KeeperText';
import { useAppSelector } from 'src/store/hooks';
import useToastMessage from 'src/hooks/useToastMessage';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import TickIcon from 'src/assets/images/icon_tick.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { defaultTransferPolicyThreshold } from 'src/store/sagas/storage';
import { v4 as uuidv4 } from 'uuid';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import WalletUtilities from 'src/services/wallets/operations/utils';
import config from 'src/utils/service-utilities/config';
import { Linking, StyleSheet, TouchableOpacity } from 'react-native';
import { resetWalletStateFlags } from 'src/store/reducers/wallets';
import Text from 'src/components/KeeperText';
import { getCurrencyImageByRegion } from 'src/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Breadcrumbs from 'src/components/Breadcrumbs';
import { formatNumber } from 'src/utils/utilities';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import IconArrow from 'src/assets/images/icon_arrow_grey.svg';
import WalletVaultCreationModal from 'src/components/Modal/WalletVaultCreationModal';

const derivationPurposeToLabel = {
  [DerivationPurpose.BIP84]: 'P2WPKH: native segwit, single-sig',
  [DerivationPurpose.BIP49]: 'P2SH-P2WPKH: wrapped segwit, single-sig',
  [DerivationPurpose.BIP44]: 'P2PKH: legacy, single-sig',
  [DerivationPurpose.BIP86]: 'P2TR: taproot, single-sig',
};

// eslint-disable-next-line react/prop-types
function EnterWalletDetailScreen({ route }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const currencyCode = useCurrencyCode();
  const { translations } = useContext(LocalizationContext);
  const { wallet, choosePlan, common, importWallet } = translations;
  const [walletType, setWalletType] = useState(route.params?.type);
  const [walletName, setWalletName] = useState(route.params?.name);
  const [walletCreatedModal, setWalletCreatedModal] = useState(false)
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletDescription, setWalletDescription] = useState(route.params?.description);
  const [transferPolicy, setTransferPolicy] = useState(defaultTransferPolicyThreshold.toString());
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { hasNewWalletsGenerationFailed, err } = useAppSelector((state) => state.wallet);

  const [purpose, setPurpose] = useState(DerivationPurpose.BIP84);
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );
  const [showPurpose, setShowPurpose] = useState(false);
  const [purposeList, setPurposeList] = useState([
    { label: 'P2WPKH: native segwit, single-sig', value: DerivationPurpose.BIP84 },
    { label: 'P2TR: taproot, single-sig', value: DerivationPurpose.BIP86 },
  ]);
  const [purposeLbl, setPurposeLbl] = useState(derivationPurposeToLabel[purpose]);
  const [arrow, setArrow] = useState(false);

  const createNewWallet = useCallback(() => {
    // Note: only caters to new wallets(imported wallets currently have a different flow)
    setWalletLoading(true);
    const newWallet: NewWalletInfo = {
      walletType,
      walletDetails: {
        name: walletName,
        description: walletDescription,
        derivationConfig: {
          path,
          purpose,
        },
        transferPolicy: {
          id: uuidv4(),
          threshold: transferPolicy ? parseInt(transferPolicy) : 0,
        },
      },
    };
    dispatch(addNewWallets([newWallet]));
  }, [walletName, walletDescription, path, purpose, transferPolicy]);

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      if (walletType === WalletType.DEFAULT) {
        setWalletCreatedModal(true);
        // showToast(wallet.newWalletCreated, <TickIcon />);
        // navigtaion.goBack();
      } else {
        showToast(wallet.walletImported, <TickIcon />);
        navigtaion.goBack();
        Linking.openURL(`${route?.params.appId}://backup/true`);
      }
    }
    if (relayWalletError) {
      showToast(realyWalletErrorMessage || wallet.walletCreationFailed, <ToastErrorIcon />);
      setWalletLoading(false);
      dispatch(resetRealyWalletState());
    }
  }, [relayWalletUpdate, relayWalletError]);

  function FailedModalContent() {
    return (
      <Box w="100%">
        <Buttons
          primaryCallback={() => {
            navigtaion.replace('ChoosePlan');
            dispatch(resetWalletStateFlags());
          }}
          primaryText={choosePlan.viewSubscription}
          activeOpacity={0.5}
          secondaryCallback={() => {
            dispatch(resetWalletStateFlags());
            navigtaion.replace('ChoosePlan');
          }}
          secondaryText={common.cancel}
          paddingHorizontal={wp(30)}
        />
      </Box>
    );
  }

  useEffect(() => {
    const path = WalletUtilities.getDerivationPath(
      EntityKind.WALLET,
      config.NETWORK_TYPE,
      0,
      purpose
    );
    setPath(path);
  }, [purpose]);

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
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={walletType === WalletType.DEFAULT ? `${wallet.AddNewWallet}` : 'Import'}
        subtitle={wallet.AddNewWalletDescription}
      // To-Do-Learn-More
      />
      <Box style={{ flex: 1, justifyContent: 'space-between' }}>
        <Box style={styles.fieldsContainer}>
          <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.inputFieldWrapper}>
            <KeeperTextInput
              placeholder={wallet.WalletNamePlaceHolder}
              value={walletName}
              onChangeText={(value) => {
                if (route.params?.name === walletName) {
                  setWalletName('');
                  return;
                }
                setWalletName(value);
              }}
              maxLength={20}
              testID="input_wallet_name"
            />
          </Box>
          <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.inputFieldWrapper}>
            <KeeperTextInput
              placeholder={wallet.WalletDescriptionPlaceholder}
              value={walletDescription}
              onChangeText={(value) => {
                if (
                  route.params?.description === walletDescription &&
                  walletDescription.length > 0
                ) {
                  setWalletDescription('');
                  return;
                }
                setWalletDescription(value);
              }}
              maxLength={40}
              testID="input_wallet_description"
            />
          </Box>
          <Box>
            <Box style={styles.amountWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
              <Box>
                {getCurrencyImageByRegion(
                  currencyCode,
                  'dark',
                  CurrencyKind.BITCOIN,
                  colorMode === 'light' ? BitcoinInput : BitcoinWhite
                )}
              </Box>
              <Box width={0.5} backgroundColor={`${colorMode}.divider`} opacity={0.3} height={8} />
              <Input
                backgroundColor={`${colorMode}.seashellWhite`}
                placeholder={importWallet.enterAmount}
                placeholderTextColor={`${colorMode}.GreyText`}
                width="85%"
                fontSize={14}
                fontWeight={300}
                letterSpacing={1.04}
                borderWidth="0"
                value={formatNumber(transferPolicy)}
                onChangeText={(value) => {
                  setTransferPolicy(value);
                }}
                variant="unstyled"
                keyboardType="numeric"
                InputRightElement={<KeeperText bold>{common.sats}</KeeperText>}
                testID="input_transfer_policy"
              />
            </Box>
            <Text style={styles.balanceCrossesText} color={`${colorMode}.primaryText`}>
              {importWallet.walletBalance}
            </Text>
          </Box>
          <Box>
            <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.textInputWrapper}>
              <Text bold>{path}</Text>
            </Box>
            <Box style={{ position: 'relative' }}>
              <Pressable
                style={styles.dropDownContainer}
                backgroundColor={`${colorMode}.seashellWhite`}
                onPress={onDropDownClick}
              >
                <Text fontSize={12} bold color={`${colorMode}.primaryText`}>
                  {purposeLbl}
                </Text>
                <Box
                  style={[
                    {
                      transform: [{ rotate: arrow ? '-90deg' : '90deg' }],
                    },
                  ]}
                >
                  {colorMode === 'light' ? <RightArrowIcon /> : <IconArrow />}
                </Box>
              </Pressable>
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
            </Box>
          </Box>
        </Box>
        <Box style={styles.footer}>
          <Breadcrumbs totalScreens={walletType === WalletType.DEFAULT ? 3 : 4} currentScreen={2} />
          <Buttons
            primaryText={common.proceed}
            primaryCallback={createNewWallet}
            primaryDisable={!walletName}
            primaryLoading={walletLoading || relayWalletUpdateLoading}
          />
        </Box>
      </Box>
      <KeeperModal
        dismissible
        close={() => { }}
        visible={hasNewWalletsGenerationFailed}
        subTitle={err}
        title="Failed"
        Content={FailedModalContent}
        buttonText=""
        buttonCallback={() => {
          // setInitiating(true)
        }}
        showButtons
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title={'Wallet Created Successfully!'}
        subTitle={'Only have small amounts in this wallet'}
        buttonText={"View Wallet"}
        descriptionMessage={'Make sure you have secured the Recovery Key to backup your wallet'}
        buttonCallback={() => {
          setWalletCreatedModal(false);
          // navigtaion.navigate('WalletDetails', { walletId: wallet.id });
          navigtaion.goBack();
        }}
        walletType={walletType}
        walletName={walletName}
        walletDescription={walletDescription}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inputFieldWrapper: {
    borderRadius: 10,
  },
  amountWrapper: {
    marginTop: hp(30),
    flexDirection: 'row',
    height: hp(50),
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    justifyContent: 'space-between',
  },
  balanceCrossesText: {
    fontSize: 12,
    marginTop: hp(10),
    letterSpacing: 0.6,
    marginHorizontal: 10,
  },
  fieldsContainer: {
    marginVertical: 40,
    marginHorizontal: 10,
    gap: hp(10),
  },
  footer: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputWrapper: {
    borderRadius: 10,
    height: hp(50),
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  textInput: {
    padding: 20,
  },
  dropDownContainer: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 10,
    height: hp(50),
    marginTop: 10,
  },
  langScrollViewWrapper: {
    borderRadius: 10,
    zIndex: 10,
    marginTop: 5,
    position: 'absolute',
    alignSelf: 'center',
    width: '100%',
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
});

export default EnterWalletDetailScreen;
