import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View, useColorMode, StatusBar } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { FlatList, Platform, RefreshControl, StyleSheet } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import CoinIcon from 'src/assets/images/coins.svg';
import SignerIcon from 'src/assets/images/signer_white.svg';
import KeeperModal from 'src/components/KeeperModal';
import SendIcon from 'src/assets/images/send.svg';
import SendIconWhite from 'src/assets/images/send-white.svg';
import RecieveIcon from 'src/assets/images/receive.svg';
import RecieveIconWhite from 'src/assets/images/receive-white.svg';
import SettingIcon from 'src/assets/images/settings.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/services/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import { VaultType } from 'src/services/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import { LOGIN_WITH_HEXA, refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useVault from 'src/hooks/useVault';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import KeeperFooter from 'src/components/KeeperFooter';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSigners from 'src/hooks/useSigners';
import CardPill from 'src/components/CardPill';
import ActionCard from 'src/components/ActionCard';
import HexagonIcon from 'src/components/HexagonIcon';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import CurrencyInfo from '../Home/components/CurrencyInfo';
import BTC from 'src/assets/images/icon_bitcoin_white.svg';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { formatNumber } from 'src/utils/utilities';
import * as Sentry from '@sentry/react-native';
import { errorBourndaryOptions } from 'src/screens/ErrorHandler';
import ImportIcon from 'src/assets/images/import.svg';
import { reinstateVault } from 'src/store/sagaActions/vaults';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useSignerMap from 'src/hooks/useSignerMap';
import { ConciergeTag, goToConcierge } from 'src/store/sagaActions/concierge';
import { cachedTxSnapshot } from 'src/store/reducers/cachedTxn';
import { setStateFromSnapshot } from 'src/store/reducers/send_and_receive';
import PendingHealthCheckModal from 'src/components/PendingHealthCheckModal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Footer({
  vault,
  isCollaborativeWallet,
  pendingHealthCheckCount,
  setShowHealthCheckModal,
}: {
  vault: Vault;
  isCollaborativeWallet: boolean;
  pendingHealthCheckCount: number;
  setShowHealthCheckModal: any;
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { colorMode } = useColorMode();

  const footerItems = vault.archived
    ? [
        {
          Icon: ImportIcon,
          text: common.reinstate,
          onPress: () => {
            dispatch(reinstateVault(vault.id));
            showToast('Vault reinstated successfully', <TickIcon />);
          },
        },
      ]
    : [
        {
          Icon: colorMode === 'light' ? SendIcon : SendIconWhite,
          text: common.send,
          onPress: () => {
            navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
          },
        },
        {
          Icon: colorMode === 'light' ? RecieveIcon : RecieveIconWhite,
          text: common.receive,
          onPress: () => {
            if (pendingHealthCheckCount >= vault.scheme.m) {
              setShowHealthCheckModal(true);
            } else {
              navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
            }
          },
        },
      ];
  return <KeeperFooter items={footerItems} wrappedScreen={false} />;
}

