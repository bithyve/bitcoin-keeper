import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import UTXOList from 'src/components/UTXOsComponents/UTXOList';
import NoTransactionIcon from 'src/assets/images/no_transaction_icon.svg';
import UTXOFooter from 'src/components/UTXOsComponents/UTXOFooter';
import FinalizeFooter from 'src/components/UTXOsComponents/FinalizeFooter';
import { hp, wp } from 'src/constants/responsive';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { StyleSheet } from 'react-native';
import UTXOSelectionTotal from 'src/components/UTXOsComponents/UTXOSelectionTotal';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { UTXO } from 'src/services/wallets/interfaces';
import { EntityKind, NetworkType, TxPriority, VaultType } from 'src/services/wallets/enums';
import { CommonActions, useNavigation } from '@react-navigation/native';
import useWallets from 'src/hooks/useWallets';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { resetSyncing } from 'src/store/reducers/wallets';
import useVault from 'src/hooks/useVault';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MiniscriptPathSelector, {
  MiniscriptPathSelectorRef,
} from 'src/components/MiniscriptPathSelector';
import useToastMessage from 'src/hooks/useToastMessage';
import WalletHeader from 'src/components/WalletHeader';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import {
  calculateSendMaxFee,
  sendPhaseOne,
} from 'src/store/sagaActions/send_and_receive';
import {
  sendPhaseOneReset,
  setSendMaxFee,
} from 'src/store/reducers/send_and_receive';

const KEEPER_DONATION_ADDRESS_MAINNET = 'bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06';
const KEEPER_DONATION_ADDRESS_TESTNET = '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8';

