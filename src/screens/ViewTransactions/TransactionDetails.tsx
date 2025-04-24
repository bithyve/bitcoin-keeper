/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import Text from 'src/components/KeeperText';
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Box, ScrollView, VStack, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import openLink from 'src/utils/OpenLink';
import IconRecieve from 'src/assets/images/icon_received_lg.svg';
import IconRecieveDark from 'src/assets/images/icon_received_dark_lg.svg';
import IconSend from 'src/assets/images/icon_send_lg.svg';
import IconSendDark from 'src/assets/images/icon_send_dark_lg.svg';
import Link from 'src/assets/images/link.svg';
import LinkDark from 'src/assets/images/link-white.svg';
import ArrowIconGrey from 'src/assets/images/icon_arrow_grey.svg';
import ArrowIconWhite from 'src/assets/images/icon_arrow_white.svg';
import Edit from 'src/assets/images/edit.svg';
import EditDark from 'src/assets/images/edit-white.svg';
import useBalance from 'src/hooks/useBalance';
import moment from 'moment';
import { LabelRefType, NetworkType } from 'src/services/wallets/enums';
import { Transaction } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import useLabelsNew from 'src/hooks/useLabelsNew';
import KeeperModal from 'src/components/KeeperModal';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { useDispatch } from 'react-redux';
import { addLabels, bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import { getLabelChanges } from '../UTXOManagement/components/LabelsEditor';
import { CommonActions, useNavigation } from '@react-navigation/native';
import BTC from 'src/assets/images/btc.svg';
import { useAppSelector } from 'src/store/hooks';
import WalletHeader from 'src/components/WalletHeader';

export function EditNoteContent({ existingNote, noteRef }: { existingNote: string; noteRef }) {
  const updateNote = useCallback((text) => {
    noteRef.current = text;
  }, []);

  return (
    <VStack style={styles.noteContainer}>
      <KeeperTextInput
        defaultValue={existingNote}
        onChangeText={updateNote}
        placeholder="Add transaction note"
        testID="tx_note"
      />
    </VStack>
  );
}

function TransactionDetails({ route }) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { transactions, common } = translations;
  const { transaction, wallet }: { transaction: Transaction; wallet: Wallet } = route.params;
  const { labels } = useLabelsNew({ txid: transaction.txid });
  const [visible, setVisible] = React.useState(false);
  const close = () => setVisible(false);
  const noteRef = useRef();
  const dispatch = useDispatch();
  const [updatingLabel, setUpdatingLabel] = React.useState(false);
  const { bitcoinNetworkType } = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (labels[transaction.txid][0] && noteRef.current) {
      if (labels[transaction.txid][0].name === noteRef.current) setUpdatingLabel(false);
    }
    if (!labels[transaction.txid][0] && !noteRef.current) setUpdatingLabel(false);
  }, [labels]);

  useEffect(() => {
    if (updatingLabel) {
      if (noteRef.current) {
        const finalLabels = [{ name: noteRef.current, isSystem: false }];
        if (labels[transaction.txid][0]?.name) {
          const labelChanges = getLabelChanges(labels[transaction.txid], finalLabels);
          dispatch(bulkUpdateLabels({ labelChanges, txId: transaction.txid, wallet }));
        } else {
          dispatch(
            addLabels({
              labels: finalLabels,
              txId: transaction.txid,
              wallet,
              type: LabelRefType.TXN,
            })
          );
        }
      } else {
        if (labels[transaction.txid][0]?.name) {
          const labelChanges = getLabelChanges(labels[transaction.txid], []);
          dispatch(bulkUpdateLabels({ labelChanges, txId: transaction.txid, wallet }));
        }
      }
    }
  }, [updatingLabel]);

  function InfoCard({
    title,
    describtion = '',
    width = 340,
    showIcon = false,
    letterSpacing = 1,
    numberOfLines = 1,
    Icon = null,
    Content = null,
  }) {
    return (
      <Box width={wp(width)} style={styles.infoCardContainer}>
        <Box style={[showIcon && { flexDirection: 'row', width: '100%', alignItems: 'center' }]}>
          <Box width={showIcon ? '92%' : '100%'}>
            <Box style={styles.titleWrapper}>
              <Text color={`${colorMode}.greenText`} style={styles.titleText} numberOfLines={1}>
                {title}
              </Text>
              {showIcon && Icon}
            </Box>
            {Content ? (
              <Content />
            ) : (
              <Text
                style={styles.descText}
                color={`${colorMode}.greenishGreyText`}
                width="85%"
                numberOfLines={numberOfLines}
              >
                {describtion}
              </Text>
            )}
          </Box>
        </Box>
        <Box style={styles.divider} backgroundColor={`${colorMode}.border`} />
      </Box>
    );
  }
  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${bitcoinNetworkType === NetworkType.TESTNET ? '/testnet4' : ''}/tx/${
        transaction.txid
      }`
    );
  };

  const MemoisedContent = React.useCallback(
    () => (
      <EditNoteContent existingNote={labels[transaction.txid][0]?.name || ''} noteRef={noteRef} />
    ),
    [transaction, labels]
  );
  return (
    <Box safeAreaTop backgroundColor={`${colorMode}.primaryBackground`} style={styles.wrapper}>
      <StatusBar
        barStyle={colorMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
      />
      <Box style={styles.topSection}>
        <WalletHeader
          title={transactions.TransactionDetails}
          subTitle={transactions.TransactionDetailsSubTitle}
        />
        <Box style={styles.transViewWrapper}>
          <Box style={styles.transViewIcon}>
            {transaction.transactionType === 'Received' ? (
              colorMode === 'dark' ? (
                <IconRecieveDark />
              ) : (
                <IconRecieve />
              )
            ) : colorMode === 'dark' ? (
              <IconSendDark />
            ) : (
              <IconSend />
            )}
            <Box style={styles.transView}>
              <Text color={`${colorMode}.GreyText`} numberOfLines={1} style={styles.transIDText}>
                {transaction.txid}
              </Text>
              <Text style={styles.transDateText} color={`${colorMode}.GreyText`}>
                {moment(transaction?.date).format('DD MMM YY  •  HH:mm A')}
              </Text>
            </Box>
          </Box>
          <Box flexDir={'row'} alignItems={'center'}>
            {!getSatUnit() && (
              <Text
                color={`${colorMode}.dateText`}
                style={[styles.unitText, { height: '100%', marginRight: wp(5), marginTop: hp(5) }]}
              >
                {getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
              </Text>
            )}
            <Text style={styles.amountText}>
              {`${getBalance(transaction.amount)} `}
              <Text color={`${colorMode}.dateText`} style={styles.unitText}>
                {getSatUnit()}
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>
      <Box style={styles.bottomSection} backgroundColor={`${colorMode}.boxSecondaryBackground`}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Box>
            <Box style={styles.infoCardsWrapper}>
              <TouchableOpacity testID="btn_transactionNote" onPress={() => setVisible(true)}>
                <InfoCard
                  title={common.note}
                  describtion={
                    labels[transaction.txid][0]?.name ||
                    common.addNote.charAt(0) + common.addNote.slice(1).toLowerCase()
                  }
                  showIcon
                  letterSpacing={2.4}
                  Icon={
                    updatingLabel ? (
                      <ActivityIndicator />
                    ) : colorMode === 'dark' ? (
                      <EditDark width={18} height={18} />
                    ) : (
                      <Edit width={18} height={18} />
                    )
                  }
                />
              </TouchableOpacity>
              <InfoCard
                title={transactions.confirmations}
                describtion={transaction.confirmations > 6 ? '6+' : transaction.confirmations}
                showIcon={false}
                letterSpacing={2.4}
              />
              <TouchableOpacity testID="btn_transactionId" onPress={redirectToBlockExplorer}>
                <InfoCard
                  title={transactions.transactionID}
                  describtion={transaction.txid}
                  showIcon
                  letterSpacing={2.4}
                  Icon={
                    colorMode === 'dark' ? (
                      <LinkDark width={18} height={18} />
                    ) : (
                      <Link width={18} height={18} />
                    )
                  }
                />
              </TouchableOpacity>
              <InfoCard
                title={transactions.Fees}
                describtion={`${transaction.fee} sats`}
                showIcon={false}
                letterSpacing={2.4}
              />
            </Box>
            <Pressable
              onPress={() => {
                navigation.dispatch(
                  CommonActions.navigate('TransactionAdvancedDetails', {
                    transaction: transaction,
                  })
                );
              }}
            >
              <Box style={styles.advancedDetails}>
                <Text medium color={`${colorMode}.greenText`}>
                  {transactions.advancedDetails}
                </Text>
                {colorMode === 'dark' ? <ArrowIconWhite /> : <ArrowIconGrey />}
              </Box>
            </Pressable>
          </Box>
          <KeeperModal
            visible={visible}
            modalBackground={`${colorMode}.modalWhiteBackground`}
            textColor={`${colorMode}.textGreen`}
            subTitleColor={`${colorMode}.modalSubtitleBlack`}
            close={close}
            title={common.addNote}
            subTitle={transactions.updateLabelSubTitle}
            buttonText={common.save}
            justifyContent="center"
            Content={MemoisedContent}
            buttonCallback={() => {
              setUpdatingLabel(true);
              close();
            }}
          />
        </ScrollView>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topSection: {
    paddingTop: hp(17),
    paddingHorizontal: 20,
  },
  bottomSection: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingTop: hp(10),
  },
  Container: {
    flex: 1,
    padding: 20,
  },
  transViewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(30),
    width: wp(320),
    justifyContent: 'space-between',
    paddingBottom: hp(25),
    paddingLeft: wp(12.5),
  },
  transView: {
    marginLeft: wp(10),
    width: wp(120),
  },
  transViewIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCardContainer: {
    justifyContent: 'center',
    paddingLeft: wp(15),
    paddingHorizontal: 3,
    paddingBottom: hp(10),
  },
  infoCardsWrapper: {
    alignItems: 'center',
    marginTop: hp(20),
    justifyContent: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 15,
    width: '100%',
  },
  descText: {
    marginTop: hp(5),
    fontSize: 14,
  },
  transDateText: {
    fontSize: 12,
  },
  transIDText: {
    fontSize: 14,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '400',
  },
  unitText: {
    fontSize: 15,
    fontWeight: '400',
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginBottom: 20,
    flexDirection: 'row',
  },
  noteContainer: {
    width: windowWidth * 0.8,
  },
  divider: {
    marginTop: hp(15),
    height: 1,
    width: windowWidth * 0.835,
  },
  advancedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: hp(20),
    paddingLeft: wp(32),
    paddingRight: wp(27),
  },
});
export default TransactionDetails;
