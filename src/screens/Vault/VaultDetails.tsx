import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
// asserts
import AddIcon from 'src/assets/images/icon_add_plus.svg';
import BackIcon from 'src/assets/images/back_white.svg';
import Buy from 'src/assets/images/icon_buy.svg';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'src/components/KeeperGradient';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import Recieve from 'src/assets/images/receive.svg';
import { ScrollView } from 'react-native-gesture-handler';
import Send from 'src/assets/images/send.svg';
import SignerIcon from 'src/assets/images/icon_vault_coldcard.svg';
import Success from 'src/assets/images/Success.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import { SignerType, VaultMigrationType } from 'src/core/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { getNetworkAmount } from 'src/common/constants/Bitcoin';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import moment from 'moment';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSignerNameFromType, isSignerAMF, UNVERIFYING_SIGNERS } from 'src/hardware';
import usePlan from 'src/hooks/usePlan';
import useToastMessage from 'src/hooks/useToastMessage';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import useVault from 'src/hooks/useVault';
import { WalletMap } from './WalletMap';
import TierUpgradeModal from '../ChoosePlanScreen/TierUpgradeModal';

function Footer({ vault }: { vault: Vault }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();

  const styles = getStyles(0);
  return (
    <Box>
      <Box borderWidth={0.5} borderColor="light.GreyText" borderRadius={20} opacity={0.2} />
      <Box flexDirection="row" justifyContent="space-between" marginX={10} marginTop={3}>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            // if (
            //   vault.signers.find((item) =>
            //     [SignerType.BITBOX02, SignerType.TREZOR].includes(item.type)
            //   )
            // ) {
            //   showToast('Send is not supported yet with Bitbox and Trezor.');
            //   return;
            // }
            navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
          }}
        >
          <Send />
          <Text color="light.primaryText" style={styles.footerText}>
            Send
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
          }}
        >
          <Recieve />
          <Text color="light.primaryText" style={styles.footerText}>
            Receive
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            showToast('Comming Soon');
          }}
        >
          <Buy />
          <Text color="light.primaryText" style={styles.footerText}>
            Buy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
            navigation.navigate('VaultSettings');
          }}
        >
          <IconSettings />
          <Text color="light.primaryText" style={styles.footerText}>
            Settings
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function Header() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const styles = getStyles(0);
  return (
    <Box flexDirection="row" width="100%" px="2%">
      <StatusBar barStyle="light-content" />
      <Box width="50%">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box width="50%">
        <TouchableOpacity style={styles.knowMore} onPress={() => dispatch(setIntroModal(true))}>
          <Text color="light.white" style={styles.footerText} light>
            Know More
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function VaultInfo({ vault }: { vault: Vault }) {
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);

  const styles = getStyles(0);
  return (
    <VStack paddingY={12}>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack>
          <Box paddingRight={3}>
            <VaultIcon />
          </Box>
          <VStack>
            <Text color="light.white" style={styles.vaultInfoText} fontSize={16}>
              {name}
            </Text>
            <Text color="light.white" style={styles.vaultInfoText} fontSize={12}>
              {description}
            </Text>
          </VStack>
        </HStack>
        <VStack alignItems="flex-end">
          <Text color="light.white" style={styles.vaultInfoText} fontSize={9}>
            Unconfirmed
          </Text>
          {getNetworkAmount(
            unconfirmed,
            exchangeRates,
            currencyCode,
            currentCurrency,
            [styles.vaultInfoText, { fontSize: 12 }],
            0.9
          )}
        </VStack>
      </HStack>
      <VStack paddingBottom="16" paddingTop="6">
        {getNetworkAmount(confirmed, exchangeRates, currencyCode, currentCurrency, [
          styles.vaultInfoText,
          { fontSize: 31, lineHeight: 31 },
          2,
        ])}
        <Text color="light.white" style={styles.vaultInfoText} fontSize={9}>
          Available Balance
        </Text>
      </VStack>
    </VStack>
  );
}

function TransactionList({ transactions, pullDownRefresh, pullRefresh }) {
  const navigation = useNavigation();

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
          })
        );
      }}
    />
  );
  return (
    <>
      <VStack style={{ paddingTop: windowHeight * 0.09 }}>
        <HStack justifyContent="space-between">
          <Text color="light.textBlack" marginLeft={wp(3)} fontSize={16} letterSpacing={1.28}>
            Transactions
          </Text>
          {transactions.lenth ? (
            <TouchableOpacity>
              <HStack alignItems="center">
                <TouchableOpacity
                  onPress={() => {
                    navigation.dispatch(
                      CommonActions.navigate('VaultTransactions', {
                        title: 'Vault Transactions',
                        subtitle: 'All incoming and outgoing transactions',
                      })
                    );
                  }}
                >
                  <Text
                    color="light.primaryGreen"
                    marginRight={2}
                    fontSize={11}
                    bold
                    letterSpacing={0.6}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
                <IconArrowBlack />
              </HStack>
            </TouchableOpacity>
          ) : null}
        </HStack>
      </VStack>
      <FlatList
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView
            IllustartionImage={NoVaultTransactionIcon}
            title="Security Tip"
            subTitle="Recreate the multisig on more coordinators. Receive a small amount and send a part of it. Check the balances are appropriately reflected across all the coordinators after each step."
          />
        }
      />
    </>
  );
}

