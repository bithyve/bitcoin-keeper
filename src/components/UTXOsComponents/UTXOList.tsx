import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useState } from 'react';
import useBalance from 'src/hooks/useBalance';
import { CommonActions, useNavigation } from '@react-navigation/native';
import BtcBlack from 'src/assets/images/btc_black.svg';
import { hp, windowHeight } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import { UTXO } from 'src/core/wallets/interfaces';
import Selected from 'src/assets/images/selected.svg';
import useLabels from 'src/hooks/useLabels';
import { LabelType } from 'src/core/wallets/enums';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import UnconfirmedIcon from 'src/assets/images/pending.svg';

function UTXOLabel(props: { labels: Array<{ name: string; type: LabelType }> }) {
  const { labels } = props;
  const [extraLabelCount, setExtraLabelCount] = useState(0);
  const extraLabelMap = new Map();
  const onLayout = (event, index) => {
    const { y } = event.nativeEvent.layout;
    if (y > 9) {
      extraLabelMap.set(index, true);
    } else {
      extraLabelMap.delete(index);
    }
    setExtraLabelCount(extraLabelMap.size);
  };
  return (
    <Box style={{ flexDirection: 'row' }}>
      <Box style={styles.labelList}>
        {labels
          .sort((a, b) => (a.type > b.type ? 1 : a.type < b.type ? -1 : 0))
          .map((item, index) => (
            <Box
              key={item.name}
              onLayout={(event) => onLayout(event, index)}
              style={[
                styles.utxoLabelView,
                { backgroundColor: item.type === LabelType.SYSTEM ? '#23A289' : '#E0B486' },
              ]}
            >
              <Text style={styles.labelText} bold>
                {item.name.toUpperCase()}
              </Text>
            </Box>
          ))}
      </Box>
      {extraLabelCount > 0 && (
        <Box style={[styles.utxoLabelView, { backgroundColor: '#E3BE96' }]}>
          <Text style={{ color: Colors.White }}>+{extraLabelCount}</Text>
        </Box>
      )}
    </Box>
  );
}
function UTXOElement({
  item,
  enableSelection,
  selectedUTXOMap,
  setSelectedUTXOMap,
  utxoState,
  setSelectionTotal,
  navigation,
  colorMode,
  labels,
  currentWallet,
}: any) {
  const utxoId = `${item.txId}${item.vout}`;
  const allowSelection = enableSelection && item.confirmed;
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();

  return (
    <TouchableOpacity
      style={styles.utxoCardContainer}
      onPress={() => {
        if (allowSelection) {
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
          navigation.dispatch(
            CommonActions.navigate('UTXOLabeling', { utxo: item, wallet: currentWallet })
          );
        }
      }}
    >
      <Box style={styles.utxoInnerView}>
        {allowSelection ? (
          <Box style={{ width: '7%', paddingHorizontal: 15 }}>
            <Box style={styles.selectionViewWrapper}>
              {selectedUTXOMap[utxoId] ? (
                <Selected />
              ) : (
                <Box style={[styles.selectionView, { backgroundColor: 'transparent' }]} />
              )}
            </Box>
          </Box>
        ) : null}
        <Box style={{ width: allowSelection ? '46%' : '55%' }}>
          <Box style={styles.rowCenter}>
            <Box style={{ width: '100%' }}>
              <Text
                color={`${colorMode}.GreyText`}
                style={styles.transactionIdText}
                numberOfLines={1}
              >
                {item.txId}
              </Text>
            </Box>
          </Box>
          <UTXOLabel labels={labels} />
        </Box>
        <Box style={[styles.amountWrapper, { width: '45%' }]}>
          {item.confirmed ? null : (
            <Box paddingX={3}>
              <UnconfirmedIcon />
            </Box>
          )}
          <Box>{getCurrencyIcon(BtcBlack, 'dark')}</Box>
          <Text style={styles.amountText} numberOfLines={1}>
            {getBalance(item.value)}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getSatUnit()}
            </Text>
          </Text>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

function UTXOList({
  utxoState,
  enableSelection,
  setSelectionTotal,
  selectedUTXOMap,
  setSelectedUTXOMap,
  currentWallet,
  emptyIcon,
}) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { labels, syncing } = useLabels({ utxos: utxoState, wallet: currentWallet });
  const dispatch = useDispatch();
  const pullDownRefresh = () => dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
  return (
    <FlatList
      data={utxoState}
      style={{
        maxHeight: hp(500)
      }}
      refreshing={!!syncing}
      onRefresh={pullDownRefresh}
      renderItem={({ item }) => (
        <UTXOElement
          labels={labels ? labels[`${item.txId}${item.vout}`] || [] : []}
          item={item}
          enableSelection={enableSelection}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          utxoState={utxoState}
          setSelectionTotal={setSelectionTotal}
          navigation={navigation}
          colorMode={colorMode}
          currentWallet={currentWallet}
        />
      )}
      keyExtractor={(item: UTXO) => `${item.txId}${item.vout}`}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Box style={{ paddingTop: windowHeight > 800 ? hp(80) : hp(100) }}>
          <EmptyStateView
            IllustartionImage={emptyIcon}
            title="Your UTXOs will show up here when you"
            subTitle="receive sats in the wallet"
          />
        </Box>
      }
    />
  );
}

export default UTXOList;

const styles = StyleSheet.create({
  utxoCardContainer: {
    marginVertical: 5,
    borderRadius: 10,
    padding: 6,
    paddingVertical: 5,
    width: '100%',
  },
  utxoCardWrapper: {},
  utxoInnerView: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginLeft: 7,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
  labelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
    width: '90%',
    maxHeight: 28,
  },
  utxoLabelView: {
    paddingHorizontal: 5,
    borderRadius: 5,
    marginHorizontal: 3,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    color: Colors.White,
    fontSize: 11,
    lineHeight: 18,
  },
});
