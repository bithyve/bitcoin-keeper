import React, { useCallback, useState, useContext, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Input, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import Buttons from 'src/components/Buttons';
import { DerivationConfig, NewWalletInfo } from 'src/store/sagas/wallets';
import { EntityKind, WalletType } from 'src/core/wallets/enums';
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
import WalletUtilities from 'src/core/wallets/operations/utils';
import config from 'src/core/config';
import { Linking, StyleSheet } from 'react-native';
import { resetWalletStateFlags } from 'src/store/reducers/wallets';
import Text from 'src/components/KeeperText';
import { getCurrencyImageByRegion } from 'src/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Breadcrumbs from 'src/components/Breadcrumbs';

// eslint-disable-next-line react/prop-types
function EnterWalletDetailScreen({ navigation, route }) {
  const { colorMode } = useColorMode();
  const navigtaion = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { translations } = useContext(LocalizationContext);
  const { wallet, choosePlan, common, importWallet } = translations;
  const [walletType, setWalletType] = useState(route.params?.type);
  const [importedSeed, setImportedSeed] = useState(route.params?.seed?.replace(/,/g, ' '));
  const [walletName, setWalletName] = useState(route.params?.name);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletDescription, setWalletDescription] = useState(route.params?.description);
  const [transferPolicy, setTransferPolicy] = useState(defaultTransferPolicyThreshold.toString());
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { hasNewWalletsGenerationFailed, err } = useAppSelector((state) => state.wallet);
  const [purpose, setPurpose] = useState(route.params?.purpose);
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );
  useEffect(() => {
    if (walletType !== WalletType.DEFAULT) {
      const path = WalletUtilities.getDerivationPath(
        EntityKind.WALLET,
        config.NETWORK_TYPE,
        0,
        Number(purpose)
      );
      setPath(path);
    }
  }, [purpose]);

  const createNewWallet = useCallback(() => {
    setWalletLoading(true);
    setTimeout(() => {
      // TODO: remove this timeout once the crypto is optimised
      const derivationConfig: DerivationConfig = {
        path,
        purpose: Number(purpose),
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
          derivationConfig,
          mnemonic: importedSeed,
        },
      };
      dispatch(addNewWallets([newWallet]));
    }, 200);
  }, [walletName, walletDescription, transferPolicy]);

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      if (walletType === WalletType.DEFAULT) {
        showToast(wallet.newWalletCreated, <TickIcon />);
        navigtaion.goBack();
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

  // Format number with comma
  // Example: 1000000 => 1,000,000
  const formatNumber = (value: string) =>
    value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

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

  const onQrScan = (qrData) => {
    navigtaion.goBack();
    const words = qrData.split(' ');
    if (words.length === 12 || words.length === 24) {
      setImportedSeed(qrData);
      setWalletType(WalletType.IMPORTED);
    } else {
      showToast('Invalid QR');
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
                  currentCurrency,
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
        </Box>
        <Box style={styles.footer}>
          <Breadcrumbs totalScreens={walletType === WalletType.DEFAULT ? 3 : 4} currentScreen={2} />
          <Buttons
            primaryText={
              walletType === WalletType.DEFAULT ? `${common.create}` : `${common.proceed}`
            }
            primaryCallback={() =>
              walletType === WalletType.DEFAULT
                ? createNewWallet()
                : navigation.navigate('EnterWalletPath', {
                    createNewWallet,
                  })
            }
            primaryDisable={!walletName}
            primaryLoading={walletLoading || relayWalletUpdateLoading}
          />
        </Box>
      </Box>
      <KeeperModal
        dismissible
        close={() => {}}
        visible={hasNewWalletsGenerationFailed}
        subTitle={err}
        title="Failed"
        Content={FailedModalContent}
        buttonText=""
        buttonCallback={() => {
          // setInitiating(true)
        }}
        showButtons
        subTitleColor="light.secondaryText"
        subTitleWidth={wp(210)}
        showCloseIcon={false}
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
});

export default EnterWalletDetailScreen;
