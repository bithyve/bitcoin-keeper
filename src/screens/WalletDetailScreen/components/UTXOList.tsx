import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import { CommonActions, useNavigation } from '@react-navigation/native';
import NoTransactionIcon from 'src/assets/images/noTransaction.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import { hp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import { UTXO } from 'src/core/wallets/interfaces';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useLabels from 'src/hooks/useLabels';
import { LabelType } from 'src/core/wallets/enums';

function UTXOElement({
  item,
  enableSelection,
  selectionTotal,
  selectedUTXOMap,
  setSelectedUTXOMap,
  utxoState,
  setSelectionTotal,
  navigation,
  colorMode,
  currencyCode,
  currentCurrency,
  exchangeRates,
  satsEnabled,
  labels,
  currentWallet
}: any) {
  const utxoId = `${item.txId}${item.vout}`;
  return (
    <TouchableOpacity
      style={styles.utxoCardContainer}
      onPress={() => {
        if (enableSelection) {
          const mapToUpdate = selectedUTXOMap;
          if (selectedUTXOMap[utxoId]) {
            delete mapToUpdate[utxoId];
          } else {
            mapToUpdate[utxoId] = true;
          }
          setSelectedUTXOMap(mapToUpdate);
          let utxoSum = 0;
          utxoState.forEach((utxo) => {
            const utxoId = `${utxo.txId}${utxo.vout}`;
            if (mapToUpdate[utxoId]) {
              utxoSum += utxo.value;
            }
          });
          setSelectionTotal(utxoSum);
        } else {
          navigation.dispatch(CommonActions.navigate('UTXOLabeling', { utxo: item, wallet: currentWallet }));
        }
      }}
    >
      <Box style={styles.utxoInnerView}>
        {enableSelection ? (
          <Box style={{ width: '7%' }}>
            <Box style={styles.selectionViewWrapper}>
              <Box
                style={[
                  styles.selectionView,
                  { backgroundColor: selectedUTXOMap[utxoId] ? 'orange' : 'white' },
                ]}
              />
            </Box>
          </Box>
        ) : null}
        <Box style={styles.utxoCardWrapper}>
          <Box style={styles.rowCenter}>
            <Box style={{ width: '60%' }}>
              <Text
                color={`${colorMode}.GreyText`}
                style={styles.transactionIdText}
                numberOfLines={1}
              >
                {item.txId}
              </Text>
            </Box>
            <Box style={[styles.amountWrapper, { width: '45%' }]}>
              <Box>{getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}</Box>
              <Text style={styles.amountText} numberOfLines={1}>
                {getAmt(item.value, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                <Text color={`${colorMode}.dateText`} style={styles.unitText}>
                  {getUnit(currentCurrency, satsEnabled)}
                </Text>
              </Text>
            </Box>
          </Box>
          <Box style={styles.labelList}>
            {labels.map((item) => (
              <Box
                style={[
                  styles.utxoLabelView,
                  { backgroundColor: item.type === LabelType.USER ? '#E3BE96' : '#52C9B2' },
                ]}
              >
                <Text>{item.name}</Text>
              </Box>
            ))}
            <Box style={[styles.utxoLabelView, { backgroundColor: '#E3BE96' }]}>
              <Text>+{labels && labels.length - 3} more</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

function UTXOList({
  utxoState,
  enableSelection,
  selectionTotal,
  setSelectionTotal,
  selectedUTXOMap,
  setSelectedUTXOMap,
  currentWallet,
}) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const exchangeRates = useExchangeRates();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { labels } = useLabels({ utxos: utxoState });

  return (
    <FlatList
      data={utxoState}
      renderItem={({ item }) => (
        <UTXOElement
          labels={labels ? labels[`${item.txId}${item.vout}`] || [] : []}
          item={item}
          enableSelection={enableSelection}
          selectionTotal={selectionTotal}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          utxoState={utxoState}
          setSelectionTotal={setSelectionTotal}
          navigation={navigation}
          colorMode={colorMode}
          currencyCode={currencyCode}
          currentCurrency={currentCurrency}
          exchangeRates={exchangeRates}
          satsEnabled={satsEnabled}
          currentWallet={currentWallet}
        />
      )}
      keyExtractor={(item: UTXO) => item.txId}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyStateView
          IllustartionImage={NoTransactionIcon}
          title="No transactions yet."
          subTitle="Pull down to refresh"
        />
      }
    />
  );
}

export default UTXOList;

const styles = StyleSheet.create({
  utxoCardContainer: {
    backgroundColor: '#FDF7F0',
    marginVertical: 5,
    borderRadius: 10,
    padding: 6,
    paddingVertical: 15,
    width: '100%',
  },
  utxoCardWrapper: {
    width: '90%',
  },
  utxoInnerView: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  selectionViewWrapper: {
    alignItems: 'center',
  },
  selectionView: {
    borderWidth: 1,
    borderColor: 'orange',
    height: 20,
    width: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  amountText: {
    fontSize: 19,
    letterSpacing: 0.95,
    marginHorizontal: 3,
    marginRight: 3,
  },
  transactionIdText: {
    fontSize: 13,
    letterSpacing: 0.6,
    marginRight: 5,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
  labelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingTop: 5,
  },
  utxoLabelView: {
    padding: 5,
    borderRadius: 5,
    margin: 3,
  },
});