function Footer({
  utxos,
  wallet,
  setEnableSelection,
  enableSelection,
  selectedUTXOs,
  doNotSpendUTXOs,
  onDonateDust,
}) {
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const miniscriptPathSelectorRef = useRef<MiniscriptPathSelectorRef>(null);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  return enableSelection ? (
    <>
      <FinalizeFooter
        setEnableSelection={setEnableSelection}
        secondaryText={common.cancel}
        footerCallback={() => {
          if (
            wallet.entityKind === EntityKind.VAULT &&
            (wallet as Vault).type === VaultType.MINISCRIPT
          ) {
            miniscriptPathSelectorRef.current?.selectVaultSpendingPaths();
          } else {
            setEnableSelection(false);
            navigation.dispatch(CommonActions.navigate('Send', { sender: wallet, selectedUTXOs }));
          }
        }}
        selectedUTXOs={selectedUTXOs}
      />
      <MiniscriptPathSelector
        ref={miniscriptPathSelectorRef}
        vault={wallet}
        onPathSelected={(satisfier) => {
          setEnableSelection(false);
          navigation.dispatch(
            CommonActions.navigate('Send', {
              sender: wallet,
              selectedUTXOs,
              miniscriptSelectedSatisfier: satisfier,
            })
          );
        }}
        onError={(err) => showToast(err)}
        onCancel={() => setEnableSelection(true)}
      />
    </>
  ) : (
    <UTXOFooter
      setEnableSelection={setEnableSelection}
      enableSelection={enableSelection}
      wallet={wallet}
      utxos={utxos}
      doNotSpendUTXOs={doNotSpendUTXOs}
      onDonateDust={onDonateDust}
    />
  );
}
type ScreenProps = NativeStackScreenProps<AppStackParams, 'UTXOManagement'>;
function UTXOManagement({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { data, routeName, vaultId = '' } = route.params || {};
  const [enableSelection, _setEnableSelection] = useState(false);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [selectedUTXOMap, setSelectedUTXOMap] = useState({});
  const { id } = data;
  const wallet = vaultId
    ? useVault({ vaultId }).activeVault
    : useWallets({ walletIds: [id] }).wallets[0];
  const [selectedUTXOs, setSelectedUTXOs] = useState([]);
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && wallet ? !!walletSyncing[wallet.id] : false;
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslation } = translations;
  const { showToast } = useToastMessage();

  // Donation flow selectors
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const { averageTxFees } = useAppSelector((state) => state.network);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  // Donation flow state
  const [donationSheetVisible, setDonationSheetVisible] = useState(false);
  const [isCheckingDonation, setIsCheckingDonation] = useState(false);
  const [pendingDonationAmount, setPendingDonationAmount] = useState(0);
  const isExecutingDonation = useRef(false);
  useEffect(
    () => () => {
      dispatch(resetSyncing());
    },
    []
  );

  useEffect(() => {
    if (!walletSyncing[wallet.id]) {
      dispatch(refreshWallets([wallet], { hardRefresh: true, dustScan: true }));
    }
  }, []);

  const utxos = useMemo(
    () =>
      wallet
        ? [
            ...(wallet.specs.confirmedUTXOs?.map((utxo) => ({
              ...utxo,
              confirmed: true,
            })) ?? []),
            ...(wallet.specs.unconfirmedUTXOs?.map((utxo) => ({
              ...utxo,
              confirmed: false,
            })) ?? []),
          ]
        : [],
    [wallet]
  );

  const doNotSpendUTXOs: UTXO[] = (utxos ?? []).filter(
    (u) => u.spendability === 'doNotSpend'
  );

  const executeDonation = () => {
    if (doNotSpendUTXOs.length === 0) return;
    dispatch(setSendMaxFee(0));
    setIsCheckingDonation(true);
    dispatch(
      calculateSendMaxFee({
        wallet,
        recipients: [{ address: wallet.networkType === NetworkType.MAINNET ? KEEPER_DONATION_ADDRESS_MAINNET : KEEPER_DONATION_ADDRESS_TESTNET, amount: 0 }],
        selectedUTXOs: doNotSpendUTXOs,
        feePerByte: averageTxFees?.[bitcoinNetworkType]?.[TxPriority.LOW]?.feePerByte,
      })
    );
  };

  useEffect(() => {
    const selectedUtxos = utxos || [];
    const selectedUTXOsFiltered = selectedUtxos.filter(
      (utxo) => selectedUTXOMap[`${utxo.txId}${utxo.vout}`]
    );
    setSelectedUTXOs(selectedUTXOsFiltered);
  }, [selectedUTXOMap, selectionTotal]);

  const cleanUp = useCallback(() => {
    setSelectedUTXOMap({});
    setSelectionTotal(0);
  }, []);

  // Eligibility check result handler
  useEffect(() => {
    if (!isCheckingDonation) return;
    const totalDoNotSpendValue = doNotSpendUTXOs.reduce((s, u) => s + u.value, 0);
    if (sendMaxFee > 0 && sendMaxFee < totalDoNotSpendValue) {
      const donationAmount = totalDoNotSpendValue - sendMaxFee;
      setPendingDonationAmount(donationAmount);
      isExecutingDonation.current = true;
      setIsCheckingDonation(false);
      dispatch(sendPhaseOneReset());
      dispatch(
        sendPhaseOne({
          wallet,
          recipients: [{ address: wallet.networkType === NetworkType.MAINNET ? KEEPER_DONATION_ADDRESS_MAINNET : KEEPER_DONATION_ADDRESS_TESTNET, amount: donationAmount }],
          selectedUTXOs: doNotSpendUTXOs,
        })
      );
    } else if (sendMaxFee >= totalDoNotSpendValue || sendMaxFee === 0) {
      setIsCheckingDonation(false);
      setDonationSheetVisible(false);
      showToast(walletTranslation.tooSmallToDonate);
    }
  }, [sendMaxFee, isCheckingDonation]);

  // sendPhaseOne result handler for donation flow
  useEffect(() => {
    if (!isExecutingDonation.current) return;
    if (sendPhaseOneState.isSuccessful) {
      isExecutingDonation.current = false;
      setDonationSheetVisible(false);
      navigation.dispatch(
        CommonActions.navigate('SendConfirmation', {
          sender: wallet,
          internalRecipients: [],
          addresses: [wallet.networkType === NetworkType.MAINNET ? KEEPER_DONATION_ADDRESS_MAINNET : KEEPER_DONATION_ADDRESS_TESTNET],
          amounts: [pendingDonationAmount],
          selectedUTXOs: doNotSpendUTXOs,
          transactionPriority: TxPriority.LOW,
          isDonation: true,
          note: '',
        })
      );
    } else if (sendPhaseOneState.hasFailed) {
      isExecutingDonation.current = false;
      setDonationSheetVisible(false);
      showToast(sendPhaseOneState.failedErrorMessage || walletTranslation.tooSmallToDonate);
    }
  }, [sendPhaseOneState]);

  const setEnableSelection = useCallback(
    (value) => {
      _setEnableSelection(value);
      if (!value) {
        cleanUp();
      }
    },
    [cleanUp]
  );

  return (
    <ScreenWrapper paddingHorizontal={0} backgroundcolor={`${colorMode}.primaryBackground`}>
      <ActivityIndicatorView visible={syncing} showLoader />
      <Box style={{ marginLeft: wp(15), marginRight: wp(22) }}>
        <WalletHeader title={common.manageCoins} rightComponent={<CurrencyTypeSwitch />} />
      </Box>
      <Box style={styles.contentContainer}>
        {enableSelection ? (
          <UTXOSelectionTotal selectionTotal={selectionTotal} selectedUTXOs={selectedUTXOs} />
        ) : null}
        <UTXOList
          utxoState={utxos}
          enableSelection={enableSelection}
          setSelectionTotal={setSelectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          currentWallet={wallet}
          emptyIcon={
            routeName === 'Vault' ? <ThemedSvg name={'NoTransactionIcon'} /> : NoTransactionIcon
          }
        />
        <Box marginTop={hp(15)}>
          {utxos?.length ? (
            <Footer
              utxos={utxos}
              wallet={wallet}
              setEnableSelection={setEnableSelection}
              enableSelection={enableSelection}
              selectedUTXOs={selectedUTXOs}
              doNotSpendUTXOs={doNotSpendUTXOs}
              onDonateDust={() => setDonationSheetVisible(true)}
            />
          ) : null}
        </Box>
      </Box>
      <KeeperModal
        visible={donationSheetVisible}
        close={() => setDonationSheetVisible(false)}
        title={walletTranslation.donateDustTitle}
        subTitle={walletTranslation.donateDustBody}
        buttonText={walletTranslation.donateDust}
        buttonCallback={executeDonation}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setDonationSheetVisible(false)}
        loading={isCheckingDonation || isExecutingDonation.current}
        Content={() => (
          <Box>
            <Text color="orange.500">{walletTranslation.donateDustWarning}</Text>
            <Text>{walletTranslation.donateDustDetail}</Text>
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  vaultInfoText: {
    marginLeft: wp(3),
    letterSpacing: 1.28,
  },
  contentContainer: {
    flex: 1,
    marginTop: hp(10),
    marginBottom: hp(15),
  },
});

export default UTXOManagement;
