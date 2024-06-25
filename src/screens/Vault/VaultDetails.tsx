import Text from 'src/components/KeeperText';
import { Box, HStack, VStack, View, useColorMode, StatusBar } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import CoinIcon from 'src/assets/images/coins.svg';
import SignerIcon from 'src/assets/images/signer_white.svg';
import KeeperModal from 'src/components/KeeperModal';
import SendIcon from 'src/assets/images/icon_sent_footer.svg';
import RecieveIcon from 'src/assets/images/icon_received_footer.svg';
import SettingIcon from 'src/assets/images/settings_footer.svg';
import TransactionElement from 'src/components/TransactionElement';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import { NetworkType, SignerType, VaultType } from 'src/services/wallets/enums';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { refreshWallets } from 'src/store/sagaActions/wallets';
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
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/icon_tick.svg';
import useSignerMap from 'src/hooks/useSignerMap';
import { UNVERIFYING_SIGNERS, getSignerDescription, getSignerNameFromType } from 'src/hardware';
import SignerCard from '../AddSigner/SignerCard';
import { SDIcons } from './SigningDeviceIcons';
import { ConciergeTag, goToConcierge } from 'src/store/sagaActions/concierge';
import config, { APP_STAGE } from 'src/utils/service-utilities/config';
import { cachedTxSnapshot } from 'src/store/reducers/cachedTxn';
import { setStateFromSnapshot } from 'src/store/reducers/send_and_receive';

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
          Icon: SendIcon,
          text: common.send,
          onPress: () => {
            navigation.dispatch(CommonActions.navigate('Send', { sender: vault }));
          },
        },
        {
          Icon: RecieveIcon,
          text: common.receive,
          onPress: () => {
            if (pendingHealthCheckCount >= vault.scheme.m) {
              setShowHealthCheckModal(true);
            } else {
              navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
            }
          },
        },
        {
          Icon: SettingIcon,
          text: common.settings,
          onPress: () => {
            navigation.dispatch(
              CommonActions.navigate(
                isCollaborativeWallet ? 'CollaborativeWalletSettings' : 'VaultSettings',
                { vaultId: vault.id }
              )
            );
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
        <CardPill
          heading={`${vault.scheme.m} ${common.of} ${vault.scheme.n}`}
          backgroundColor={`${colorMode}.SignleSigCardPillBackColor`}
        />
        <CardPill
          heading={`${
            vault.type === VaultType.COLLABORATIVE ? common.COLLABORATIVE : common.VAULT
          }`}
        />
        {vault.type === VaultType.CANARY && <CardPill heading={common.CANARY} />}
        {vault.archived ? <CardPill heading={common.ARCHIVED} backgroundColor="grey" /> : null}
      </HStack>
      <CurrencyInfo
        hideAmounts={false}
        amount={confirmed + unconfirmed}
        fontSize={24}
        color={`${colorMode}.white`}
        variation={colorMode === 'light' ? 'light' : 'dark'}
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
  const { vaultTransferSuccessful = false, autoRefresh = false, vaultId = '' } = route.params || {};
  const dispatch = useDispatch();
  const introModal = useAppSelector((state) => state.vault.introModal);
  const { activeVault: vault } = useVault({ vaultId });
  const [pullRefresh, setPullRefresh] = useState(false);
  const { vaultSigners: keys } = useSigners(vault.id);
  const inheritanceSigner = keys.filter((signer) => signer?.type === SignerType.INHERITANCEKEY)[0];
  const transactions = vault?.specs?.transactions || [];
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

  const isHealthCheckPending = (signer, vaultKeys, vault) => {
    const now = new Date();
    const lastHealthCheck = new Date(signer.lastHealthCheck);
    const timeDifference = now.getTime() - lastHealthCheck.getTime();

    if (config.ENVIRONMENT === APP_STAGE.DEVELOPMENT) {
      return vaultKeys.length && vault.isMultiSig && timeDifference > 3 * 60 * 60 * 1000;
    } else {
      return (
        vaultKeys.length &&
        !signer.isMock &&
        vault.isMultiSig &&
        timeDifference > 90 * 24 * 60 * 60 * 1000
      );
    }
  };

  useEffect(() => {
    const countPendingHealthChecks = () => {
      let count = 0;
      keys.forEach((item) => {
        const signer = vaultKeys.length ? signerMap[item.masterFingerprint] : item;
        if (isHealthCheckPending(signer, vaultKeys, vault)) {
          count++;
        }
      });
      setPendingHealthCheckCount(count);
    };

    countPendingHealthChecks();
  }, [keys, vaultKeys, signerMap, vault]);

  function SignersList({ colorMode, vaultKeys, signerMap, vault, keys }) {
    const pendingSigners = keys
      .map((item) => {
        const signer = vaultKeys.length ? signerMap[item.masterFingerprint] : item;
        return { item, signer };
      })
      .filter(({ signer }) => isHealthCheckPending(signer, vaultKeys, vault));

    return (
      <Box style={styles.addedSignersContainer}>
        {pendingSigners.map(({ item, signer }) => {
          const isAMF =
            signer.type === SignerType.TAPSIGNER &&
            config.NETWORK_TYPE === NetworkType.TESTNET &&
            !signer.isMock;

          return (
            <SignerCard
              key={signer.masterFingerprint}
              name={getSignerNameFromType(signer.type, signer.isMock, isAMF)}
              description={getSignerDescription(
                signer.type,
                signer.extraData?.instanceNumber,
                signer
              )}
              customStyle={styles.signerCard}
              icon={SDIcons(signer.type, colorMode !== 'dark').Icon}
              showSelection={false}
              showDot={true}
              isFullText
              colorVarient="green"
              colorMode={colorMode}
            />
          );
        })}
      </Box>
    );
  }

  return (
    <Box
      style={styles.container}
      backgroundColor={
        isCollaborativeWallet ? `${colorMode}.greenText2` : `${colorMode}.pantoneGreen`
      }
    >
      <StatusBar barStyle="light-content" />
      <VStack zIndex={1}>
        <VStack style={styles.topSection}>
          <KeeperHeader
            title={vault.presentationData?.name}
            titleColor={`${colorMode}.seashellWhite`}
            subTitleColor={`${colorMode}.seashellWhite`}
            // TODO: Add collaborativeWalletIcon
            icon={
              <HexagonIcon
                width={58}
                height={50}
                backgroundColor={'rgba(9, 44, 39, 0.6)'}
                icon={isCollaborativeWallet ? <CollaborativeIcon /> : <VaultIcon />}
              />
            }
            subtitle={vault.presentationData?.description}
            learnMore
            learnTextColor={`${colorMode}.white`}
            learnBackgroundColor="rgba(0,0,0,.2)"
            learnMorePressed={() => dispatch(setIntroModal(true))}
            contrastScreen={true}
          />
          <VaultInfo vault={vault} />
        </VStack>
      </VStack>
      {!vault.archived && (
        <HStack style={styles.actionCardContainer}>
          {!isCanaryWallet && (
            <ActionCard
              cardName={common.buyBitCoin}
              description={common.inToThisWallet}
              callback={() =>
                navigation.dispatch(
                  CommonActions.navigate({ name: 'BuyBitcoin', params: { wallet: vault } })
                )
              }
              icon={<BTC />}
              cardPillText={`1 BTC = ${currencyCodeExchangeRate.symbol} ${formatNumber(
                currencyCodeExchangeRate.buy.toFixed(0)
              )}`}
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
        buttonTextColor={`${colorMode}.modalWhiteButtonText`}
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonText={common.continue}
        buttonCallback={() => {
          dispatch(setIntroModal(false));
        }}
        DarkCloseIcon
        learnMore
        learnMoreCallback={() =>
          isCollaborativeWallet
            ? dispatch(goToConcierge([ConciergeTag.COLLABORATIVE_Wallet], 'vault-details'))
            : dispatch(goToConcierge([ConciergeTag.VAULT], 'vault-details'))
        }
      />
      <KeeperModal
        visible={showHealthCheckModal}
        close={() => {
          setShowHealthCheckModal(false);
        }}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        title={vaultTranslation.pendingHealthCheck}
        subTitle={`${vaultTranslation.pendingHealthCheckSub1} ${pendingHealthCheckCount} ${vaultTranslation.pendingHealthCheckSub2}`}
        buttonText={vaultTranslation.healthCheck}
        buttonCallback={() => {
          setShowHealthCheckModal(false);
          navigation.dispatch(
            CommonActions.navigate({
              name: 'ManageSigners',
              params: { vaultId, vaultKeys: vault.signers },
            })
          );
        }}
        secondaryButtonText={common.skip}
        secondaryCallback={() => {
          setShowHealthCheckModal(false);
          navigation.dispatch(CommonActions.navigate('Receive', { wallet: vault }));
        }}
        Content={() => (
          <Box style={styles.signerListContainer}>
            <SignersList
              colorMode={colorMode}
              vaultKeys={vaultKeys}
              signerMap={signerMap}
              vault={vault}
              keys={keys}
            />
            <Text style={styles.desc} color={`${colorMode}.modalWhiteContent`}>
              {vaultTranslation.pendingHealthCheckDec}
            </Text>
          </Box>
        )}
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        showCloseIcon={false}
      />
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: '10%',
    justifyContent: 'space-between',
    flex: 1,
  },
  vaultInfoContainer: {
    paddingLeft: '10%',
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
    paddingTop: 15,
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
  signerCard: {
    width: wp(125),
    marginBottom: hp(5),
  },
});

export default Sentry.withErrorBoundary(VaultDetails, errorBourndaryOptions);
