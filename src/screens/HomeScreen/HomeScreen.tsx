import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  InteractionManager,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Linking,
} from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
// Components, Hooks and fonctions
import KeeperModal from 'src/components/KeeperModal';
import TestnetIndicator from 'src/components/TestnetIndicator';
import { useAppSelector } from 'src/store/hooks';
import useUaiStack from 'src/hooks/useUaiStack';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { LocalizationContext } from 'src/common/content/LocContext';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import { identifyUser } from 'src/core/services/sentry';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { Vault } from 'src/core/wallets/interfaces/vault';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import { getAmt, getUnit, isTestnet, getCurrencyImageByRegion } from 'src/common/constants/Bitcoin';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
// asserts (svgs, pngs)
import Arrow from 'src/assets/images/arrow.svg';
import BTC from 'src/assets/images/btc.svg';
import Chain from 'src/assets/images/illustration_homescreen.svg';
import DiamondHandsFocused from 'src/assets/images/ic_diamond_hands_focused.svg';
import Hidden from 'src/assets/images/hidden.svg';
import HodlerFocused from 'src/assets/images/ic_hodler_focused.svg';
import Inheritance from 'src/assets/images/inheritance.svg';
import LinkedWallet from 'src/assets/images/linked_wallet.svg';
import PlebFocused from 'src/assets/images/ic_pleb_focused.svg';
import SettingIcon from 'src/assets/images/settings.svg';
import VaultImage from 'src/assets/images/Vault.png';
import VaultIcon from 'src/assets/images/vaultSuccess.svg';
import usePlan from 'src/hooks/usePlan';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { useDispatch } from 'react-redux';
import { resetRealyWalletState } from 'src/store/reducers/bhr';
import { urlParamsToObj } from 'src/core/utils';
import useToastMessage from 'src/hooks/useToastMessage';
import { WalletType } from 'src/core/wallets/enums';
import UaiDisplay from './UaiDisplay';
import { WalletMap } from '../Vault/WalletMap';

function InheritanceComponent() {
  const navigation = useNavigation();
  const { plan } = usePlan();

  const onPress = () => {
    navigation.navigate('SetupInheritance');
  };

  return (
    <Box alignItems="center" marginTop={hp(19.96)}>
      <Pressable onPress={onPress} testID={'btn_Inheritance'}>
        <Box
          style={styles.bottomCard}
          backgroundColor={{
            linearGradient: {
              colors: ['light.gradientStart', 'light.gradientEnd'],
              start: [0, 0],
              end: [1, 1],
            },
          }}
        >

          <Box style={styles.bottomCardContent} >
            <Inheritance />
            <Box
              style={{
                marginLeft: wp(18),
              }}
            >
              <Text color="light.white" style={styles.bottomCardTitle}>
                Inheritance
              </Text>
              <Text color="light.white" style={styles.bottomCardSubtitle}>
                {plan === SubscriptionTier.L3.toUpperCase()
                  ? 'Tools, tips and templates'
                  : 'Upgrade to secure your vault'}
              </Text>
            </Box>
          </Box>
          <NextIcon pressHandler={() => onPress()} />
        </Box>
      </Pressable>
    </Box>
  );
}

