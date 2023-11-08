/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import Text from 'src/components/KeeperText';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Box, ScrollView, VStack, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import openLink from 'src/utils/OpenLink';
import IconRecieve from 'src/assets/images/icon_received_lg.svg';
import IconSend from 'src/assets/images/icon_send_lg.svg';
import Link from 'src/assets/images/link.svg';
import Edit from 'src/assets/images/edit.svg';
import useBalance from 'src/hooks/useBalance';
import moment from 'moment';
import config from 'src/core/config';
import { LabelRefType, LabelType, NetworkType } from 'src/core/wallets/enums';
import { Transaction } from 'src/core/wallets/interfaces';
import { Wallet } from 'src/core/wallets/interfaces/wallet';
import useLabelsNew from 'src/hooks/useLabelsNew';
import useTransactionLabels from 'src/hooks/useTransactionLabels';
import LabelItem from '../UTXOManagement/components/LabelItem';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperModal from 'src/components/KeeperModal';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { useDispatch } from 'react-redux';
import { addLabels, bulkUpdateLabels } from 'src/store/sagaActions/utxos';

function EditNoteContent({ existingNote, noteRef }: { existingNote: string; noteRef }) {
  const updateNote = useCallback((text) => {
    noteRef.current = text;
  }, []);

  return (
    <VStack style={styles.noteContainer}>
      <KeeperTextInput
        defaultValue={existingNote}
        onChangeText={updateNote}
        placeholder="Add transaction note"
        testID={'tx_note'}
      />
    </VStack>
  );
}

