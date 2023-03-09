import { useNavigation } from '@react-navigation/native';
import { Box, Text, useColorMode } from 'native-base';
import React, { useCallback, useState } from 'react';
import { TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import {
  BtcToSats,
  getAmt,
  getCurrencyImageByRegion,
  getUnit,
  SatsToBtc,
} from 'src/common/constants/Bitcoin';

import { hp, wp, windowWidth } from 'src/common/data/responsiveness/responsive';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import BtcBlack from 'src/assets/images/btc_black.svg';
import { UTXO } from 'src/core/wallets/interfaces';
import Buttons from 'src/components/Buttons';
import _ from 'lodash';

function UTXOSelection({ route }: any) {
  const navigation = useNavigation();
  const { sender, amount } = route.params;
  const utxos = _.clone(sender.specs.confirmedUTXOs);
  const { colorMode } = useColorMode();
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const [selectionTotal, setSelectionTotal] = useState(0);
  const [utxoState, setUtxoState] = useState(
    utxos.map((utxo) => {
      utxo.selected = false;
      return utxo;
    })
  );

  const RenderTransactionElement = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={() => {
          let utxoSum = selectionTotal;
          setUtxoState(
            utxoState.map((utxo) => {
              if (utxo.txId === item.txId) {
                utxoSum = utxo.selected ? utxoSum - utxo.value : utxoSum + utxo.value;
                return { ...utxo, selected: !utxo.selected };
              }
              return utxo;
            })
          );
          setSelectionTotal(utxoSum);
        }}
      >
        <Box
          style={[styles.selectionView, { backgroundColor: item.selected ? 'orange' : 'white' }]}
        />
        <Box style={styles.amountWrapper}>
          <Box>{getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}</Box>
          <Text style={styles.amountText}>
            {getAmt(item.value, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getUnit(currentCurrency, satsEnabled)}
            </Text>
          </Text>
        </Box>
        <Box style={styles.container}>
          <Box style={styles.rowCenter}>
            <Box style={styles.transactionContainer}>
              <Text
                color={`${colorMode}.GreyText`}
                style={styles.transactionIdText}
                numberOfLines={1}
              >
                {item.txId}
              </Text>
            </Box>
          </Box>
        </Box>
      </TouchableOpacity>
    ),
    [utxoState]
  );
  const areEnoughUTXOsSelected = selectionTotal >= BtcToSats(amount);
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Manual Select UTXOs"
        subtitle={`Select a minimum of ${amount} BTC to proceed`}
        onPressHandler={() => navigation.goBack()}
      />
      <FlatList
        style={{ marginTop: 20 }}
        data={utxoState}
        renderItem={({ item }) => <RenderTransactionElement item={item} />}
        keyExtractor={(item: UTXO) => item.txId}
        showsVerticalScrollIndicator={false}
      />
      <Box>
        <Text color={`${colorMode}.GreyText`} style={styles.totalAmount} textAlign="right">
          {SatsToBtc(selectionTotal)}/{amount}
        </Text>
      </Box>
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons
            secondaryText="Cancel"
            secondaryCallback={() => {
              navigation.goBack();
            }}
            primaryDisable={!areEnoughUTXOsSelected}
            primaryText="Send"
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FDF7F0',
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 1,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionContainer: {
    flexDirection: 'row',
    margin: 1.5,
    width: wp(320),
  },
  transactionIdText: {
    fontSize: 13,
    letterSpacing: 0.6,
    width: wp(320),
    marginRight: 5,
  },
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 19,
    letterSpacing: 0.95,
    marginHorizontal: 3,
    marginRight: 3,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
  selectionView: {
    borderWidth: 1,
    borderColor: 'orange',
    height: 10,
    width: 10,
    marginBottom: 10,
  },
  ctaBtnWrapper: {
    marginBottom: hp(5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalAmount: {
    fontSize: 18,
    letterSpacing: 0.6,
  },
});
export default UTXOSelection;