function LinkedWallets(props) {
  const navigation = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const dispatch = useDispatch();
  const wallets: Wallet[] = useQuery(RealmSchema.Wallet).map(getJSONFromRealmObject);
  const netBalance = useAppSelector((state) => state.wallet.netBalance);
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(resetRealyWalletState());
  }, []);

  return (
    <Pressable
      style={{
        alignItems: 'center',
        marginTop: hp(8),
      }}
      onPress={() => navigation.dispatch(CommonActions.navigate('WalletDetails'))}
      testID='btn_LinkedWallet'
    >
      <Box
        backgroundColor={{
          linearGradient: {
            colors: ['light.gradientStart', 'light.gradientEnd'],
            start: [0, 0],
            end: [1, 1],
          },
        }}
        style={styles.bottomCard}
      >
        <Box style={styles.bottomCardContent}>
          <LinkedWallet />
          <Box style={styles.linkedWalletContent}>
            <Text
              color="light.white"
              fontSize={22}
              style={{
                letterSpacing: 1.76,
              }}
            >
              {wallets?.length}
            </Text>
            <Text color="light.white" style={styles.LinkedWalletText}>
              Linked Wallet{wallets?.length > 1 && 's'}
            </Text>
          </Box>
        </Box>
        <Pressable onPress={() => props.onAmountPress()}>
          {props.showHideAmounts ? (
            <Box
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Box
                style={{
                  padding: 3,
                  // marginBottom: -3,
                }}
              >
                {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BTC)}
              </Box>
              <Text
                color="light.white"
                fontSize={hp(21)}
                style={{
                  letterSpacing: 0.6,
                }}
              >
                {getAmt(netBalance, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
              </Text>
              <Text
                color="light.white"
                style={{
                  paddingLeft: 3,
                  letterSpacing: 0.6,
                  fontSize: hp(12),
                }}
              >
                {getUnit(currentCurrency, satsEnabled)}
              </Text>
            </Box>
          ) : (
            <Box
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BTC)}
              &nbsp;
              <Hidden />
            </Box>
          )}
        </Pressable>
      </Box>
    </Pressable>
  );
}

