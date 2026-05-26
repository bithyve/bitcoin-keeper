import React, { useContext } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Box, useColorMode } from '@gluestack-ui/themed-native-base';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import Text from 'src/components/KeeperText';
import Buttons from 'src/components/Buttons';
import KeeperModal from 'src/components/KeeperModal';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import useDustReport from 'src/hooks/useDustReport';
import { UTXO, Transaction } from 'src/services/wallets/interfaces';

type Props = NativeStackScreenProps<AppStackParams, 'DustReport'>;

// ── Sub-components ────────────────────────────────────────────────────────────

function DoNotSpendChip() {
  return (
    <Box style={styles.chip}>
      <Text style={styles.chipText}>Do Not Spend</Text>
    </Box>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.summaryRow}>
      <Text color={`${colorMode}.secondaryText`} style={styles.summaryLabel}>
        {label}
      </Text>
      <Text color={`${colorMode}.primaryText`} style={styles.summaryValue}>
        {value}
      </Text>
    </Box>
  );
}

function UTXORow({ utxo, reason }: { utxo: UTXO; reason: string }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.row}>
      <Box style={styles.rowLeft}>
        <Text color={`${colorMode}.primaryText`} style={styles.rowAmount}>
          {utxo.value.toLocaleString()} sats
        </Text>
        <Text color={`${colorMode}.secondaryText`} style={styles.rowReason}>
          {reason}
        </Text>
      </Box>
      <DoNotSpendChip />
    </Box>
  );
}

function TxRow({ tx }: { tx: Transaction }) {
  const { colorMode } = useColorMode();
  const date = tx.blockTime
    ? new Date(tx.blockTime * 1000).toLocaleDateString()
    : tx.date ?? '—';
  return (
    <Box style={styles.row}>
      <Box style={styles.rowLeft}>
        <Text color={`${colorMode}.primaryText`} style={styles.rowAmount}>
          {date}
          {tx.amount ? `  ·  ${tx.amount.toLocaleString()} sats` : ''}
        </Text>
        <Text color={`${colorMode}.secondaryText`} style={styles.rowReason}>
          Potential dust spend
        </Text>
      </Box>
    </Box>
  );
}