function SignerList({ upgradeStatus, vault }: { upgradeStatus: VaultMigrationType; vault: Vault }) {
  const { signers: Signers, isMultiSig } = vault;
  const styles = getStyles(0);
  const navigation = useNavigation();

  const AddSigner = useCallback(() => {
    if (upgradeStatus === VaultMigrationType.UPGRADE) {
      return (
        <LinearGradient
          start={[0, 0]}
          end={[1, 1]}
          colors={['#B17F44', '#6E4A35']}
          style={[styles.signerCard]}
        >
          <TouchableOpacity
            onPress={() => {
              navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
            }}
          >
            <Box
              margin="1"
              marginBottom="3"
              width="12"
              height="12"
              borderRadius={30}
              justifyContent="center"
              alignItems="center"
              marginX={1}
              alignSelf="center"
            >
              <AddIcon />
            </Box>
            <VStack pb={2}>
              <Text color="light.white" fontSize={10} bold letterSpacing={0.6} textAlign="center">
                Add signing device to upgrade
              </Text>
            </VStack>
          </TouchableOpacity>
        </LinearGradient>
      );
    }
    return null;
  }, [upgradeStatus]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ position: 'absolute', top: `${70 - Signers.length}%` }}
      showsHorizontalScrollIndicator={false}
      horizontal
    >
      {Signers.map((signer) => {
        const indicate =
          !signer.registered && isMultiSig && !UNVERIFYING_SIGNERS.includes(signer.type);

        return (
          <Box style={styles.signerCard} marginRight="3">
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('SigningDeviceDetails', {
                    SignerIcon: <SignerIcon />,
                    signerId: signer.signerId,
                    vaultId: vault.id,
                  })
                );
              }}
            >
              {indicate ? <Box style={styles.indicator} /> : null}
              <Box
                margin="1"
                width="12"
                height="12"
                borderRadius={30}
                backgroundColor="#725436"
                justifyContent="center"
                alignItems="center"
                alignSelf="center"
              >
                {WalletMap(signer.type, true).Icon}
              </Box>
              <Text bold style={styles.unregistered}>
                {indicate ? 'Not registered' : ' '}
              </Text>
              <VStack pb={2}>
                <Text
                  color="light.textBlack"
                  fontSize={11}
                  letterSpacing={0.6}
                  textAlign="center"
                  numberOfLines={1}
                >
                  {getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer))}
                </Text>
                <Text
                  color="light.textBlack"
                  fontSize={8}
                  letterSpacing={0.6}
                  textAlign="center"
                  numberOfLines={2}
                >
                  {signer.signerDescription
                    ? signer.signerDescription
                    : `Added ${moment(signer.addedOn).fromNow().toLowerCase()}`}
                </Text>
              </VStack>
            </TouchableOpacity>
          </Box>
        );
      })}
      <AddSigner />
    </ScrollView>
  );
}

