import React, { useCallback, useState, useContext, useEffect } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, Input, Pressable, useColorMode } from 'native-base';
import KeeperHeader from 'src/components/KeeperHeader';
import Buttons from 'src/components/Buttons';
import { NewWalletInfo } from 'src/store/sagas/wallets';
import {
  DerivationPurpose,
  EntityKind,
  ImportedKeyType,
  WalletType,
} from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { addNewWallets } from 'src/store/sagaActions/wallets';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BitcoinInput from 'src/assets/images/btc_black.svg';
import BitcoinWhite from 'src/assets/images/btc_white.svg';
import PrivacyIcon from 'src/assets/images/privacy.svg';
import EfficiencyIcon from 'src/assets/images/efficiency.svg';
import SaclingIcon from 'src/assets/images/scaling.svg';
import SecurityIcon from 'src/assets/images/security.svg';

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
import { Linking, StyleSheet } from 'react-native';
import { resetWalletStateFlags } from 'src/store/reducers/wallets';
import Text from 'src/components/KeeperText';
import { getCurrencyImageByRegion } from 'src/constants/Bitcoin';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Breadcrumbs from 'src/components/Breadcrumbs';
import { formatNumber } from 'src/utils/utilities';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import SettingsIcon from 'src/assets/images/settings_brown.svg';
import WalletVaultCreationModal from 'src/components/Modal/WalletVaultCreationModal';
import useWallets from 'src/hooks/useWallets';
import DerivationPathModalContent from './DerivationPathModal';
import { goToConcierge } from 'src/store/sagaActions/concierge';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';

