import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import { UTXO, Transaction } from 'src/services/wallets/interfaces';
import { NetworkType, TxPriority } from 'src/services/wallets/enums';
import { setItem, getNumber, hasItem } from 'src/storage/index';
import {
  calculateSendMaxFee,
  sendPhaseOne,
} from 'src/store/sagaActions/send_and_receive';
import {
  sendPhaseOneReset,
  setSendMaxFee,
} from 'src/store/reducers/send_and_receive';
import useWallets from 'src/hooks/useWallets.tsx';
import useToastMessage from 'src/hooks/useToastMessage';
import { LocalizationContext } from 'src/context/Localization/LocContext';

export type DustReportPhase = 'start' | 'scanning' | 'result' | 'error';

export interface DustReportData {
  activeDust: UTXO[];
  linkedCoins: UTXO[];
  pastDustSpends: Transaction[];
  doNotSpendUTXOs: UTXO[];
  amountMarkedDNS: number;
  hasEligibleDustForDonation: boolean;
  isEmpty: boolean;
}

const KEEPER_DONATION_ADDRESS_MAINNET = 'bc1qyqequr0824nwf7snzvq5gqsr6xscn62e3ttm06';
const KEEPER_DONATION_ADDRESS_TESTNET = '2N1TSArdd2pt9RoqE3LXY55ixpRE9e5aot8';

const DUST_REPORT_LAST_SCANNED_KEY = (walletId: string) =>
  `dust-report-lastScanned-${walletId}`;

function formatLastScanned(epochMs: number): string {
  const now = new Date();
  const scanned = new Date(epochMs);
  const isToday =
    now.getFullYear() === scanned.getFullYear() &&
    now.getMonth() === scanned.getMonth() &&
    now.getDate() === scanned.getDate();

  const hh = String(scanned.getHours()).padStart(2, '0');
  const mm = String(scanned.getMinutes()).padStart(2, '0');

  if (isToday) {
    return `Today, ${hh}:${mm}`;
  }

  const dd = String(scanned.getDate()).padStart(2, '0');
  const mo = String(scanned.getMonth() + 1).padStart(2, '0');
  const yy = scanned.getFullYear();
  return `${dd}/${mo}/${yy}, ${hh}:${mm}`;
}

function readLastScanned(walletId: string): string | null {
  if (!hasItem(DUST_REPORT_LAST_SCANNED_KEY(walletId))) return null;
  const epochMs = getNumber(DUST_REPORT_LAST_SCANNED_KEY(walletId));
  if (!epochMs) return null;
  return formatLastScanned(epochMs);
}

function deriveReportData(wallet: any): DustReportData {
  const specs = (wallet as any).specs;
  const allUTXOs: UTXO[] = [
    ...(specs?.confirmedUTXOs ?? []),
    ...(specs?.unconfirmedUTXOs ?? []),
  ];

  const activeDust = allUTXOs.filter(
    (u) => u.spendability === 'doNotSpend' && u.dustReason === 'initial'
  );

  const linkedCoins = allUTXOs.filter(
    (u) =>
      u.spendability === 'doNotSpend' &&
      (u.dustReason === 'adjacent' || u.dustReason === 'descendant')
  );

  const doNotSpendUTXOs = allUTXOs.filter((u) => u.spendability === 'doNotSpend');

  const amountMarkedDNS = doNotSpendUTXOs.reduce((sum, u) => sum + u.value, 0);

  const pastDustSpends: Transaction[] = ((specs?.transactions as Transaction[]) ?? []).filter(
    (tx) => tx.tags?.includes('potential-dust-spend')
  );

  const hasEligibleDustForDonation = doNotSpendUTXOs.length > 0;

  const isEmpty =
    activeDust.length === 0 &&
    linkedCoins.length === 0 &&
    pastDustSpends.length === 0;

  return {
    activeDust,
    linkedCoins,
    pastDustSpends,
    doNotSpendUTXOs,
    amountMarkedDNS,
    hasEligibleDustForDonation,
    isEmpty,
  };
}