function VaultDetails({ route, navigation }) {
  const { vaultTransferSuccessful = false, autoRefresh } = route.params || {};

  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { useQuery } = useContext(RealmWrapperContext);
  const { top } = useSafeAreaInsets();
  const vault: Vault = useVault().activeVault;
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [pullRefresh, setPullRefresh] = useState(false);
  const [vaultCreated, setVaultCreated] = useState(vaultTransferSuccessful);
  const [tireChangeModal, setTireChangeModal] = useState(false);
  const { subscriptionScheme } = usePlan();

  const onPressModalBtn = () => {
    setTireChangeModal(false);
    navigation.navigate('AddSigningDevice');
  };

  const transactions = vault?.specs?.transactions || [];
  const hasPlanChanged = (): VaultMigrationType => {
    const currentScheme = vault.scheme;
    if (currentScheme.m > subscriptionScheme.m) {
      return VaultMigrationType.DOWNGRADE;
    }
    if (currentScheme.m < subscriptionScheme.m) {
      return VaultMigrationType.UPGRADE;
    }
    return VaultMigrationType.CHANGE;
  };

  useEffect(() => {
    if (autoRefresh) syncVault();
  }, [autoRefresh]);

  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([vault], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const closeVaultCreatedDialog = () => {
    setVaultCreated(false);
  };

  useEffect(() => {
    if (hasPlanChanged() !== VaultMigrationType.CHANGE) {
      setTireChangeModal(true);
    }
  }, []);

  const styles = getStyles(top);

  const VaultContent = useCallback(
    () => (
      <View marginY={5}>
        <Box alignSelf="center">
          <VaultSetupIcon />
        </Box>
        <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          Keeper supports all the popular bitcoin signing devices (Hardware Wallets) that a user can
          select
        </Text>
        <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
          There are also some additional options if you do not have hardware signing devices
        </Text>
      </View>
    ),
    []
  );

  const NewVaultContent = useCallback(
    () => (
      <View>
        <Success />
        <Text fontSize={13} letterSpacing={0.65} color="light.greenText" marginTop={3}>
          For sending out of the vault you will need the signing devices. This means no one can
          steal your bitcoin in the vault unless they also have the signing devices
        </Text>
      </View>
    ),
    []
  );

  return (
    <LinearGradient
      colors={['#B17F44', '#6E4A35']}
      style={styles.container}
      start={[-0.5, 1]}
      end={[1, 1]}
    >
      <VStack zIndex={1}>
        <VStack mx="8%" mt={5}>
          <Header />
          <VaultInfo vault={vault} />
        </VStack>
        <SignerList upgradeStatus={hasPlanChanged()} vault={vault} />
      </VStack>
      <VStack
        backgroundColor="light.primaryBackground"
        px={wp(28)}
        borderTopLeftRadius={20}
        flex={1}
        justifyContent="space-between"
        paddingBottom={windowHeight > 800 ? 5 : 0}
      >
        <TransactionList
          transactions={transactions}
          pullDownRefresh={syncVault}
          pullRefresh={pullRefresh}
        />
        <Footer vault={vault} />
      </VStack>
      <TierUpgradeModal
        visible={tireChangeModal}
        close={() => {
          if (hasPlanChanged() === VaultMigrationType.DOWNGRADE) {
            return;
          }
          setTireChangeModal(false);
        }}
        onPress={onPressModalBtn}
        isUpgrade={hasPlanChanged() === VaultMigrationType.UPGRADE}
        plan={keeper.subscription.name}
        closeOnOverlayClick={hasPlanChanged() !== VaultMigrationType.DOWNGRADE}
      />
      <KeeperModal
        visible={vaultCreated}
        title="New Vault Created"
        subTitle={`Your vault with ${vault.scheme.m} of ${vault.scheme.n} has been successfully setup. You can start receiving bitcoin in it`}
        buttonText="View Vault"
        subTitleColor="light.secondaryText"
        buttonCallback={closeVaultCreatedDialog}
        close={closeVaultCreatedDialog}
        Content={NewVaultContent}
      />
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title="Keeper Vault"
        subTitle={`Depending on your tier - ${SubscriptionTier.L1}, ${SubscriptionTier.L2} or ${SubscriptionTier.L3}, you need to add signing devices to the vault`}
        modalBackground={['light.gradientStart', 'light.gradientEnd']}
        textColor="light.white"
        Content={VaultContent}
        buttonBackground={['#FFFFFF', '#80A8A1']}
        buttonText="Continue"
        buttonTextColor="light.greenText"
        buttonCallback={() => {
          dispatch(setIntroModal(false));
        }}
        DarkCloseIcon
        learnMore
      />
    </LinearGradient>
  );
}

const getStyles = (top) =>
  StyleSheet.create({
    container: {
      paddingTop: Math.max(top, 35),
      justifyContent: 'space-between',
      flex: 1,
    },
    IconText: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    signerCard: {
      elevation: 4,
      shadowRadius: 4,
      shadowOpacity: 0.3,
      shadowOffset: { height: 2, width: 0 },
      height: 130,
      width: 70,
      borderTopLeftRadius: 100,
      borderTopRightRadius: 100,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 5,
      backgroundColor: '#FDF7F0',
    },
    scrollContainer: {
      padding: '8%',
      width: Platform.select({ android: null, ios: '100%' }),
    },
    knowMore: {
      backgroundColor: '#725436',
      paddingHorizontal: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FAFCFC',
      alignSelf: 'flex-end',
    },
    footerText: {
      fontSize: 12,
      letterSpacing: 0.84,
    },
    vaultInfoText: {
      marginLeft: wp(3),
      letterSpacing: 1.28,
    },
    indicator: {
      height: 10,
      width: 10,
      borderRadius: 10,
      position: 'absolute',
      zIndex: 2,
      right: '10%',
      top: '5%',
      borderWidth: 1,
      borderColor: 'white',
      backgroundColor: '#F86B50',
    },
    unregistered: {
      color: '#6E563B',
      fontSize: 8,
      letterSpacing: 0.6,
      textAlign: 'center',
      numberOfLines: 1,
      lineHeight: 16,
    },
  });
export default VaultDetails;