// eslint-disable-next-line react/prop-types
function EnterWalletDetailScreen({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const currencyCode = useCurrencyCode();
  const { wallets } = useWallets({ getAll: true });
  const { translations } = useContext(LocalizationContext);
  const { wallet, choosePlan, common, importWallet } = translations;
  const [walletType, setWalletType] = useState(route.params?.type);
  const [walletName, setWalletName] = useState(route.params?.name);
  const [walletCreatedModal, setWalletCreatedModal] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletDescription, setWalletDescription] = useState(route.params?.description);
  const [transferPolicy, setTransferPolicy] = useState(
    defaultTransferPolicyThreshold?.toString() || ''
  );
  const { relayWalletUpdateLoading, relayWalletUpdate, relayWalletError, realyWalletErrorMessage } =
    useAppSelector((state) => state.bhr);
  const { hasNewWalletsGenerationFailed, err } = useAppSelector((state) => state.wallet);
  const [visibleModal, setVisibleModal] = useState(false);
  const [purpose, setPurpose] = useState(DerivationPurpose.BIP84);
  const [path, setPath] = useState(
    route.params?.path
      ? route.params?.path
      : WalletUtilities.getDerivationPath(EntityKind.WALLET, config.NETWORK_TYPE, 0, purpose)
  );
  const [advancedSettingsVisible, setAdvancedSettingsVisible] = useState(false);
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
    if (walletType === WalletType.IMPORTED) {
      newWallet.importDetails = {
        derivationConfig: {
          path,
          purpose,
        },
        importedKey: route.params?.seed.replace(/,/g, ' '),
        importedKeyDetails: {
          importedKeyType: ImportedKeyType.MNEMONIC,
          purpose,
          watchOnly: false,
        },
      };
    }
    dispatch(addNewWallets([newWallet]));
  }, [walletName, walletDescription, path, purpose, transferPolicy]);

  useEffect(() => {
    if (relayWalletUpdate) {
      dispatch(resetRealyWalletState());
      setWalletLoading(false);
      if (walletType === WalletType.DEFAULT) {
        setWalletCreatedModal(true);
      } else {
        showToast(wallet.walletImported, <TickIcon />);
        navigation.goBack();
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
            navigation.replace('ChoosePlan');
            dispatch(resetWalletStateFlags());
          }}
          primaryText={choosePlan.viewSubscription}
          activeOpacity={0.5}
          secondaryCallback={() => {
            dispatch(resetWalletStateFlags());
            navigation.replace('ChoosePlan');
          }}
          secondaryText={common.cancel}
          paddingHorizontal={wp(30)}
        />
      </Box>
    );
  }

  function TapRootContent() {
    const { colorMode } = useColorMode();
    const { translations } = useContext(LocalizationContext);
    const { wallet } = translations;
    return (
      <Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <PrivacyIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootPrivacy}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootPrivacyDesc}
            </Text>
          </Box>
        </Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <EfficiencyIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootEfficiency}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootEfficiencyDesc}
            </Text>
          </Box>
        </Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <SaclingIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootScalable}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootScalableDesc}
            </Text>
          </Box>
        </Box>
        <Box style={styles.tapRootContainer}>
          <Box style={styles.tapRootIconWrapper}>
            <SecurityIcon />
          </Box>
          <Box style={styles.tapRootContentWrapper}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootTitleText}>
              {wallet.tapRootSecurity}
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.tapRootDescText}>
              {wallet.tapRootSecurityDesc}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={walletType === WalletType.DEFAULT ? `${wallet.AddNewWallet}` : 'Import'}
        subtitle={wallet.AddNewWalletDescription}
        rightComponent={
          <Pressable
            style={styles.advancedContainer}
            onPress={() => setAdvancedSettingsVisible(true)}
          >
            <SettingsIcon />
            <Text color={`${colorMode}.BrownNeedHelp`} bold fontSize={13}>
              Advanced
            </Text>
          </Pressable>
        }
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
              maxLength={18}
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
              maxLength={20}
              testID="input_wallet_description"
            />
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
        visible={advancedSettingsVisible}
        close={() => setAdvancedSettingsVisible(false)}
        title={importWallet.derivationPath}
        subTitle="Change or update purpose"
        subTitleWidth={wp(240)}
        subTitleColor={`${colorMode}.secondaryText`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        showCloseIcon={false}
        learnMoreButton={true}
        learnButtonTextColor={`${colorMode}.white`}
        learnMoreButtonPressed={() => {
          setVisibleModal(true);
        }}
        Content={() => (
          <DerivationPathModalContent
            initialPath={path}
            initialPurpose={purpose}
            closeModal={() => setAdvancedSettingsVisible(false)}
            setSelectedPath={setPath}
            setSelectedPurpose={setPurpose}
          />
        )}
      />
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
        subTitleColor={`${colorMode}.secondaryText`}
        subTitleWidth={wp(210)}
        showCloseIcon={false}
      />
      <WalletVaultCreationModal
        visible={walletCreatedModal}
        title="Wallet Created Successfully!"
        subTitle="Only have small amounts in this wallet"
        buttonText="View Wallet"
        descriptionMessage="Make sure you have secured the Recovery Key to backup your wallet"
        buttonCallback={() => {
          setWalletCreatedModal(false);
          navigation.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'Home' },
                {
                  name: 'WalletDetails',
                  params: { autoRefresh: true, walletId: wallets[wallets.length - 1].id },
                },
              ],
            })
          );
        }}
        walletType={walletType}
        walletName={walletName}
        walletDescription={walletDescription}
      />
      <KeeperModal
        visible={visibleModal}
        close={() => {
          setVisibleModal(false);
        }}
        title={wallet.tapRootBenefits}
        subTitle={''}
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={TapRootContent}
        showCloseIcon={true}
        DarkCloseIcon
        secondaryButtonText={common.ok}
        buttonText={common.needHelp}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
        buttonCallback={() => {
          setAdvancedSettingsVisible(false);
          setVisibleModal(false);
          dispatch(goToConcierge([ConciergeTag.WALLET], 'add-wallet-advanced-settings'));
        }}
        secondaryCallback={() => setVisibleModal(false)}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  inputFieldWrapper: {
    borderRadius: 10,
    marginHorizontal: 10,
  },
  amountWrapper: {
    marginHorizontal: 10,
    marginTop: hp(30),
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    justifyContent: 'space-between',
  },
  balanceCrossesText: {
    fontSize: 12,
    letterSpacing: 0.12,
    marginTop: hp(10),
    marginHorizontal: 12,
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
  advancedContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  tapRootContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  tapRootIconWrapper: {
    width: '15%',
  },
  tapRootContentWrapper: {
    width: '85%',
    marginBottom: hp(20),
  },
  tapRootDescText: {
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
    marginBottom: 5,
  },
  tapRootTitleText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.65,
    padding: 1,
  },
});

export default EnterWalletDetailScreen;
