/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import Text from 'src/components/KeeperText';
import { ActivityIndicator, Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Box, Input, ScrollView, VStack, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
import config from 'src/utils/service-utilities/config';
import { LabelRefType, LabelType, NetworkType } from 'src/services/wallets/enums';
import { Transaction } from 'src/services/wallets/interfaces';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import useLabelsNew from 'src/hooks/useLabelsNew';
import useTransactionLabels from 'src/hooks/useTransactionLabels';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperModal from 'src/components/KeeperModal';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { useDispatch } from 'react-redux';
import { addLabels, bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import LabelItem from '../UTXOManagement/components/LabelItem';
import Buttons from 'src/components/Buttons';
import Done from 'src/assets/images/selected.svg';
import { resetState } from 'src/store/reducers/utxos';

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
        testID="tx_note"
      />
    </VStack>
  );
}

function TransactionDetails({ route }) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance } = useBalance();
  const { translations } = useContext(LocalizationContext);
  const { transactions, common } = translations;
  const { transaction, wallet }: { transaction: Transaction; wallet: Wallet } = route.params;
  const { labels } = useLabelsNew({ txid: transaction.txid, wallet });
  const { labels: txnLabels } = useTransactionLabels({ txid: transaction.txid, wallet });
  const [visible, setVisible] = React.useState(false);
  const close = () => setVisible(false);
  const noteRef = useRef();
  const dispatch = useDispatch();
  const [updatingLabel, setUpdatingLabel] = React.useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingLabels, setExistingLabels] = useState([]);

  function EditLabelsContent({ existingLabels, setExistingLabels }) {
    const { colorMode } = useColorMode();
    const [editingIndex, setEditingIndex] = useState(-1);
    const [label, setLabel] = useState('');

    const onCloseClick = (index) => {
      existingLabels.splice(index, 1);
      setExistingLabels([...existingLabels]);
    };

    const onEditClick = (item, index) => {
      setLabel(item.name);
      setEditingIndex(index);
    };

    const onAdd = () => {
      if (label) {
        if (editingIndex !== -1) {
          existingLabels[editingIndex] = { name: label, isSystem: false };
        } else {
          existingLabels.push({ name: label, isSystem: false });
        }
        setEditingIndex(-1);
        setExistingLabels(existingLabels);
        setLabel('');
      }
    };

    // const onSaveChangeClick = async () => {
    //   Keyboard.dismiss();
    //   const finalLabels = existingLabels.filter(
    //     (label) => !label.isSystem // ignore the system label since they are internal references
    //   );
    //   const initialLabels = labels[`${utxo.txId}:${utxo.vout}`].filter((label) => !label.isSystem);
    //   const labelChanges = getLabelChanges(initialLabels, finalLabels);
    //   processDispatched.current = true;
    //   dispatch(bulkUpdateLabels({ labelChanges, UTXO: utxo, wallet }));
    // };

    // const lablesUpdated =
    //   getSortedNames(labels[`${utxo.txId}:${utxo.vout}`]) !== getSortedNames(existingLabels);

    return (
      <Box>
        <Box style={styles.editLabelsContainer} backgroundColor={`${colorMode}.seashellWhite`}>
          <Box style={styles.editLabelsSubContainer}>
            {existingLabels.map((item, index) => (
              <LabelItem
                item={item}
                index={index}
                key={`${item.name}:${item.isSystem}`}
                editingIndex={editingIndex}
                onCloseClick={onCloseClick}
                onEditClick={onEditClick}
              />
            ))}
          </Box>
          <Box
            style={styles.editLabelsInputWrapper}
            backgroundColor={`${colorMode}.primaryBackground`}
          >
            <Box style={styles.editLabelsInputBox}>
              <Input
                testID="input_utxoLabel"
                onChangeText={(text) => {
                  setLabel(text);
                }}
                onSubmitEditing={onAdd}
                style={styles.editLabelsInput}
                variant={'unstyled'}
                placeholder="Type to add label or select to edit"
                value={label}
                autoCorrect={false}
                autoCapitalize="characters"
                backgroundColor={`${colorMode}.primaryBackground`}
              />
            </Box>
            <Box>
              <TouchableOpacity
                style={styles.addBtnWrapper}
                onPress={onAdd}
                testID="btn_addUtxoLabel"
              >
                <Done />
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
        <Box style={styles.ctaBtnWrapper}>
          <Box ml={windowWidth * -0.09}>
            <Buttons
              // primaryLoading={syncingUTXOs}
              // primaryDisable={!lablesUpdated}
              // primaryCallback={onSaveChangeClick}
              primaryText={common.saveChanges}
              secondaryCallback={() => setIsEditMode(false)}
              secondaryText={common.cancel}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  const getSortedNames = (labels) =>
    labels
      .sort((a, b) =>
        a.isSystem < b.isSystem ? 1 : a.isSystem > b.isSystem ? -1 : a.name > b.name ? 1 : -1
      )
      .reduce((a, c) => {
        a += c.name;
        return a;
      }, '');
  getSortedNames(existingLabels);

  useEffect(() => {
    if (labels[transaction.txid][0] && noteRef.current) {
      if (labels[transaction.txid][0].name === noteRef.current) setUpdatingLabel(false);
    }
    if (!labels[transaction.txid][0] && !noteRef.current) setUpdatingLabel(false);
  }, [labels]);

  useEffect(() => {
    setExistingLabels(labels ? txnLabels || [] : []);
    return () => {
      dispatch(resetState());
    };
  }, []);

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
        subtitle={transactions.TransactionDetailsSubTitle}
      />
      <Box style={styles.transViewWrapper}>
        <Box flexDirection="row">
          {transaction.transactionType === 'Received' ? <IconRecieve /> : <IconSend />}
          <Box style={styles.transView}>
            <Text color={`${colorMode}.headerText`} numberOfLines={1} style={styles.transIDText}>
              {transaction.txid}
            </Text>
            <Text style={styles.transDateText} color={`${colorMode}.dateText`}>
              {moment(transaction?.date).format('DD MMM YY  •  HH:mm A')}
            </Text>
          </Box>
        </Box>
        <Box>
          <Text style={styles.amountText}>
            {`${getBalance(transaction.amount)} `}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getSatUnit()}
            </Text>
          </Text>
        </Box>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.infoCardsWrapper}>
          <TouchableOpacity
            style={styles.listContainer}
            testID="btn_transactionNote"
            onPress={() => setIsEditMode(!isEditMode)}
          >
            <InfoCard
              title={'Labels'}
              Content={() => (
                <Box style={styles.listSubContainer}>
                  {existingLabels.map((item, index) => (
                    <LabelItem
                      item={item}
                      index={index}
                      key={`${item.name}:${item.isSystem}`}
                      editable={false}
                    />
                  ))}
                </Box>
              )}
              showIcon
              Icon={<Edit />}
            />
          </TouchableOpacity>
          <TouchableOpacity testID="btn_transactionNote" onPress={() => setVisible(true)}>
            <InfoCard
              title={common.note}
              describtion={labels[transaction.txid][0]?.name || 'Add a note'}
              showIcon
              letterSpacing={2.4}
              Icon={updatingLabel ? <ActivityIndicator /> : <Edit />}
            />
          </TouchableOpacity>
          <InfoCard
            title={transactions.confirmations}
            describtion={transaction.confirmations > 3 ? '3+' : transaction.confirmations}
            showIcon={false}
            letterSpacing={2.4}
          />
          <TouchableOpacity testID="btn_transactionId" onPress={redirectToBlockExplorer}>
            <InfoCard
              title={transactions.transactionID}
              describtion={transaction.txid}
              showIcon
              letterSpacing={2.4}
              Icon={<Link />}
            />
          </TouchableOpacity>
          <InfoCard
            title={transactions.Fees}
            describtion={`${transaction.fee} sats`}
            showIcon={false}
            letterSpacing={2.4}
          />
          <InfoCard
            title={transactions.inputs}
            describtion={transaction.senderAddresses.toString().replace(/,/g, '\n')}
            showIcon={false}
            numberOfLines={transaction.senderAddresses.length}
          />
          <InfoCard
            title={transactions.outputs}
            describtion={transaction.recipientAddresses.toString().replace(/,/g, '\n')}
            showIcon={false}
            numberOfLines={transaction.recipientAddresses.length}
          />
        </Box>
        <KeeperModal
          visible={visible}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          subTitleColor={`${colorMode}.secondaryText`}
          DarkCloseIcon={colorMode === 'dark'}
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
        <KeeperModal
          visible={isEditMode}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          subTitleColor={`${colorMode}.secondaryText`}
          DarkCloseIcon={colorMode === 'dark'}
          close={() => setIsEditMode(false)}
          showCloseIcon={false}
          title={'Edit Labels'}
          subTitle={'Easily identify and manage transactions'}
          justifyContent="center"
          Content={() => (
            <EditLabelsContent
              existingLabels={existingLabels}
              setExistingLabels={setExistingLabels}
            />
          )}
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
  editLabelsContainer: {
    margin: 0,
    width: '100%',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingBottom: 10,
    paddingTop: 0,
  },
  editLabelsSubContainer: {
    marginHorizontal: wp(5),
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  editLabelsInputWrapper: {
    flexDirection: 'row',
    alignSelf: 'center',
    width: '98%',
    alignItems: 'center',
    borderRadius: 10,
    padding: 5,
    marginTop: hp(30),
  },
  editLabelsInputBox: {
    width: '90%',
    paddingVertical: 8,
  },
  editLabelsInput: {
    fontSize: 13,
    fontWeight: '400',
  },
  ctaBtnWrapper: {
    marginBottom: hp(5),
    marginTop: hp(25),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addBtnWrapper: {
    width: '10%',
  },
  listContainer: {
    alignSelf: 'center',
    borderRadius: 10,
  },
});
export default TransactionDetails;
