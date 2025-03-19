import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { hp, wp } from 'src/constants/responsive';

import { useAppSelector } from 'src/store/hooks';
import useBalance from 'src/hooks/useBalance';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { TxPriority } from 'src/services/wallets/enums';
import useAvailableTransactisonPriorities from 'src/store/hooks/sending-utils/UseAvailableTransactionPriorities';
import ArrowIcon from 'src/assets/images/icon_arrow.svg';
import ArrowIconWhite from 'src/assets/images/icon_arrow_white.svg';
import BTC from 'src/assets/images/btc.svg';

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

interface PriorityItemProps {
  priority: TxPriority;
  selectedPriority: TxPriority;
  setSelectedPriority: (priority: TxPriority) => void;
  satvByte: string;
  estimatedBlocks: number;
  openCustomPriorityModal: () => void;
  estimationSign: string;
  totalFee: number;
}

function PriorityItem({
  priority,
  selectedPriority,
  setSelectedPriority,
  satvByte,
  estimatedBlocks,
  openCustomPriorityModal,
  estimationSign,
  totalFee,
}: PriorityItemProps) {
  const { colorMode } = useColorMode();
  const isSelected = priority === selectedPriority;
  const borderColor = isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.dullGreyBorder`;
  const handlePress = () => {
    if (!isSelected) {
      setSelectedPriority(priority);
    }
  };
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);

  const totalFeeBalance = getBalance(totalFee);

  const totalFeeComp = (
    <Box style={styles.totalFeeContainer}>
      {!getSatUnit() && getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
      <Text color={`${colorMode}.modalWhiteContent`}>{` ${totalFeeBalance} ${getSatUnit()}`}</Text>
    </Box>
  );

  return (
    <Pressable onPress={handlePress}>
      <Box
        style={[styles.priorityItemContainer, satvByte ? {} : { height: hp(48) }]}
        backgroundColor={`${colorMode}.textInputBackground`}
        borderColor={borderColor}
        borderWidth={isSelected ? 2 : 1}
      >
        <Box style={styles.priorityItemLeft}>
          <Text medium fontSize={14}>
            {capitalizeFirstLetter(priority)}
          </Text>
          {estimatedBlocks ? (
            <Text fontSize={12}>{`${estimationSign} ${estimatedBlocks * 10} mins`}</Text>
          ) : null}
        </Box>
        {priority !== TxPriority.CUSTOM ? (
          <Box>
            {totalFee ? (
              totalFeeComp
            ) : (
              <Text medium fontSize={13} style={{ marginRight: wp(10) }}>
                {`${satvByte} sats/vbyte`}
              </Text>
            )}
            {totalFee !== 0 && (
              <Text
                fontSize={12}
                style={{ marginRight: wp(10), alignSelf: 'flex-end' }}
                color={`${colorMode}.greenishGreyText`}
              >
                {`${satvByte} sats/vbyte`}
              </Text>
            )}
          </Box>
        ) : (
          <Pressable
            onPress={openCustomPriorityModal}
            height="100%"
            style={{ alignItems: 'center', flexDirection: 'row' }}
            paddingRight={wp(1)}
          >
            {satvByte ? (
              <Box marginRight={wp(3)}>
                {totalFee ? (
                  totalFeeComp
                ) : (
                  <Text medium fontSize={13} style={{ marginRight: wp(10) }}>
                    {`${satvByte} sats/vbyte`}
                  </Text>
                )}
                {totalFee !== 0 && (
                  <Text
                    fontSize={12}
                    style={{ verticalAlign: 'middle', alignSelf: 'flex-end', marginRight: wp(10) }}
                    color={`${colorMode}.greenishGreyText`}
                  >
                    {`${satvByte} sats/vbyte`}
                  </Text>
                )}
              </Box>
            ) : null}
            {colorMode === 'light' ? <ArrowIcon height="100%" /> : <ArrowIconWhite height="100%" />}
          </Pressable>
        )}
      </Box>
    </Pressable>
  );
}

interface PriorityModalProps {
  selectedPriority: TxPriority;
  setSelectedPriority: (priority: TxPriority) => void;
  averageTxFees: any;
  customFeePerByte: number;
  onOpenCustomPriorityModal: () => void;
  customEstBlocks: number;
  setCustomEstBlocks: (blocks: number) => void;
  estimationSign: string;
  setEstimationSign: (estimationSign: string) => void;
  txFeeInfo?: any;
}
function PriorityModal({
  selectedPriority,
  setSelectedPriority,
  averageTxFees,
  customFeePerByte,
  onOpenCustomPriorityModal,
  customEstBlocks,
  setCustomEstBlocks,
  estimationSign,
  setEstimationSign,
  txFeeInfo,
}: PriorityModalProps) {
  const availableTransactionPriorities = useAvailableTransactisonPriorities();
  const reorderedPriorities = [
    ...availableTransactionPriorities.filter((priority) => priority !== TxPriority.CUSTOM),
    ...availableTransactionPriorities.filter((priority) => priority === TxPriority.CUSTOM),
  ];

  const onSelectedPriority = (priority: TxPriority) => {
    if (!customFeePerByte && priority === TxPriority.CUSTOM) {
      openCustomPriorityModal();
    } else {
      setSelectedPriority(priority);
    }
  };

  const openCustomPriorityModal = () => {
    onOpenCustomPriorityModal();
  };

  useEffect(() => {
    setEstimationSign('≈');
    if (selectedPriority === TxPriority.CUSTOM) {
      const { high, medium, low } = averageTxFees;
      let customEstimatedBlock = 0;
      if (customFeePerByte >= high.feePerByte) {
        customEstimatedBlock = high.estimatedBlocks;
      } else if (customFeePerByte <= low.feePerByte) {
        customEstimatedBlock = low.estimatedBlocks;
        if (customFeePerByte < low.feePerByte) setEstimationSign('>');
      } else {
        customEstimatedBlock = medium.estimatedBlocks;
      }
      if (customFeePerByte >= 1) setCustomEstBlocks(customEstimatedBlock);
    } else {
      setCustomEstBlocks(0);
    }
  }, [averageTxFees, customFeePerByte]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {reorderedPriorities?.map((priority) => {
        return (
          <PriorityItem
            priority={priority}
            selectedPriority={selectedPriority}
            setSelectedPriority={onSelectedPriority}
            satvByte={
              priority === TxPriority.CUSTOM ? customFeePerByte : averageTxFees[priority].feePerByte
            }
            estimatedBlocks={
              priority === TxPriority.CUSTOM
                ? customEstBlocks
                : averageTxFees[priority].estimatedBlocks
            }
            openCustomPriorityModal={openCustomPriorityModal}
            estimationSign={priority === TxPriority.CUSTOM ? estimationSign : '≈'}
            totalFee={txFeeInfo?.[priority?.toLowerCase()]?.amount || 0}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  priorityItemContainer: {
    flex: 1,
    height: hp(77),
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: wp(18),
    marginBottom: hp(10),
  },
  priorityItemLeft: {
    gap: 3,
    flex: 1,
  },
  priorityItemRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  totalFeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: wp(6),
    marginBottom: wp(2),
  },
});

export default PriorityModal;