function TransactionDetails({ route }) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance } = useBalance();
  const { translations } = useContext(LocalizationContext);
  const { transactions } = translations;
  const { transaction, wallet }: { transaction: Transaction; wallet: Wallet } = route.params;
  const { labels } = useLabelsNew({ txid: transaction.txid, wallet });
  const { labels: txnLabels } = useTransactionLabels({ txid: transaction.txid, wallet });
  const [visible, setVisible] = React.useState(false);
  const close = () => setVisible(false);
  const noteRef = useRef();
  const dispatch = useDispatch();
  const [updatingLabel, setUpdatingLabel] = React.useState(false);

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
    width = 320,
    showIcon = false,
    letterSpacing = 1,
    numberOfLines = 1,
    Icon = null,
    Content = null,
  }) {
    return (
      <Box
        backgroundColor={`${colorMode}.seashellWhite`}
        width={wp(width)}
        style={styles.infoCardContainer}
      >
        <Box style={[showIcon && { flexDirection: 'row', width: '100%', alignItems: 'center' }]}>
          <Box width={showIcon ? '90%' : '100%'}>
            <Text color={`${colorMode}.headerText`} style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            {Content ? (
              <Content />
            ) : (
              <Text
                style={styles.descText}
                letterSpacing={letterSpacing}
                color={`${colorMode}.GreyText`}
                width={showIcon ? '60%' : '90%'}
                numberOfLines={numberOfLines}
              >
                {describtion}
              </Text>
            )}
          </Box>
          {showIcon && Icon}
        </Box>
      </Box>
    );
  }
  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''}/tx/${
        transaction.txid
      }`
    );
  };

  function getLabelChanges(existingLabels, updatedLabels) {
    const existingNames = new Set(existingLabels.map((label) => label.name));
    const updatedNames = new Set(updatedLabels.map((label) => label.name));

    const addedLabels = updatedLabels.filter((label) => !existingNames.has(label.name));
    const deletedLabels = existingLabels.filter((label) => !updatedNames.has(label.name));

    const labelChanges = {
      added: addedLabels,
      deleted: deletedLabels,
    };

    return labelChanges;
  }

  const MemoisedContent = React.useCallback(
    () => (
      <EditNoteContent existingNote={labels[transaction.txid][0]?.name || ''} noteRef={noteRef} />
    ),
    [transaction, labels]
  );
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={transactions.TransactionDetails}
        subtitle="Detailed information for this Transaction"
      />
      <Box style={styles.transViewWrapper}>
        <Box flexDirection="row">
          {transaction.transactionType === 'Received' ? <IconRecieve /> : <IconSend />}
          <Box style={styles.transView}>
            <Text color={`${colorMode}.headerText`} numberOfLines={1} style={styles.transIDText}>
              {transaction.txid}
            </Text>
            <Text style={styles.transDateText} color={`${colorMode}.dateText`}>
              {moment(transaction?.date).format('DD MMM YY  •  hh:mm A')}
            </Text>
          </Box>
        </Box>
        <Box>
          <Text style={styles.amountText}>
            {`${getBalance(transaction.amount)} `}
            <Text color="light.dateText" style={styles.unitText}>
              {getSatUnit()}
            </Text>
          </Text>
        </Box>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.infoCardsWrapper}>
          {txnLabels.length ? (
            <InfoCard
              title="Tags"
              Content={() => (
                <View style={styles.listSubContainer}>
                  {txnLabels.map((item, index) => (
                    <LabelItem
                      item={item}
                      index={index}
                      key={`${item.name}:${item.isSystem}`}
                      editable={false}
                    />
                  ))}
                </View>
              )}
              showIcon={false}
              letterSpacing={2.4}
            />
          ) : null}
          <InfoCard
            title="Confirmations"
            describtion={transaction.confirmations > 3 ? '3+' : transaction.confirmations}
            showIcon={false}
            letterSpacing={2.4}
          />
          <TouchableOpacity onPress={redirectToBlockExplorer}>
            <InfoCard
              title="Transaction ID"
              describtion={transaction.txid}
              showIcon
              letterSpacing={2.4}
              Icon={<Link />}
            />
          </TouchableOpacity>
          <InfoCard
            title="Fees"
            describtion={`${transaction.fee} sats`}
            showIcon={false}
            letterSpacing={2.4}
          />
          <InfoCard
            title="Inputs"
            describtion={transaction.senderAddresses.toString().replace(/,/g, '\n')}
            showIcon={false}
            numberOfLines={transaction.senderAddresses.length}
          />
          <InfoCard
            title="Outputs"
            describtion={transaction.recipientAddresses.toString().replace(/,/g, '\n')}
            showIcon={false}
            numberOfLines={transaction.recipientAddresses.length}
          />
          <TouchableOpacity onPress={() => setVisible(true)}>
            <InfoCard
              title="Note"
              describtion={labels[transaction.txid][0]?.name || 'Add a note'}
              showIcon
              letterSpacing={2.4}
              Icon={updatingLabel ? <ActivityIndicator /> : <Edit />}
            />
          </TouchableOpacity>
        </Box>
        <KeeperModal
          visible={visible}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          subTitleColor={`${colorMode}.secondaryText`}
          DarkCloseIcon={colorMode === 'dark'}
          close={close}
          title="Add a Note"
          subTitle="Optionally you can add a short note to the transactions"
          buttonText="Save"
          justifyContent="center"
          Content={MemoisedContent}
          buttonCallback={() => {
            setUpdatingLabel(true);
            close();
          }}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding: 20,
  },
  transViewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(40),
    width: wp(320),
    justifyContent: 'space-between',
    paddingBottom: hp(25),
  },
  transView: {
    marginLeft: wp(10),
    width: wp(120),
  },
  infoCardContainer: {
    marginVertical: hp(7),
    justifyContent: 'center',
    paddingLeft: wp(15),
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 10,
  },
  infoCardsWrapper: {
    alignItems: 'center',
    marginTop: hp(20),
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  titleText: {
    fontSize: 14,
    letterSpacing: 1.12,
    width: '90%',
  },
  descText: {
    fontSize: 12,
  },
  transDateText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  transIDText: {
    fontSize: 14,
  },
  amountText: {
    fontSize: 19,
    letterSpacing: 0.95,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginBottom: 20,
    flexDirection: 'row',
  },
  noteContainer: {
    width: windowWidth * 0.8,
  },
});
export default TransactionDetails;
