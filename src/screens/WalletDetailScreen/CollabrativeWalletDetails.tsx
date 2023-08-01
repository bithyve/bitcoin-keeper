/* eslint-disable react/no-unstable-nested-components */
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack } from 'native-base';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import {
  FlatList,
  Linking,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { hp, windowHeight, wp } from 'src/common/data/responsiveness/responsive';
import BackIcon from 'src/assets/images/back_white.svg';
import Buy from 'src/assets/images/icon_buy.svg';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import IconSettings from 'src/assets/images/icon_settings.svg';
import KeeperModal from 'src/components/KeeperModal';
import LinearGradient from 'src/components/KeeperGradient';
import Recieve from 'src/assets/images/receive.svg';
import Send from 'src/assets/images/send.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/core/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import { VaultMigrationType } from 'src/core/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import moment from 'moment';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import usePlan from 'src/hooks/usePlan';
import useToastMessage from 'src/hooks/useToastMessage';
import NoVaultTransactionIcon from 'src/assets/images/emptystate.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useVault from 'src/hooks/useVault';
import Buttons from 'src/components/Buttons';
import { fetchRampReservation } from 'src/services/ramp';
import WalletOperations from 'src/core/wallets/operations';
import useFeatureMap from 'src/hooks/useFeatureMap';
import useWallets from 'src/hooks/useWallets';
import CurrencyInfo from '../NewHomeScreen/components/CurrencyInfo';

function Footer({ vault, onPressBuy }: { vault: Vault; onPressBuy: Function }) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const featureMap = useFeatureMap({ scheme: vault.scheme });

  //   const wallet = useWallets({walletIds:[vault.collabrativeWalletId]}) //To:Do
  const wallet = useWallets().wallets[0];

  const styles = getStyles(0);
  return (
    <Box>
      <Box borderWidth={0.5} borderColor="light.GreyText" borderRadius={20} opacity={0.2} />
      <Box flexDirection="row" justifyContent="space-between" marginX={10} marginTop={3}>
        <TouchableOpacity
          style={styles.IconText}
          onPress={() => {
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
            featureMap.vaultRecieve
              ? navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }))
              : showToast('Please Upgrade', <ToastErrorIcon />);
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
            featureMap.vaultBuy ? onPressBuy : showToast('Please Upgrade');
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
            navigation.navigate('CollabrativeWalletSettings', { wallet });
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
            Learn More
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

function VaultInfo({ vault }: { vault: Vault }) {
  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;

  const styles = getStyles(0);
  return (
    <VStack paddingY={10}>
      <HStack alignItems="center">
        <Box paddingRight={3}>
          <VaultIcon />
        </Box>
        <VStack>
          <Text color="light.white" style={styles.vaultInfoText} fontSize={16}>
            Collborative Wallet
          </Text>
          <Text color="light.white" style={styles.vaultInfoText} fontSize={12}>
            2 of 3 Mutlisig
          </Text>
        </VStack>
      </HStack>
      <HStack justifyContent="space-between">
        <VStack paddingTop="6">
          <Text color="light.white" style={styles.vaultInfoText} fontSize={11}>
            Unconfirmed
          </Text>
          <CurrencyInfo
            hideAmounts={false}
            amount={unconfirmed}
            fontSize={14}
            color="light.white"
            variation="grey"
          />
        </VStack>
        <VStack paddingTop="6">
          <Text color="light.white" style={styles.vaultInfoText} fontSize={11}>
            Available Balance
          </Text>
          <CurrencyInfo
            hideAmounts={false}
            amount={confirmed}
            fontSize={20}
            color="light.white"
            variation="light"
          />
        </VStack>
      </HStack>
    </VStack>
  );
}

function TransactionList({ transactions, pullDownRefresh, pullRefresh, vault }) {
  const navigation = useNavigation();

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      onPress={() => {
        navigation.dispatch(
          CommonActions.navigate('TransactionDetails', {
            transaction: item,
            wallet: vault,
          })
        );
      }}
    />
  );
  return (
    <>
      <VStack style={{ paddingTop: hp(20) }}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text color="light.textBlack" marginLeft={wp(3)} fontSize={16} letterSpacing={1.28}>
            Transactions
          </Text>
          {transactions ? (
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
              <HStack alignItems="center">
                <Text
                  color="light.primaryGreen"
                  marginRight={2}
                  fontSize={11}
                  bold
                  letterSpacing={0.6}
                >
                  View All
                </Text>
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

function RampBuyContent({
  buyWithRamp,
  vault,
  setShowBuyRampModal,
}: {
  buyWithRamp: boolean;
  vault: Vault;
  setShowBuyRampModal: any;
}) {
  const [buyAddress, setBuyAddress] = useState('');
  const styles = getStyles(0);

  useEffect(() => {
    const receivingAddress = WalletOperations.getNextFreeAddress(vault);
    setBuyAddress(receivingAddress);
  }, []);

  return (
    <Box style={styles.rampBuyContentWrapper}>
      <Text style={styles.byProceedingContent}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>
      <Box style={styles.cardWrapper}>
        <VaultIcon />
        <Box mx={4}>
          <Text style={{ fontSize: 12 }} color="#5F6965">
            Bitcoin will be transferred to
          </Text>
          <Text style={{ fontSize: 19, letterSpacing: 1.28 }} color="#041513">
            {vault.presentationData.name}
          </Text>
          <Text
            style={{ fontSize: 12, fontStyle: 'italic' }}
            color="#00836A"
          >{`Balance: ${vault.specs.balances.confirmed} sats`}</Text>
        </Box>
      </Box>

      <Box style={styles.cardWrapper}>
        <Box style={styles.atIconWrapper}>
          <Text style={{ fontSize: 12 }}>@</Text>
        </Box>
        <Box mx={4}>
          <Text style={{ fontSize: 12 }} color="#5F6965">
            Address for ramp transactions
          </Text>
          <Text style={styles.buyAddressText} ellipsizeMode="middle" numberOfLines={1}>
            {buyAddress}
          </Text>
        </Box>
      </Box>
      <Buttons
        secondaryText="Cancel"
        secondaryCallback={() => {
          setShowBuyRampModal(false);
        }}
        primaryText="Buy Bitcoin"
        primaryCallback={() => buyWithRamp(buyAddress)}
      />
    </Box>
  );
}

function CollaborativeWalletDetails() {
  const route = useRoute();
  const { params } = route as { params: { collaborativeWallet: Vault; autoRefresh: boolean } };
  const { collaborativeWallet, autoRefresh } = params;

  const dispatch = useDispatch();
  const { top } = useSafeAreaInsets();
  const [pullRefresh, setPullRefresh] = useState(false);
  const [showBuyRampModal, setShowBuyRampModal] = useState(false);
  const transactions = collaborativeWallet?.specs?.transactions || [];

  useEffect(() => {
    if (autoRefresh) syncVault();
  }, [autoRefresh]);

  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([collaborativeWallet], { hardRefresh: true }));
    setPullRefresh(false);
  };
  const styles = getStyles(top);

  const buyWithRamp = (address: string) => {
    try {
      setShowBuyRampModal(false);
      Linking.openURL(fetchRampReservation({ receiveAddress: address }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box style={styles.container} backgroundColor="#2D6759">
      <VStack zIndex={1}>
        <VStack mx="8%" mt={5}>
          <Header />
          <VaultInfo vault={collaborativeWallet} />
        </VStack>
      </VStack>
      <VStack
        backgroundColor="light.primaryBackground"
        px={wp(28)}
        borderTopRadius={20}
        flex={1}
        justifyContent="space-between"
        paddingBottom={windowHeight > 800 ? 5 : 0}
      >
        <TransactionList
          transactions={transactions}
          pullDownRefresh={syncVault}
          pullRefresh={pullRefresh}
          vault={collaborativeWallet}
        />
        <Footer onPressBuy={() => setShowBuyRampModal(true)} vault={collaborativeWallet} />
      </VStack>
      <KeeperModal
        visible={showBuyRampModal}
        close={() => {
          setShowBuyRampModal(false);
        }}
        title="Buy bitcoin with Ramp"
        subTitle="Ramp enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available payment methods available may vary based on your country"
        subTitleColor="#5F6965"
        textColor="light.primaryText"
        Content={() => (
          <RampBuyContent
            buyWithRamp={buyWithRamp}
            setShowBuyRampModal={setShowBuyRampModal}
            vault={collaborativeWallet}
          />
        )}
      />
    </Box>
  );
}

const getStyles = (top) =>
  StyleSheet.create({
    container: {
      paddingTop: Math.max(top, 35),
      justifyContent: 'space-between',
      flex: 1,
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
    rampBuyContentWrapper: {
      padding: 1,
    },
    byProceedingContent: {
      color: '#073B36',
      fontSize: 13,
      letterSpacing: 0.65,
      marginVertical: 1,
    },
    cardWrapper: {
      marginVertical: 5,
      alignItems: 'center',
      borderRadius: 10,
      padding: 5,
      backgroundColor: '#FDF7F0',
      flexDirection: 'row',
    },
    atIconWrapper: {
      backgroundColor: '#FAC48B',
      borderRadius: 20,
      height: 35,
      width: 35,
      justifyItems: 'center',
      alignItems: 'center',
    },
    buyAddressText: {
      fontSize: 19,
      letterSpacing: 1.28,
      color: '#041513',
      width: wp(200),
    },
    addPhoneEmailWrapper: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: hp(20),
      paddingVertical: hp(10),
      borderRadius: 10,
    },
    iconWrapper: {
      width: '15%',
    },
    titleWrapper: {
      width: '75%',
    },
    addPhoneEmailTitle: {
      fontSize: 14,
    },
    addPhoneEmailSubTitle: {
      fontSize: 12,
    },
    rightIconWrapper: {
      width: '10%',
    },
  });
export default CollaborativeWalletDetails;