export function useDustReport(walletId: string) {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  const { wallets } = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);

  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const sendMaxFee = useAppSelector((state) => state.sendAndReceive.sendMaxFee);
  const sendPhaseOneState = useAppSelector((state) => state.sendAndReceive.sendPhaseOne);
  const { averageTxFees } = useAppSelector((state) => state.network);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  const [phase, setPhase] = useState<DustReportPhase>('start');
  const [progressStep, setProgressStep] = useState(0);
  const [reportData, setReportData] = useState<DustReportData | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(() =>
    readLastScanned(walletId)
  );
  const [donateDustVisible, setDonateDustVisible] = useState(false);
  const [isCheckingDonation, setIsCheckingDonation] = useState(false);
  const [pendingDonationAmount, setPendingDonationAmount] = useState(0);
  const isExecutingDonation = useRef(false);

  const wasSyncing = useRef(false);

  // Cosmetic progress step reveal during scanning
  useEffect(() => {
    if (phase !== 'scanning') {
      setProgressStep(0);
      return;
    }
    setProgressStep(0);
    const interval = setInterval(() => {
      setProgressStep((prev) => {
        if (prev >= 2) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [phase]);

  // Scan completion detection
  useEffect(() => {
    if (phase !== 'scanning') return;

    const isSyncing = !!(walletSyncing && wallet && walletSyncing[wallet.id]);

    if (wasSyncing.current && !isSyncing) {
      // Scan just completed
      wasSyncing.current = false;
      try {
        const ts = Date.now();
        setItem(DUST_REPORT_LAST_SCANNED_KEY(walletId), ts);
        setLastScanned(formatLastScanned(ts));
        if (wallet) {
          setReportData(deriveReportData(wallet));
        }
        setPhase('result');
      } catch {
        setPhase('error');
      }
      return;
    }

    if (isSyncing) {
      wasSyncing.current = true;
    }
  }, [walletSyncing, phase, wallet, walletId]);

  const runScan = useCallback(() => {
    if (!wallet) return;
    wasSyncing.current = false;
    setProgressStep(0);
    setPhase('scanning');
    try {
      dispatch(refreshWallets([wallet], { hardRefresh: true, dustScan: true }));
    } catch {
      setPhase('error');
    }
  }, [dispatch, wallet]);

  const tryAgain = useCallback(() => {
    runScan();
  }, [runScan]);

  const onDone = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Donation eligibility check result handler
  useEffect(() => {
    if (!isCheckingDonation) return;
    const doNotSpendUTXOs = reportData?.doNotSpendUTXOs ?? [];
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
          recipients: [
            {
              address:
                wallet?.networkType === NetworkType.MAINNET
                  ? KEEPER_DONATION_ADDRESS_MAINNET
                  : KEEPER_DONATION_ADDRESS_TESTNET,
              amount: donationAmount,
            },
          ],
          selectedUTXOs: doNotSpendUTXOs,
        })
      );
    } else if (sendMaxFee >= totalDoNotSpendValue || sendMaxFee === 0) {
      setIsCheckingDonation(false);
      setDonateDustVisible(false);
      showToast(walletTranslation.tooSmallToDonate);
    }
  }, [sendMaxFee, isCheckingDonation]);

  // sendPhaseOne result handler for donation flow
  useEffect(() => {
    if (!isExecutingDonation.current) return;
    const doNotSpendUTXOs = reportData?.doNotSpendUTXOs ?? [];
    if (sendPhaseOneState.isSuccessful) {
      isExecutingDonation.current = false;
      setDonateDustVisible(false);
      navigation.dispatch(
        CommonActions.navigate('SendConfirmation', {
          sender: wallet,
          internalRecipients: [],
          addresses: [
            wallet?.networkType === NetworkType.MAINNET
              ? KEEPER_DONATION_ADDRESS_MAINNET
              : KEEPER_DONATION_ADDRESS_TESTNET,
          ],
          amounts: [pendingDonationAmount],
          selectedUTXOs: doNotSpendUTXOs,
          transactionPriority: TxPriority.LOW,
          isDonation: true,
          note: '',
        })
      );
    } else if (sendPhaseOneState.hasFailed) {
      isExecutingDonation.current = false;
      setDonateDustVisible(false);
      showToast(sendPhaseOneState.failedErrorMessage || walletTranslation.tooSmallToDonate);
    }
  }, [sendPhaseOneState]);

  const executeDonation = useCallback(() => {
    const doNotSpendUTXOs = reportData?.doNotSpendUTXOs ?? [];
    if (doNotSpendUTXOs.length === 0) return;
    dispatch(setSendMaxFee(0));
    setIsCheckingDonation(true);
    dispatch(
      calculateSendMaxFee({
        wallet,
        recipients: [
          {
            address:
              wallet?.networkType === NetworkType.MAINNET
                ? KEEPER_DONATION_ADDRESS_MAINNET
                : KEEPER_DONATION_ADDRESS_TESTNET,
            amount: 0,
          },
        ],
        selectedUTXOs: doNotSpendUTXOs,
        feePerByte: averageTxFees?.[bitcoinNetworkType]?.[TxPriority.LOW]?.feePerByte,
      })
    );
  }, [dispatch, reportData, wallet, averageTxFees, bitcoinNetworkType]);

  return {
    phase,
    progressStep,
    reportData,
    lastScanned,
    donateDustVisible,
    setDonateDustVisible,
    runScan,
    tryAgain,
    onDone,
    onCancel,
    executeDonation,
    wallet,
  };
}

export default useDustReport;
