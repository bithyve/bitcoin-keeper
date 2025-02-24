import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View, useColorMode, StatusBar } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import CoinIcon from 'src/assets/images/coins.svg';
import SignerIcon from 'src/assets/images/signer_white.svg';
import KeeperModal from 'src/components/KeeperModal';
import SendIcon from 'src/assets/images/send-diagonal-arrow-up.svg';
import SendIconWhite from 'src/assets/images/send-diagonal-arrow-up.svg';
import RecieveIcon from 'src/assets/images/send-diagonal-arrow-down.svg';
import RecieveIconWhite from 'src/assets/images/send-diagonal-arrow-down.svg';
import SettingIcon from 'src/assets/images/settings-gear-green.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { VaultType } from 'src/services/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { setIntroModal } from 'src/store/reducers/vaults';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import useVault from 'src/hooks/useVault';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useSigners from 'src/hooks/useSigners';
import SettingIconWhite from 'src/assets/images/settings-gear.svg';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import BTC from 'src/assets/images/icon_bitcoin_white.svg';
import ImportIcon from 'src/assets/images/import.svg';
import { reinstateVault } from 'src/store/sagaActions/vaults';
import useToastMessage, { IToastCategory } from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useSignerMap from 'src/hooks/useSignerMap';
import { ConciergeTag } from 'src/store/sagaActions/concierge';
import { cachedTxSnapshot } from 'src/store/reducers/cachedTxn';
import { sendPhaseOneReset, setStateFromSnapshot } from 'src/store/reducers/send_and_receive';
import PendingHealthCheckModal from 'src/components/PendingHealthCheckModal';
import { TouchableOpacity } from 'react-native-gesture-handler';
import BTCAmountPill from 'src/components/BTCAmountPill';
import { SentryErrorBoundary } from 'src/services/sentry';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { ELECTRUM_CLIENT } from 'src/services/electrum/client';
import WalletHeader from 'src/components/WalletHeader';
import FooterActions from 'src/components/FooterActions';
import FeatureCard from 'src/components/FeatureCard';
import WalletCard from '../Home/components/Wallet/WalletCard';
import useWalletAsset from 'src/hooks/useWalletAsset';
import Colors from 'src/theme/Colors';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';

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
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);

  const handlePathSelected = (miniscriptSelectedSatisfier) => {
    navigation.dispatch(
      CommonActions.navigate('Send', {
        sender: vault,
        miniscriptSelectedSatisfier,
      })
    );
  };

  const selectVaultSpendingPaths = async () => {
    if (miniscriptPathSelectorRef.current) {
      await miniscriptPathSelectorRef.current.selectVaultSpendingPaths();
    }
  };

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
          onPress: async () => {
            if (vault.type === VaultType.MINISCRIPT) {
              try {
                await selectVaultSpendingPaths();
              } catch (err) {
                showToast(err, <ToastErrorIcon />);
              }
            } else {
              navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
            }
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
  return (
    <>
      <FooterActions
        items={footerItems}
        wrappedScreen={false}
        backgroundColor={`${colorMode}.thirdBackground`}
      />
      <MiniscriptPathSelector
        ref={miniscriptPathSelectorRef}
        vault={vault}
        onPathSelected={handlePathSelected}
        onError={(err) => showToast(err, <ToastErrorIcon />)}
        onCancel={() => {}}
      />
    </>
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
              addresses: item.snapshot.routeParams.addresses
                ? item.snapshot.routeParams.addresses
                : [item.snapshot.routeParams.address],
              amounts: item.snapshot.routeParams.amounts
                ? item.snapshot.routeParams.amounts
                : [item.snapshot.routeParams.amount],
              internalRecipients: item.snapshot.routeParams.internalRecipients
                ? item.snapshot.routeParams.internalRecipients
                : [item.snapshot.routeParams.recipient],
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
      {transactions?.length ? (
        <HStack style={styles.transTitleWrapper}>
          <Text color={`${colorMode}.black`} medium fontSize={wp(14)}>
            {common.recentTransactions}
          </Text>
          <Pressable
            style={styles.viewAllBtn}
            onPress={() =>
              navigation.dispatch(
                CommonActions.navigate({ name: 'TransactionHistory', params: { wallet: vault } })
              )
            }
          >
            <Text color={`${colorMode}.greenText`} medium fontSize={wp(14)}>
              {common.viewAll}
            </Text>
          </Pressable>
        </HStack>
      ) : null}
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
  const { showToast } = useToastMessage();
  const { activeVault: vault } = useVault({ vaultId });
  const [pullRefresh, setPullRefresh] = useState(false);
  const { vaultSigners: keys } = useSigners(vault.id);
  const transactions = useMemo(
    () =>
      [...(vault?.specs?.transactions || [])]
        .sort((a, b) => {
          // Sort unconfirmed transactions first
          if (a.confirmations === 0 && b.confirmations !== 0) return -1;
          if (a.confirmations !== 0 && b.confirmations === 0) return 1;

          // Then sort by date
          if (!a.date && !b.date) return 0;
          if (!a.date) return -1;
          if (!b.date) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .slice(0, 5),
    [vault?.specs?.transactions]
  );
  const isCollaborativeWallet = vault.type === VaultType.COLLABORATIVE;
  const isAssistedWallet = vault.type === VaultType.ASSISTED;
  const isCanaryWallet = vault.type === VaultType.CANARY;
  const introModal =
    useAppSelector((state) => state.vault.introModal) && (isCollaborativeWallet || isCanaryWallet);
  const { signerMap } = useSignerMap();
  const { signers: vaultKeys } = vault || { signers: [] };
  const [pendingHealthCheckCount, setPendingHealthCheckCount] = useState(0);
  const [cachedTransactions, setCachedTransactions] = useState([]);
  const snapshots = useAppSelector((state) => state.cachedTxn.snapshots);
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const [syncingCompleted, setSyncingCompleted] = useState(false);
  const syncing =
    ELECTRUM_CLIENT.isClientConnected && walletSyncing && vault ? !!walletSyncing[vault.id] : false;

  const disableBuy = false;
  const cardProps = {
    circleColor: disableBuy ? `${colorMode}.secondaryGrey` : null,
    pillTextColor: disableBuy ? `${colorMode}.buttonText` : null,
    cardPillText: disableBuy ? common.comingSoon : '',
    customCardPill: !disableBuy && <BTCAmountPill />,
    cardPillColor: disableBuy ? `${colorMode}.secondaryGrey` : null,
  };
  const isDarkMode = colorMode === 'dark';
  const { getWalletIcon, getWalletCardGradient, getWalletTags } = useWalletAsset();
  const WalletIcon = getWalletIcon(vault);

  useEffect(() => {
    dispatch(sendPhaseOneReset());
  }, []);

  useEffect(() => {
    const cached = [];
    for (const cachedTxid in snapshots) {
      const snapshot: cachedTxSnapshot = snapshots[cachedTxid];
      if (!snapshot.routeParams) continue; // route params missing

      const { address, addresses, amount, amounts, sender, transferType, date } =
        snapshot.routeParams;
      if (sender?.id !== vault.id) continue; // doesn't belong to the current vault

      const cachedTx = {
        address: address ? address : addresses[0], // TODO: Refactor, doesn't seem to be used
        amount: amount ? amount : amounts.reduce((sum, amount) => sum + amount, 0),
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
    if (!syncing && syncingCompleted && transactionToast) {
      showToast(
        vaultTranslation.transactionToastMessage,
        <TickIcon />,
        IToastCategory.DEFAULT,
        5000
      );
      navigation.dispatch(CommonActions.setParams({ transactionToast: false }));
    }
  }, [syncingCompleted, transactionToast]);

  useEffect(() => {
    if (!ELECTRUM_CLIENT.isClientConnected || !syncing) {
      setSyncingCompleted(true);
    } else {
      setSyncingCompleted(false);
    }
  }, [syncing, ELECTRUM_CLIENT]);

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
    <Box style={styles.wrapper} safeAreaTop>
      <ActivityIndicatorView visible={syncing} showLoader />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <VStack style={styles.topSection}>
        <WalletHeader
          title={vault.presentationData?.name}
          data={vault}
          rightComponent={
            <TouchableOpacity
              style={styles.settingBtn}
              onPress={
                !vault.archived
                  ? () =>
                      navigation.dispatch(
                        CommonActions.navigate('VaultSettings', { vaultId: vault.id })
                      )
                  : () => {
                      navigation.push('VaultSettings', { vaultId: vault.id });
                    }
              }
            >
              {isDarkMode ? (
                <SettingIconWhite width={24} height={24} />
              ) : (
                <SettingIcon width={24} height={24} />
              )}
            </TouchableOpacity>
          }
        />

        <Box style={styles.card}>
          <WalletCard
            backgroundColor={getWalletCardGradient(vault)}
            hexagonBackgroundColor={Colors.CyanGreen}
            icon={<WalletIcon />}
            iconWidth={42}
            iconHeight={38}
            title={vault.presentationData.name}
            tags={getWalletTags(vault)}
            totalBalance={vault.specs.balances.confirmed + vault.specs.balances.unconfirmed}
            description={vault.presentationData.description}
            wallet={vault}
            allowHideBalance={false}
          />
        </Box>
      </VStack>
      {!vault.archived && (
        <HStack style={styles.actionCardContainer}>
          {!isCanaryWallet && (
            <FeatureCard
              cardName={common.buyBitCoin}
              callback={() =>
                navigation.dispatch(
                  CommonActions.navigate({ name: 'BuyBitcoin', params: { wallet: vault } })
                )
              }
              icon={<BTC />}
              customStyle={{ justifyContent: 'flex-end' }}
            />
          )}
          <FeatureCard
            cardName={common.viewAllCoins}
            callback={() =>
              navigation.navigate('UTXOManagement', {
                data: vault,
                routeName: 'Vault',
                vaultId,
              })
            }
            icon={<CoinIcon />}
            customStyle={{ justifyContent: 'flex-end' }}
          />
          {!isCanaryWallet && (
            <FeatureCard
              cardName={common.manageKeys}
              callback={() =>
                navigation.dispatch(
                  CommonActions.navigate({
                    name: 'ManageSigners',
                    params: { vaultId, vaultKeys: vault.signers },
                  })
                )
              }
              icon={<SignerIcon />}
              customStyle={{ justifyContent: 'flex-end' }}
            />
          )}
        </HStack>
      )}
      <VStack backgroundColor={`${colorMode}.primaryBackground`} style={styles.bottomSection}>
        <Box
          flex={1}
          style={styles.transactionsContainer}
          backgroundColor={`${colorMode}.thirdBackground`}
        >
          <TransactionList
            transactions={[...cachedTransactions, ...transactions]}
            pullDownRefresh={syncVault}
            pullRefresh={pullRefresh}
            vault={vault}
            isCollaborativeWallet={isCollaborativeWallet}
          />
        </Box>
        <Box>
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
        buttonTextColor={`${colorMode}.whiteButtonText`}
        buttonBackground={`${colorMode}.whiteButtonBackground`}
        secButtonTextColor={`${colorMode}.whiteSecButtonText`}
        secondaryIcon={<ConciergeNeedHelp />}
        secondaryCallback={() => {
          dispatch(setIntroModal(false));
          navigation.dispatch(
            CommonActions.navigate({
              name: 'CreateTicket',
              params: {
                tags: isCollaborativeWallet
                  ? [ConciergeTag.COLLABORATIVE_Wallet]
                  : [ConciergeTag.VAULT],
                screenName: 'vault-details',
              },
            })
          );
        }}
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
    flexDirection: 'row',
    paddingLeft: '3%',
    marginTop: 20,
    marginBottom: 10,
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
  },
  bottomSection: {
    paddingTop: wp(65),
    paddingBottom: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  transactionsContainer: {
    paddingHorizontal: wp(22),
    marginTop: hp(5),
    paddingTop: hp(24),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  transTitleWrapper: {
    marginLeft: wp(2),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    paddingLeft: 10,
  },
  viewAllBtn: {
    width: wp(80),
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
    padding: 1,
  },
  descText: {
    fontSize: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  archivedBalance: {
    alignItems: 'flex-end',
    marginTop: hp(25),
  },
  card: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    marginBottom: hp(5),
  },
  optionIconCtr: {
    height: hp(39),
    width: wp(39),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  optionCTR: {
    flexDirection: 'row',
    paddingHorizontal: wp(15),
    paddingVertical: hp(22),
    alignItems: 'center',
    gap: wp(16),
    borderRadius: 12,
    borderWidth: 1,
  },
});

export default SentryErrorBoundary(VaultDetails);
