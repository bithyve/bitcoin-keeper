import { Box, useColorMode } from 'native-base';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { TxPriority } from 'src/services/wallets/enums';
import SignerCard from '../AddSigner/SignerCard';
import AddCard from 'src/components/AddCard';
import { hp, wp, windowWidth } from 'src/constants/responsive';
import useBalance from 'src/hooks/useBalance';
import BTC from 'src/assets/images/btc.svg';

function SendingPriority({
  txFeeInfo,
  averageTxFees,
  transactionPriority,
  isCachedTransaction,
  setTransactionPriority,
  availableTransactionPriorities,
  customFeePerByte,
  setVisibleCustomPriorityModal,
  getBalance,
  getSatUnit,
  networkType,
}) {
  const { colorMode } = useColorMode();
  const { getCurrencyIcon } = useBalance();
  const reorderedPriorities = [
    ...availableTransactionPriorities.filter((priority) => priority === TxPriority.CUSTOM),
    ...availableTransactionPriorities.filter((priority) => priority !== TxPriority.CUSTOM),
  ];

  return (
    <Box>
      <Text style={styles.sendingPriorityText}>Select an option</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fdRow}>
        {reorderedPriorities?.map((priority) => {
          if (isCachedTransaction) if (priority !== transactionPriority) return; // cached tx has priority locked in(the one set during creation of the cached tx)

          if (txFeeInfo[priority?.toLowerCase()].estimatedBlocksBeforeConfirmation !== 0) {
            if (!isCachedTransaction) {
              // for fresh transactions: chip out higher priorities w/ similar fee(reason: insufficient funds to support high sats/vByte)
              // for cached transactions: only one priority exists(lock-in), hence we don't need to chip out anything
              if (priority === TxPriority.HIGH) {
                if (
                  txFeeInfo[TxPriority.HIGH.toLowerCase()].amount ===
                  txFeeInfo[TxPriority.MEDIUM.toLowerCase()].amount
                )
                  return;
              } else if (priority === TxPriority.MEDIUM) {
                if (
                  txFeeInfo[TxPriority.MEDIUM.toLowerCase()].amount ===
                  txFeeInfo[TxPriority.LOW.toLowerCase()].amount
                )
                  return;
              }
            }

            const satvByte =
              priority === TxPriority.CUSTOM
                ? customFeePerByte
                : averageTxFees[networkType]?.[priority]?.feePerByte;

            return (
              <TouchableOpacity
                key={priority}
                onPress={() => {
                  setTransactionPriority(priority);
                }}
              >
                <SignerCard
                  isFeePriority
                  titleComp={
                    <Box style={styles.priorityText}>
                      {getCurrencyIcon(BTC, 'dark')}
                      <Text>
                        {` ${getBalance(
                          txFeeInfo[priority?.toLowerCase()]?.amount
                        )} ${getSatUnit()}`}
                      </Text>
                    </Box>
                  }
                  icon={{}}
                  isSelected={transactionPriority === priority}
                  key={priority}
                  name={String(priority)}
                  subtitle={`${satvByte} sats/vbyte`}
                  description={`≈${
                    txFeeInfo[priority?.toLowerCase()]?.estimatedBlocksBeforeConfirmation * 10
                  } mins`}
                  boldDesc
                  numberOfLines={2}
                  onCardSelect={() => setTransactionPriority(priority)}
                  customStyle={{
                    width: wp(96.5),
                    opacity: transactionPriority === priority ? 1 : 0.5,
                    height: getSatUnit() === 'sats' ? 150 : 135,
                  }}
                  colorMode={colorMode}
                />
              </TouchableOpacity>
            );
          }
        })}
      </ScrollView>
      {isCachedTransaction ? null : (
        <Box style={styles.customPriorityCardContainer}>
          <Text style={styles.customPriorityText}>or choose custom fee</Text>
          <AddCard
            cardStyles={styles.customPriorityCard}
            name="Custom Priority"
            callback={setVisibleCustomPriorityModal}
          />
        </Box>
      )}
    </Box>
  );
}
export default SendingPriority;

const styles = StyleSheet.create({
  sendingPriorityText: {
    fontSize: 15,
    letterSpacing: 0.15,
    marginBottom: hp(5),
  },
  fdRow: {
    flexDirection: 'row',
  },
  customPriorityCardContainer: {
    marginTop: hp(50),
    marginBottom: hp(20),
  },
  customPriorityCard: {
    width: windowWidth / 3.4 - windowWidth * 0.05,
    marginTop: 5,
  },
  customPriorityText: {
    fontSize: 15,
    marginBottom: hp(5),
  },
  priorityTableText: {
    fontSize: 16,
  },
  priorityText: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: ,
  },
});
