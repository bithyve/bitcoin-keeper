import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, useColorMode } from 'native-base';
import React, { useContext, useMemo, useState } from 'react';
import useBalance from 'src/hooks/useBalance';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { hp, wp, windowHeight } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import EmptyStateView from 'src/components/EmptyView/EmptyStateView';
import { UTXO } from 'src/services/wallets/interfaces';
import Selected from 'src/assets/images/selected.svg';
import { WalletType } from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { refreshWallets } from 'src/store/sagaActions/wallets';
import UnconfirmedIcon from 'src/assets/images/pending.svg';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppSelector } from 'src/store/hooks';
import useLabelsNew from 'src/hooks/useLabelsNew';
import CurrencyInfo from 'src/screens/Home/components/CurrencyInfo';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import LabelItem from 'src/screens/UTXOManagement/components/LabelItem';

export function UTXOLabel(props: {
  labels: Array<{ name: string; isSystem: boolean }>;
  center?: boolean;
  addMoreBtn?: boolean;
  isSelecting?: boolean;
}) {
  const { colorMode } = useColorMode();
  const { labels, center, addMoreBtn, isSelecting = false } = props;
  const [extraLabelCount, setExtraLabelCount] = useState(0);
  const [extraLabelMap, setExtraLabelMap] = useState(new Map());

  const onLayout = (event, index) => {
    const { y } = event.nativeEvent.layout;
    if (y > wp(9)) {
      extraLabelMap.set(`${index}`, true);
      setExtraLabelMap(extraLabelMap);
    } else {
      extraLabelMap.delete(`${index}`);
      setExtraLabelMap(extraLabelMap);
    }
    setExtraLabelCount(extraLabelMap.size);
  };

  const onUnmount = (index) => {
    extraLabelMap.delete(`${index}`);
    setExtraLabelMap(extraLabelMap);
    setExtraLabelCount(extraLabelMap.size);
  };

  return (
    <Box
      style={{
        flexDirection: 'row',
        alignSelf: center ? 'center' : 'flex-start',
      }}
    >
      <Box style={[styles.labelList, isSelecting ? {} : { overflow: 'hidden', maxHeight: 28 }]}>
        {labels
          .sort((a, b) => (a.isSystem < b.isSystem ? 1 : a.isSystem > b.isSystem ? -1 : 0))
          .map((item, index) => (
            <LabelItem
              key={`${item.name + index}`}
              item={item}
              onLayout={onLayout}
              onUnmount={onUnmount}
              index={index}
              editable={false}
            />
          ))}
      </Box>
      {extraLabelCount > 0 && !isSelecting && (
        <Box
          style={[styles.utxoExtraLabel]}
          color={`${colorMode}.headerWhite`}
          backgroundColor={`${colorMode}.primaryBrown`}
        >
          <Text
            style={styles.labelText}
            color={`${colorMode}.headerWhite`}
            testID="text_extraLabelCount"
          >
            +{extraLabelCount}
          </Text>
        </Box>
      )}
      {addMoreBtn && (
        <Box
          style={[styles.addBtnLabel]}
          color={`${colorMode}.headerWhite`}
          backgroundColor={`${colorMode}.pantoneGreen`}
        >
          <Text
            style={[styles.labelText, { fontSize: 16 }]}
            color={`${colorMode}.headerWhite`}
            testID="text_extraLabelCount"
            bold
          >
            +
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
  const allowSelection = enableSelection;
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;
  const { labels: txNoteLabels } = useLabelsNew({ txid: item.txId, wallet: currentWallet });
  const hasTransactionNote = txNoteLabels && txNoteLabels[item.txId]?.[0]?.name;

  return (
    <Box style={styles.utxoElementWrapper} borderBottomColor={`${colorMode}.separator`}>
      <TouchableOpacity
        style={styles.utxoCardContainer}
        onPress={() => {
          if (allowSelection) {
            const mapToUpdate = selectedUTXOMap;
            if (selectedUTXOMap[utxoId]) {
              delete mapToUpdate[utxoId];
            } else {
              if (
                (selectedAccount === WalletType.PRE_MIX ||
                  selectedAccount === WalletType.POST_MIX) &&
                Object.keys(selectedUTXOMap).length >= 1 &&
                initateWhirlpoolMix
              ) {
                showToast(walletTranslation.utxoAllowedTime);
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
          <Box style={{ width: '55%' }}>
            <Box style={styles.rowCenter}>
              <Box style={{ width: '100%' }}>
                <Text
                  color={`${colorMode}.primaryText`}
                  style={styles.transactionIdText}
                  numberOfLines={1}
                  testID={`text_${item.txId}`}
                  semiBold
                >
                  {item.txId}
                </Text>
              </Box>
            </Box>
            {hasTransactionNote ? (
              <Box style={styles.rowCenter}>
                <Box style={{ width: '100%' }}>
                  <Text
                    color={`${colorMode}.primaryText`}
                    style={styles.transactionNoteText}
                    numberOfLines={1}
                    testID={`text_${item.txId}`}
                  >
                    {txNoteLabels[item.txId]?.[0]?.name}
                  </Text>
                </Box>
              </Box>
            ) : null}
            {labels.length === 0 ? (
              <Box style={styles.utxoLabelView} backgroundColor={`${colorMode}.gray`}>
                <Text color={`${colorMode}.placeHolderTextColor`} style={styles.addLabelsText}>
                  + {walletTranslation.AddLabels}
                </Text>
              </Box>
            ) : (
              <Box marginTop={hp(8)}>
                <UTXOLabel labels={labels} isSelecting={allowSelection} />
              </Box>
            )}
          </Box>
          <Box
            style={[
              styles.amountWrapper,
              {
                width: allowSelection ? '20%' : '30%',
                marginRight: allowSelection ? wp(10) : wp(5),
                marginTop: hasTransactionNote ? wp(5) : wp(30),
              },
            ]}
          >
            {item.height > 0 ? null : (
              <Box paddingX={3} testID="view_unconfirmIcon">
                <UnconfirmedIcon />
              </Box>
            )}
            <CurrencyInfo
              hideAmounts={false}
              amount={item.value}
              fontSize={18}
              color={`${colorMode}.textDarkGreen`}
              variation={colorMode === 'light' ? 'dark' : 'light'}
            />
          </Box>
        </Box>
      </TouchableOpacity>
    </Box>
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
  const sortedUTXOs = useMemo(
    () =>
      [...utxoState].sort((a, b) => {
        console.log(a);
        console.log(b);
        if (!a.height && !b.height) return 0;
        if (!a.height) return -1;
        if (!b.height) return 1;
        return b.height - a.height;
      }) || [],
    [utxoState]
  );

  return (
    <FlatList
      data={sortedUTXOs}
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
    paddingTop: hp(15),
    paddingBottom: hp(22),
    paddingHorizontal: wp(20),
  },
  utxoElementWrapper: {
    borderBottomWidth: 1,
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
    fontSize: 14,
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
    marginLeft: 3,
    marginTop: hp(5),
  },
  utxoLabelView: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(2),
    borderRadius: 20,
    marginHorizontal: wp(3),
    marginTop: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    lineHeight: 18,
  },
  addLabelsText: {
    fontSize: 13,
    textAlign: 'left',
    width: '100%',
    marginTop: hp(5),
  },
  transactionNoteText: {
    fontSize: 12,
    letterSpacing: 0.6,
    marginLeft: 7,
    marginTop: hp(10),
  },
  utxoExtraLabel: {
    paddingHorizontal: wp(6),
    paddingVertical: wp(2),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(10),
  },
  addBtnLabel: {
    paddingHorizontal: wp(7),
    paddingVertical: wp(2),
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(10),
    marginLeft: hp(5),
  },
});