function SectionCard({
  title,
  emptyText,
  children,
}: {
  title: string;
  emptyText: string;
  children?: React.ReactNode;
}) {
  const { colorMode } = useColorMode();
  const hasContent = React.Children.count(children) > 0;
  return (
    <Box
      style={styles.sectionCard}
      backgroundColor={`${colorMode}.textInputBackground`}
      borderColor={`${colorMode}.separator`}
    >
      <Text color={`${colorMode}.primaryText`} style={styles.sectionTitle}>
        {title}
      </Text>
      {hasContent ? (
        children
      ) : (
        <Text color={`${colorMode}.secondaryText`} style={styles.emptyText}>
          {emptyText}
        </Text>
      )}
    </Box>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

function DustReportScreen({ route }: Props) {
  const { colorMode } = useColorMode();
  const { walletId } = route.params;
  const { translations } = useContext(LocalizationContext);
  const { wallet: t, common } = translations;

  const {
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
  } = useDustReport(walletId);

  const progressItems = [t.scanProgressCoins, t.scanProgressTxs, t.scanProgressReport];

  const screenTitle =
    phase === 'scanning'
      ? t.scanningWalletTitle
      : phase === 'result' && reportData?.isEmpty
      ? t.noDustFoundTitle
      : phase === 'error'
      ? t.reportNotCompletedTitle
      : t.dustReport;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={screenTitle} />

      {/* ── Start phase ──────────────────────────────────────────────── */}
      {phase === 'start' && (
        <Box style={styles.phaseContainer}>
          <Box style={styles.bodyContainer}>
            <Text color={`${colorMode}.secondaryText`} style={styles.bodyText}>
              {t.dustReportStartBody}
            </Text>
          </Box>
          <Box style={styles.footerContainer}>
            <Buttons
              primaryText={t.runReport}
              primaryCallback={runScan}
              secondaryText={common.cancel}
              secondaryCallback={onCancel}
            />
          </Box>
        </Box>
      )}

      {/* ── Scanning phase ───────────────────────────────────────────── */}
      {phase === 'scanning' && (
        <Box style={styles.phaseContainer}>
          <ActivityIndicatorView visible showLoader />
          <Box style={styles.bodyContainer}>
            <Text color={`${colorMode}.secondaryText`} style={styles.bodyText}>
              {t.scanningWalletBody}
            </Text>
            <Box style={styles.progressContainer}>
              {progressItems.slice(0, progressStep + 1).map((item, idx) => (
                <Text
                  key={idx}
                  color={`${colorMode}.primaryText`}
                  style={styles.progressItem}
                >
                  {'· '}
                  {item}
                </Text>
              ))}
            </Box>
          </Box>
          <Box style={styles.footerContainer}>
            <Buttons
              secondaryText={common.cancel}
              secondaryCallback={onCancel}
            />
          </Box>
        </Box>
      )}

      {/* ── Result phase — findings ──────────────────────────────────── */}
      {phase === 'result' && reportData && !reportData.isEmpty && (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text color={`${colorMode}.secondaryText`} style={styles.bodyText}>
              {t.dustReportFoundBody}
            </Text>

            {/* Summary card */}
            <Box
              style={styles.summaryCard}
              backgroundColor={`${colorMode}.textInputBackground`}
              borderColor={`${colorMode}.separator`}
            >
              <SummaryRow
                label="Do Not Spend coins"
                value={String(reportData.doNotSpendUTXOs.length)}
              />
              <SummaryRow
                label="Amount marked Do Not Spend"
                value={`${reportData.amountMarkedDNS.toLocaleString()} sats`}
              />
              <SummaryRow
                label="Past dust spends"
                value={String(reportData.pastDustSpends.length)}
              />
              <SummaryRow
                label="Last scanned"
                value={lastScanned ?? t.lastScannedNever}
              />
            </Box>

            {/* Active Dust section */}
            <SectionCard title={t.activeDustTitle} emptyText={t.noActiveDust}>
              {reportData.activeDust.map((utxo, idx) => (
                <UTXORow
                  key={`${utxo.txId}:${utxo.vout}-${idx}`}
                  utxo={utxo}
                  reason={t.potentialDustPayment}
                />
              ))}
            </SectionCard>

            {/* Linked Coins section */}
            <SectionCard title={t.linkedCoinsTitle} emptyText={t.noLinkedCoins}>
              {reportData.linkedCoins.map((utxo, idx) => (
                <UTXORow
                  key={`${utxo.txId}:${utxo.vout}-${idx}`}
                  utxo={utxo}
                  reason={t.linkedToDustSpend}
                />
              ))}
            </SectionCard>

            {/* Past Dust Spends section */}
            <SectionCard
              title={t.pastDustSpendsTitle}
              emptyText={t.noPastDustSpends}
            >
              {reportData.pastDustSpends.map((tx, idx) => (
                <TxRow key={`${tx.txid}-${idx}`} tx={tx} />
              ))}
            </SectionCard>

            <Box style={{ height: hp(120) }} />
          </ScrollView>

          <Box style={styles.stickyFooter}>
            <Buttons
              primaryText={common.done}
              primaryCallback={onDone}
              secondaryText={
                reportData.hasEligibleDustForDonation
                  ? 'Donate Dust'
                  : undefined
              }
              secondaryCallback={
                reportData.hasEligibleDustForDonation
                  ? () => setDonateDustVisible(true)
                  : undefined
              }
            />
          </Box>
        </>
      )}

      {/* ── Result phase — empty ─────────────────────────────────────── */}
      {phase === 'result' && reportData?.isEmpty && (
        <Box style={styles.phaseContainer}>
          <Box style={styles.bodyContainer}>
            <Text color={`${colorMode}.secondaryText`} style={styles.bodyText}>
              {t.noDustFoundBody}
            </Text>
          </Box>
          <Box style={styles.footerContainer}>
            <Buttons primaryText={common.done} primaryCallback={onDone} />
          </Box>
        </Box>
      )}

      {/* ── Error phase ──────────────────────────────────────────────── */}
      {phase === 'error' && (
        <Box style={styles.phaseContainer}>
          <Box style={styles.bodyContainer}>
            <Text color={`${colorMode}.secondaryText`} style={styles.bodyText}>
              {t.reportNotCompletedBody}
            </Text>
          </Box>
          <Box style={styles.footerContainer}>
            <Buttons
              primaryText={t.tryAgain}
              primaryCallback={tryAgain}
              secondaryText={common.cancel}
              secondaryCallback={onCancel}
            />
          </Box>
        </Box>
      )}

      {/* ── Donate Dust confirmation modal ───────────────────────────── */}
      <KeeperModal
        visible={donateDustVisible}
        close={() => setDonateDustVisible(false)}
        title="Donate Dust"
        subTitle={t.donateDustConfirmBody}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText="Donate Dust"
        buttonCallback={executeDonation}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setDonateDustVisible(false)}
        showCloseIcon={false}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  phaseContainer: {
    flex: 1,
    paddingHorizontal: wp(24),
  },
  bodyContainer: {
    flex: 1,
    paddingTop: hp(24),
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footerContainer: {
    paddingBottom: hp(24),
  },
  progressContainer: {
    marginTop: hp(24),
    gap: hp(8),
  },
  progressItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(24),
    paddingTop: hp(16),
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: wp(20),
    marginTop: hp(16),
    marginBottom: hp(16),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(6),
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  summaryValue: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'right',
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: wp(16),
    marginBottom: hp(16),
  },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: hp(12),
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  rowLeft: {
    flex: 1,
    marginRight: wp(8),
  },
  rowAmount: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  rowReason: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: hp(2),
  },
  chip: {
    backgroundColor: 'rgba(242, 72, 34, 0.12)',
    borderRadius: 999,
    paddingHorizontal: wp(8),
    paddingVertical: hp(3),
  },
  chipText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#F24822',
    fontWeight: '600',
  },
  stickyFooter: {
    paddingHorizontal: wp(24),
    paddingBottom: hp(24),
  },
});

export default DustReportScreen;