function VaultInfo({ vault }: { vault: Vault }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const {
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;

  return (
    <HStack style={styles.vaultInfoContainer}>
      <HStack style={styles.pillsContainer}>
        {vault.scheme.n > 1 && (
          <CardPill
            heading={`${vault.scheme.m} ${common.of} ${vault.scheme.n}`}
            backgroundColor={`${colorMode}.SignleSigCardPillBackColor`}
          />
        )}
        <CardPill
          heading={`${
            vault.type === VaultType.COLLABORATIVE
              ? common.COLLABORATIVE
              : vault.type === VaultType.SINGE_SIG
              ? 'SINGLE-KEY'
              : common.VAULT
          }`}
        />
        {vault.type === VaultType.SINGE_SIG && <CardPill heading={'COLD'} />}
        {vault.type === VaultType.CANARY && <CardPill heading={common.CANARY} />}
        {vault.archived ? <CardPill heading={common.ARCHIVED} backgroundColor="grey" /> : null}
      </HStack>
      <CurrencyInfo
        hideAmounts={false}
        amount={confirmed + unconfirmed}
        fontSize={24}
        color={`${colorMode}.buttonText`}
        variation="light"
      />
    </HStack>
  );
}

function TransactionList({
  transactions,
  pullDownRefresh,
  pullRefresh,
  vault,
  isCollaborativeWallet,
}) {
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();

  const renderTransactionElement = ({ item }) => (
    <TransactionElement
      transaction={item}
      wallet={vault}
      isCached={item?.isCached}
      onPress={() => {
        if (item?.isCached) {
          dispatch(setStateFromSnapshot(item.snapshot.state));
          navigation.dispatch(
            CommonActions.navigate('SendConfirmation', {
              ...item.snapshot.routeParams,
            })
          );
        } else {
          navigation.dispatch(
            CommonActions.navigate('TransactionDetails', {
              transaction: item,
              wallet: vault,
            })
          );
        }
      }}
    />
  );
  return (
    <>
      <VStack style={styles.transTitleWrapper}>
        {transactions?.length ? (
          <Text
            color={`${colorMode}.black`}
            style={styles.transactionHeading}
            testID="text_Transaction"
          >
            {common.transactions}
          </Text>
        ) : null}
      </VStack>
      <FlatList
        testID="view_TransactionList"
        refreshControl={<RefreshControl onRefresh={pullDownRefresh} refreshing={pullRefresh} />}
        data={transactions}
        renderItem={renderTransactionElement}
        keyExtractor={(item) => item.txid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyStateView IllustartionImage={NoTransactionIcon} title={common.noTransYet} />
        }
      />
    </>
  );
}

type ScreenProps = NativeStackScreenProps<AppStackParams, 'VaultDetails'>;

function VaultDetails({ navigation, route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslation, common } = translations;
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const {
    vaultTransferSuccessful = false,
    autoRefresh = false,
    vaultId = '',
    transactionToast = false,
  } = route.params || {};
  const dispatch = useDispatch();
  const { top } = useSafeAreaInsets();
  const { showToast } = useToastMessage();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { activeVault: vault } = useVault({ vaultId });
  const [pullRefresh, setPullRefresh] = useState(false);
  const { vaultSigners: keys } = useSigners(vault.id);
  const transactions =
    vault?.specs?.transactions.sort((a, b) => {
      if (!a.blockTime && !b.blockTime) return 0;
      if (!a.blockTime) return -1;
      if (!b.blockTime) return 1;
      return b.blockTime - a.blockTime;
    }) || [];
  const isCollaborativeWallet = vault.type === VaultType.COLLABORATIVE;
  const isCanaryWallet = vault.type === VaultType.CANARY;
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currencyCodeExchangeRate = exchangeRates[currencyCode];
  const { signerMap } = useSignerMap();
  const { signers: vaultKeys } = vault || { signers: [] };
  const [pendingHealthCheckCount, setPendingHealthCheckCount] = useState(0);
  const [cachedTransactions, setCachedTransactions] = useState([]);
  const snapshots = useAppSelector((state) => state.cachedTxn.snapshots);

  const disableBuy = Platform.OS === 'ios' ? true : false;
  const cardProps = {
    circleColor: disableBuy ? `${colorMode}.secondaryGrey` : null,
    pillTextColor: disableBuy ? `${colorMode}.buttonText` : null,
    cardPillText: disableBuy
      ? common.comingSoon
      : `1 BTC = ${currencyCodeExchangeRate.symbol} ${formatNumber(
          currencyCodeExchangeRate.buy.toFixed(0)
        )}`,
    cardPillColor: disableBuy ? `${colorMode}.secondaryGrey` : null,
  };

  useEffect(() => {
    const cached = [];
    for (const cachedTxid in snapshots) {
      const snapshot: cachedTxSnapshot = snapshots[cachedTxid];
      if (!snapshot.routeParams) continue; // route params missing

      const { address, amount, recipient, sender, transferType, date } = snapshot.routeParams;
      if (sender?.id !== vault.id) continue; // doesn't belong to the current vault

      const cachedTx = {
        address,
        amount,
        blockTime: null,
        confirmations: 0,
        date,
        fee: 0,
        recipientAddresses: [],
        senderAddresses: [],
        tags: [],
        transactionType: transferType,
        txid: cachedTxid,
        isCached: true,
        snapshot,
      };
      cached.push(cachedTx);
    }

    if (cached.length) {
      cached.reverse(); // order from newest to oldest
      setCachedTransactions(cached);
    }
  }, [snapshots]);

  useEffect(() => {
    if (autoRefresh) syncVault();
  }, [autoRefresh]);

  useEffect(() => {
    if (transactionToast) {
      showToast(
        vaultTranslation.transactionToastMessage,
        <TickIcon />,
        IToastCategory.DEFAULT,
        5000
      );
      navigation.dispatch(CommonActions.setParams({ transactionToast: false }));
    }
  }, [transactionToast]);

  const syncVault = () => {
    setPullRefresh(true);
    dispatch(refreshWallets([vault], { hardRefresh: true }));
    setPullRefresh(false);
  };

  const VaultContent = useCallback(
    () => (
      <View style={styles.vaultModalContainer}>
        <Box style={styles.alignSelf}>
          <VaultSetupIcon />
        </Box>
        {isCanaryWallet ? (
          <Text color="white" style={styles.modalContent}>
            {vaultTranslation.canaryLearnMoreDesc}
          </Text>
        ) : (
          <>
            <Text color="white" style={styles.modalContent}>
              {isCollaborativeWallet
                ? vaultTranslation.walletSetupDetails
                : vaultTranslation.keeperSupportSigningDevice}
            </Text>
            {!isCollaborativeWallet && (
              <Text color="white" style={styles.descText}>
                {vaultTranslation.additionalOptionForSignDevice}
              </Text>
            )}
          </>
        )}
      </View>
    ),
    [isCollaborativeWallet, isCanaryWallet]
  );

  return (
    <Box
      style={[styles.wrapper, { paddingTop: top - 5 }]}
      backgroundColor={
        isCollaborativeWallet ? `${colorMode}.greenText2` : `${colorMode}.pantoneGreen`
      }
    >
      <StatusBar barStyle="light-content" />
      {/* <VStack zIndex={1}> */}
      <VStack style={styles.topSection}>
        <KeeperHeader
          title={vault.presentationData?.name}
          titleColor={`${colorMode}.seashellWhiteText`}
          subTitleColor={`${colorMode}.seashellWhiteText`}
          // TODO: Add collaborativeWalletIcon
          icon={
            <HexagonIcon
              width={58}
              height={50}
              backgroundColor={'rgba(9, 44, 39, 0.6)'}
              icon={
                isCollaborativeWallet ? (
                  <CollaborativeIcon />
                ) : vault.type === VaultType.SINGE_SIG ? (
                  <WalletIcon />
                ) : (
                  <VaultIcon />
                )
              }
            />
          }
          subtitle={vault.presentationData?.description}
          learnMore
          learnTextColor={`${colorMode}.buttonText`}
          learnBackgroundColor="rgba(0,0,0,.2)"
          learnMorePressed={() => dispatch(setIntroModal(true))}
          contrastScreen={true}
          rightComponent={
            <TouchableOpacity
              style={styles.settingBtn}
              onPress={() =>
                navigation.dispatch(CommonActions.navigate('VaultSettings', { vaultId: vault.id }))
              }
            >
              <SettingIcon width={24} height={24} />
            </TouchableOpacity>
          }
        />
        <VaultInfo vault={vault} />
      </VStack>
      {/* </VStack> */}
      {!vault.archived && (
        <HStack style={styles.actionCardContainer}>
          {!isCanaryWallet && (
            <ActionCard
              disable={disableBuy}
              cardName={common.buyBitCoin}
              description={common.inToThisWallet}
              callback={() =>
                navigation.dispatch(
                  CommonActions.navigate({ name: 'BuyBitcoin', params: { wallet: vault } })
                )
              }
              icon={<BTC />}
              cardPillText={cardProps.cardPillText}
              pillTextColor={cardProps.pillTextColor}
              circleColor={cardProps.circleColor}
              cardPillColor={cardProps.cardPillColor}
            />
          )}
          <ActionCard
            cardName={common.viewAllCoins}
            description={common.manageUTXO}
            callback={() =>
              navigation.navigate('UTXOManagement', {
                data: vault,
                routeName: 'Vault',
                vaultId,
              })
            }
            icon={<CoinIcon />}
          />
          {!isCanaryWallet && (
            <ActionCard
              cardName={common.manageKeys}
              description={common.forThisVault}
              callback={() =>
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'ManageSigners',
                    params: { vaultId, vaultKeys: vault.signers },
                  })
                )
              }
              icon={<SignerIcon />}
            />
          )}
        </HStack>
      )}
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.bottomSection}>
        <Box flex={1} style={styles.transactionsContainer}>
          <TransactionList
            transactions={[...cachedTransactions, ...transactions]}
            pullDownRefresh={syncVault}
            pullRefresh={pullRefresh}
            vault={vault}
            isCollaborativeWallet={isCollaborativeWallet}
          />
        </Box>
        <Box style={styles.footerContainer}>
          <Footer
            vault={vault}
            isCollaborativeWallet={isCollaborativeWallet}
            pendingHealthCheckCount={pendingHealthCheckCount}
            isCanaryWallet={isCanaryWallet}
            setShowHealthCheckModal={setShowHealthCheckModal}
          />
        </Box>
      </VStack>
      <KeeperModal
        visible={introModal}
        close={() => {
          dispatch(setIntroModal(false));
        }}
        title={
          isCollaborativeWallet
            ? vaultTranslation.collaborativeWallet
            : isCanaryWallet
            ? vaultTranslation.canaryWallet
            : vaultTranslation.keeperVault
        }
        subTitle={
          isCollaborativeWallet
            ? vaultTranslation.collaborativeWalletMultipleUsers
            : isCanaryWallet
            ? vaultTranslation.canaryLearnMoreSubtitle
            : vaultTranslation.vaultLearnMoreSubtitle
        }
        modalBackground={`${colorMode}.modalGreenBackground`}
        textColor={`${colorMode}.modalGreenContent`}
        Content={VaultContent}
        buttonText={common.Okay}
        secondaryButtonText={common.needHelp}
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        secButtonTextColor={`${colorMode}.modalGreenSecButtonText`}
        secondaryCallback={
          isCollaborativeWallet
            ? () => {
                dispatch(setIntroModal(false));
                dispatch(goToConcierge([ConciergeTag.COLLABORATIVE_Wallet], 'vault-details'));
              }
            : () => {
                dispatch(setIntroModal(false));
                dispatch(goToConcierge([ConciergeTag.VAULT], 'vault-details'));
              }
        }
        buttonCallback={() => dispatch(setIntroModal(false))}
        DarkCloseIcon
      />
      <PendingHealthCheckModal
        selectedItem={vault}
        vaultKeys={vaultKeys}
        signerMap={signerMap}
        keys={keys}
        showHealthCheckModal={showHealthCheckModal}
        pendingHealthCheckCount={pendingHealthCheckCount}
        setPendingHealthCheckCount={setPendingHealthCheckCount}
        setShowHealthCheckModal={setShowHealthCheckModal}
        primaryButtonCallback={() => {
          setShowHealthCheckModal(false);
          navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
        }}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  vaultInfoContainer: {
    paddingLeft: '3%',
    marginVertical: 20,
    justifyContent: 'space-between',
  },
  pillsContainer: {
    gap: 2,
  },
  actionCardContainer: {
    marginTop: 20,
    marginBottom: -50,
    zIndex: 10,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  transactionsContainer: {
    paddingHorizontal: wp(22),
  },
  footerContainer: {
    paddingHorizontal: wp(28),
  },
  transTitleWrapper: {
    paddingTop: windowHeight * 0.1,
    marginLeft: wp(15),
  },
  transactionHeading: {
    fontSize: 16,
    letterSpacing: 0.16,
    paddingBottom: 16,
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
  },
  scrollContainer: {
    padding: '8%',
    minWidth: windowWidth,
  },
  knowMore: {
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
    lineHeight: 16,
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
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  iconWrapper: {
    width: '15%',
  },
  titleWrapper: {
    width: '75%',
  },
  addPhoneEmailTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  addPhoneEmailSubTitle: {
    fontSize: 12,
  },
  rightIconWrapper: {
    width: '10%',
    marginLeft: 5,
  },
  vaultModalContainer: {
    marginVertical: 5,
    gap: 4,
  },
  alignSelf: {
    alignSelf: 'center',
  },
  modalContent: {
    marginTop: hp(20),
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
  },
  descText: {
    fontSize: 13,
    letterSpacing: 0.65,
  },
  mt3: {
    marginTop: 3,
  },
  alignItems: {
    alignItems: 'center',
  },
  signerListContainer: {
    marginTop: hp(-16),
  },
  topContainer: {
    flex: 1,
  },
  addedSignersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  desc: {
    marginTop: hp(15),
    fontSize: 13,
  },
  settingBtn: {
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
});

export default Sentry.withErrorBoundary(VaultDetails, errorBourndaryOptions);