function VaultStatus(props) {
  const { translations } = useContext(LocalizationContext);
  const navigation = useNavigation();
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);

  const Vault: Vault =
    useQuery(RealmSchema.Vault)
      .map(getJSONFromRealmObject)
      .filter((vault) => !vault.archived)[0] || [];
  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
    signers = [],
  } = Vault;
  const vaultBalance = confirmed + unconfirmed;

  const open = () => {
    if (signers.length) {
      navigation.dispatch(CommonActions.navigate({ name: 'VaultDetails' }));
    } else {
      navigateToHardwareSetup();
    }
  };

  const navigateToHardwareSetup = () => {
    navigation.dispatch(CommonActions.navigate({ name: 'AddSigningDevice', params: {} }));
  };

  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus());

  const onChangeTorStatus = (status: TorStatus) => {
    settorStatus(status);
  };

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      RestClient.subToTorStatus(onChangeTorStatus);
      identifyUser(keeper.publicId);
    });
    return () => {
      RestClient.unsubscribe(onChangeTorStatus);
    };
  }, []);

  const getTorStatusText = useMemo(() => {
    switch (torStatus) {
      case TorStatus.OFF:
        return 'Tor disabled';
      case TorStatus.CONNECTING:
        return 'Connecting to Tor';
      case TorStatus.CONNECTED:
        return 'Tor enabled';
      case TorStatus.ERROR:
        return 'Tor error';
      default:
        return torStatus;
    }
  }, [torStatus]);

  const getTorStatusColor = useMemo(() => {
    switch (torStatus) {
      case TorStatus.OFF:
        return 'light.lightAccent';
      case TorStatus.CONNECTING:
        return 'light.lightAccent';
      case TorStatus.CONNECTED:
        return '#c6ecae';
      case TorStatus.ERROR:
        return 'red.400';
      default:
        return 'light.lightAccent';
    }
  }, [torStatus]);

  return (
    <Box style={styles.vaultStatusContainder}>
      <Pressable testID="btn_vault">
        <ImageBackground resizeMode="contain" source={VaultImage}>
          <TouchableOpacity onPress={open} activeOpacity={0.7}>
            <Box style={styles.vault}>
              <Box style={styles.torContainer}>
                {getTorStatusText !== 'Tor disabled' && (
                  <Box backgroundColor={getTorStatusColor} borderRadius={10} px={1}>
                    <Text color="light.primaryText" style={styles.torText} bold>
                      {getTorStatusText}
                    </Text>
                  </Box>
                )}
              </Box>
              <Box style={styles.vaultBody}>
                <Text color="light.white" style={styles.vaultHeading} bold>
                  Your Vault
                </Text>

                <Text color="light.white" style={styles.vaultSubHeading} bold>
                  {!signers.length
                    ? 'Add a signing device to enable '
                    : `Secured by ${signers.length} signing device${signers.length ? 's' : ''}`}
                </Text>

                {!signers.length ? (
                  <Box
                    style={{
                      marginTop: hp(11.5),
                    }}
                  >
                    <Chain />
                  </Box>
                ) : (
                  <Box style={styles.vaultSignersContainer}>
                    {signers.map((signer) => (
                      <Box backgroundColor="light.lightAccent" style={styles.vaultSigner}>
                        {WalletMap(signer.type).Icon}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              <HStack style={styles.vaultBalanceContainer}>
                {getCurrencyImageByRegion(currencyCode, 'light', currentCurrency, BTC)}
                <Pressable>
                  {props.showHideAmounts ? (
                    <Box style={styles.rowCenter}>
                      <Text color="light.white" fontSize={hp(30)} style={styles.vaultBalanceText}>
                        {getAmt(vaultBalance, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                      </Text>
                      <Text color="light.white" style={styles.vaultBalanceUnit}>
                        {getUnit(currentCurrency, satsEnabled)}
                      </Text>
                    </Box>
                  ) : (
                    <Box
                      style={{
                        marginVertical: 15,
                        marginLeft: 3,
                      }}
                    >
                      <Hidden />
                    </Box>
                  )}
                </Pressable>
              </HStack>
              <Pressable
                backgroundColor="light.accent"
                style={styles.balanceToggleContainer}
                onPress={() => props.onAmountPress()}
                testID={`btn_${!props.showHideAmounts ? 'Show_Balances' : 'Hide_Balances'}`}
              >
                <Text color="light.sendMax" style={styles.balanceToggleText} bold>
                  {!props.showHideAmounts ? 'Show Balances' : 'Hide Balances'}
                </Text>
              </Pressable>
            </Box>
          </TouchableOpacity>
        </ImageBackground>
      </Pressable>
    </Box>
  );
}

function VaultInfo() {
  const navigation = useNavigation();
  const { uaiStack } = useUaiStack();
  const { plan } = usePlan();

  function getPlanIcon() {
    switch (plan) {
      case SubscriptionTier.L1.toUpperCase():
        return <PlebFocused />;
      case SubscriptionTier.L2.toUpperCase():
        return <HodlerFocused />;
      case SubscriptionTier.L3.toUpperCase():
        return <DiamondHandsFocused />;
      default:
        return <PlebFocused />;
    }
  }

  return (
    <Box
      backgroundColor={{
        linearGradient: {
          colors: ['light.gradientStart', 'light.gradientEnd'],
          start: [0, 0],
          end: [1, 1],
        },
      }}
      style={styles.linearGradient}
    >
      <Box style={styles.vaultInfoContainer}>
        <Box style={styles.subscriptionContainer}>
          <Box style={styles.rowCenter}>
            <Pressable
              style={styles.subscriptionIcon}
              onPress={() => navigation.navigate('ChoosePlan')}
              testID={`btn_${plan}`}
            >
              {getPlanIcon()}
              <Box
                backgroundColor="#015A53"
                borderColor="light.white"
                style={styles.subscriptionTextContainer}
              >
                <Text color="light.white" style={styles.subscriptionText}>
                  {plan}
                </Text>
              </Box>
            </Pressable>
            {isTestnet() && <TestnetIndicator />}
          </Box>
          <Pressable testID={`btn_AppSettings`} onPress={() => navigation.dispatch(CommonActions.navigate('AppSettings'))}>
            <SettingIcon />
          </Pressable>
        </Box>
        <UaiDisplay uaiStack={uaiStack} />
      </Box>
    </Box>
  );
}

export function NextIcon({ pressHandler }) {
  return (
    <Pressable onPress={pressHandler}>
      <Box
        backgroundColor="light.accent"
        height={hp(37.352)}
        width={hp(37.352)}
        borderRadius={20}
        justifyContent="center"
        alignItems="center"
      >
        <Arrow />
      </Box>
    </Pressable>
  );
}
function TransVaultSuccessfulContent() {
  return (
    <Box>
      <Box alignSelf="center">
        <VaultIcon />
      </Box>
      <Text color="light.greenText" fontSize={13} padding={2}>
        The transaction should be visible in the vault in some time.
      </Text>
    </Box>
  );
}
function HomeScreen({ navigation }) {
  const [showHideAmounts, setShowHideAmounts] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const { showToast } = useToastMessage();

  useEffect(() => {
    handleDeepLinking();
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  async function handleDeepLinking() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        if (initialUrl.includes('backup')) {
          const splits = initialUrl.split('backup/');
          const decoded = Buffer.from(splits[1], 'base64').toString();
          const params = urlParamsToObj(decoded);
          if (params.seed) {
            navigation.navigate('EnterWalletDetail', {
              seed: params.seed,
              name: params.name,
              path: params.path,
              appId: params.appId,
              description: `Imported from ${params.name}`,
              type: WalletType.IMPORTED,
            });
          } else {
            showToast('Invalid deeplink');
          }
        } else if (initialUrl.includes('create/')) {
        }
      }
    } catch (error) {
      //
    }
  }

  return (
    <Box style={styles.container}>
      <VaultInfo />
      <VaultStatus
        showHideAmounts={showHideAmounts}
        onAmountPress={() => {
          setShowHideAmounts(!showHideAmounts);
        }}
      />
      <Box style={styles.bottomContainer}>
        <InheritanceComponent />
        <LinkedWallets onAmountPress={() => { }} showHideAmounts={showHideAmounts} />
      </Box>
      {/* Modal */}
      <KeeperModal
        visible={visibleModal}
        close={() => setVisibleModal(false)}
        title="Transfer to Vault Successfull"
        subTitle="You have successfully transferred from your wallet to the vault"
        buttonText="View Vault"
        textcolor="light.greenText"
        buttonTextColor="light.white"
        Content={TransVaultSuccessfulContent}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  linearGradient: {
    justifyContent: 'space-between',
    paddingTop: hp(57),
    height: hp(325),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  vaultInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: wp(30),
  },
  vault: {
    width: wp(280),
    height: hp(350),
    alignItems: 'center',
  },
  subscriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  subscriptionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: wp(35),
  },
  subscriptionTextContainer: {
    borderWidth: 0.8,
    borderBottomRightRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 10,
    marginHorizontal: -8,
    zIndex: -10,
  },
  subscriptionText: {
    fontSize: hp(14),
    padding: 4,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 15,
    justifyContent: 'center',
    width: '100%',
  },
  bottomCard: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: hp(95),
    width: wp(335),
    borderRadius: 10,
    flexDirection: 'row',
    paddingHorizontal: wp(10),
  },
  dummy: {
    height: 200,
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#092C27',
    opacity: 0.15,
  },
  vaultStatusContainder: {
    marginTop: -hp(100),
    alignItems: 'center',
  },
  torContainer: {
    marginTop: hp(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  torText: {
    letterSpacing: 0.75,
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  vaultBody: {
    marginTop: hp(windowHeight > 700 ? 60.5 : 25),
    alignItems: 'center',
  },
  vaultHeading: {
    letterSpacing: 0.8,
    fontSize: 16,
  },
  vaultSubHeading: {
    letterSpacing: 0.9,
    fontSize: 12,
    opacity: 0.8,
    paddingBottom: 2,
  },
  vaultSignersContainer: {
    marginTop: hp(10),
    flexDirection: 'row',
  },
  vaultSigner: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    width: 30,
    height: 30,
    borderRadius: 30,
  },
  vaultBalanceContainer: {
    alignItems: 'center',
    marginTop: hp(windowHeight > 700 ? 20 : 10),
  },
  vaultBalanceText: {
    letterSpacing: 0.8,
    padding: 3,
  },
  vaultBalanceUnit: {
    fontSize: hp(12),
    letterSpacing: 0.6,
  },
  balanceToggleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  balanceToggleText: {
    fontSize: 11,
    letterSpacing: 0.88,
  },

  bottomCardContent: {
    marginLeft: wp(9.75),
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomCardTitle: {
    letterSpacing: 0.8,
    fontSize: 16,
    marginBottom: 3,
  },
  bottomCardSubtitle: {
    letterSpacing: 0.6,
    fontSize: 12,
    fontWeight: '300',
    marginTop: -3,
  },
  LinkedWalletText: {
    marginLeft: wp(5),
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
  },
  linkedWalletContent: {
    marginLeft: wp(18),
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;
