import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import useBalance from 'src/hooks/useBalance';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp, windowHeight } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import { UTXO } from 'src/services/wallets/interfaces';
import Selected from 'src/assets/images/selected.svg';
import { WalletType } from 'src/services/wallets/enums';
import Colors from 'src/theme/Colors';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import UnconfirmedIcon from 'src/assets/images/pending.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import useLabelsNew from 'src/hooks/useLabelsNew';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function Label({
  name,
  isSystem,
  onLayout,
  index,
  setExtraLabelMap,
  extraLabelMap,
  setExtraLabelCount,
}) {
  const { colorMode } = useColorMode();
  useEffect(
    () => () => {
      extraLabelMap.delete(`${index}`);
      setExtraLabelMap(extraLabelMap);
      setExtraLabelCount(extraLabelMap.size);
    },
    []
  );
  return (
    <Box
      key={name}
      onLayout={(event) => onLayout(event, index)}
      style={styles.utxoLabelView}
      backgroundColor={isSystem ? `${colorMode}.forestGreen` : `${colorMode}.accent`}
    >
      <Text style={styles.labelText} bold testID={`text_${name.replace(/ /g, '_')}`}>
        {name.toUpperCase()}
      </Text>
    </Box>
  );
}
function UTXOLabel(props: { labels: Array<{ name: string; isSystem: boolean }> }) {
  const { colorMode } = useColorMode();
  const { labels } = props;
  const [extraLabelCount, setExtraLabelCount] = useState(0);
  const [extraLabelMap, setExtraLabelMap] = useState(new Map());
  const onLayout = (event, index) => {
    const { y } = event.nativeEvent.layout;
    if (y > 9) {
      extraLabelMap.set(`${index}`, true);
      setExtraLabelMap(extraLabelMap);
    } else {
      extraLabelMap.delete(`${index}`);
      setExtraLabelMap(extraLabelMap);
    }
    setExtraLabelCount(extraLabelMap.size);
  };
  return (
    <Box style={{ flexDirection: 'row' }}>
      <Box style={styles.labelList}>
        {labels
          .sort((a, b) => (a.isSystem < b.isSystem ? 1 : a.isSystem > b.isSystem ? -1 : 0))
          .map((item, index) => (
            <Label
              key={`${item.name + index}`}
              name={item.name}
              isSystem={item.isSystem}
              onLayout={onLayout}
              index={index}
              setExtraLabelMap={setExtraLabelMap}
              extraLabelMap={extraLabelMap}
              setExtraLabelCount={setExtraLabelCount}
            />
          ))}
      </Box>
      {extraLabelCount > 0 && (
        <Box
          style={[styles.utxoLabelView, { maxHeight: 19 }]}
          backgroundColor={`${colorMode}.accent`}
        >
          <Text style={styles.labelText} testID="text_extraLabelCount">
            +{extraLabelCount}
          </Text>
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
  selectedAccount,
  initateWhirlpoolMix,
}: any) {
  const utxoId = `${item.txId}${item.vout}`;
  const allowSelection = enableSelection && item.confirmed;
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;

  return (
    <TouchableOpacity
      style={styles.utxoCardContainer}
      onPress={() => {
        if (enableSelection && !item.confirmed) {
          showToast(walletTranslation.intiatePremixToastMsg, <ToastErrorIcon />);
          return;
        }
        if (allowSelection) {
          const mapToUpdate = selectedUTXOMap;
          if (selectedUTXOMap[utxoId]) {
            delete mapToUpdate[utxoId];
          } else {
            if (
              (selectedAccount === WalletType.PRE_MIX || selectedAccount === WalletType.POST_MIX) &&
              Object.keys(selectedUTXOMap).length >= 1 &&
              initateWhirlpoolMix
            ) {
              showToast(walletTranslation.utxoAllowedTime, null, 3000);
              return;
            }
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
      testID="btn_selectUtxos"
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
                testID={`text_${item.txId}`}
              >
                {item.txId}
              </Text>
            </Box>
          </Box>
          <UTXOLabel labels={labels} />
        </Box>
        <Box style={[styles.amountWrapper, { width: '45%' }]}>
          {item.confirmed ? null : (
            <Box paddingX={3} testID="view_unconfirmIcon">
              <UnconfirmedIcon />
            </Box>
          )}
          <CurrencyInfo
            hideAmounts={false}
            amount={item.value}
            fontSize={17}
            color={`${colorMode}.GreyText`}
            variation={colorMode === 'light' ? 'dark' : 'light'}
          />
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
  selectedAccount,
  initateWhirlpoolMix,
}) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;
  const { labels } = useLabelsNew({ utxos: utxoState, wallet: currentWallet });
  const dispatch = useDispatch();
  const { walletSyncing } = useAppSelector((state) => state.wallet);
  const syncing = walletSyncing && currentWallet ? !!walletSyncing[currentWallet.id] : false;
  const pullDownRefresh = () => dispatch(refreshWallets([currentWallet], { hardRefresh: true }));
  return (
    <FlatList
      data={utxoState}
      refreshing={!!syncing}
      onRefresh={pullDownRefresh}
      renderItem={({ item }) => (
        <UTXOElement
          labels={labels ? labels[`${item.txId}:${item.vout}`] || [] : []}
          item={item}
          enableSelection={enableSelection}
          selectedUTXOMap={selectedUTXOMap}
          setSelectedUTXOMap={setSelectedUTXOMap}
          utxoState={utxoState}
          setSelectionTotal={setSelectionTotal}
          navigation={navigation}
          colorMode={colorMode}
          currentWallet={currentWallet}
          selectedAccount={selectedAccount}
          initateWhirlpoolMix={initateWhirlpoolMix}
        />
      )}
      keyExtractor={(item: UTXO) => `${item.txId}${item.vout}${item.confirmed}`}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <Box style={{ paddingTop: windowHeight > 800 ? hp(80) : hp(100) }}>
          <EmptyStateView
            IllustartionImage={emptyIcon}
            title={walletTranslation.noUTXOYet}
            subTitle={walletTranslation.noUTXOYetSubTitle}
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
    width: '85%',
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
