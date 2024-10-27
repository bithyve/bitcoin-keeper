import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet, TouchableOpacity, View, ScrollView, Keyboard, Vibration } from 'react-native';
import { Box, Input, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import { UTXO } from 'src/services/wallets/interfaces';
import { LabelRefType, NetworkType } from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { addLabels, bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import TickIcon from 'src/assets/images/icon_tick.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import BtcWhite from 'src/assets/images/btc_white.svg';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import config from 'src/utils/service-utilities/config';
import ConfirmSquare from 'src/assets/images/confirm-square.svg';
import ConfirmSquareGreen from 'src/assets/images/confirm-square-green.svg';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import useExchangeRates from 'src/hooks/useExchangeRates';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/constants/Bitcoin';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { resetState, setSyncingUTXOError } from 'src/store/reducers/utxos';
import LabelItem from './components/LabelItem';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Link from 'src/assets/images/link.svg';
import LinkWhite from 'src/assets/images/link-white.svg';
import Edit from 'src/assets/images/edit.svg';
import EditWhite from 'src/assets/images/edit-white.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { EditNoteContent } from '../ViewTransactions/TransactionDetails';
import KeeperModal from 'src/components/KeeperModal';

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

export function LabelsEditor({ utxo = null, address = null, wallet, onLabelsSaved }) {
  const { labels } = useLabelsNew({ address, utxos: utxo ? [utxo] : [], wallet });
  const { syncingUTXOs, apiError } = useAppSelector((state) => state.utxos);
  const { showToast } = useToastMessage();
  const processDispatched = useRef(false);
  const dispatch = useDispatch();
  const labelsKey = address ? address : `${utxo.txId}:${utxo.vout}`;

  const getSortedNames = (labels) =>
    labels
      .sort((a, b) =>
        a.isSystem < b.isSystem ? 1 : a.isSystem > b.isSystem ? -1 : a.name > b.name ? 1 : -1
      )
      .reduce((a, c) => {
        a += c.name;
        return a;
      }, '');

  const [existingLabels, setExistingLabels] = useState([]);
  const [label, setLabel] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const { colorMode } = useColorMode();
  const lablesUpdated = getSortedNames(labels[labelsKey]) !== getSortedNames(existingLabels);

  useEffect(() => {
    setExistingLabels(labels ? labels[labelsKey] || [] : []);
    return () => {
      dispatch(resetState());
    };
  }, []);

  useEffect(() => {
    if (apiError) {
      showToast(apiError.toString(), <ToastErrorIcon />);
      dispatch(setSyncingUTXOError(null));
      processDispatched.current = false;
    }
    if (processDispatched.current && !syncingUTXOs) {
      processDispatched.current = false;

      onLabelsSaved();
    }
  }, [apiError, syncingUTXOs]);

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
      Vibration.vibrate(50);
      Keyboard.dismiss();
    }
  };

  const onSaveChangeClick = async () => {
    Keyboard.dismiss();
    const finalLabels = existingLabels.filter(
      (label) => !label.isSystem // ignore the system label since they are internal references
    );
    const initialLabels = labels[labelsKey].filter((label) => !label.isSystem);
    const labelChanges = getLabelChanges(initialLabels, finalLabels);
    processDispatched.current = true;
    if (address) {
      dispatch(bulkUpdateLabels({ labelChanges, address, wallet }));
    } else {
      dispatch(bulkUpdateLabels({ labelChanges, UTXO: utxo, wallet }));
    }
  };

  return (
    <Box>
      <Box
        style={[
          styles.listContainer,
          colorMode === 'dark' && { borderWidth: 1, borderColor: 'rgba(31, 31, 31, 0.2)' },
        ]}
        backgroundColor={`${colorMode}.boxBackground`}
      >
        <Box
          style={styles.inputLabeWrapper}
          backgroundColor={`${colorMode}.seashellWhite`}
          borderColor={`${colorMode}.borderBrown`}
        >
          <Box style={styles.inputLabelBox}>
            <Input
              testID="input_utxoLabel"
              onChangeText={(text) => {
                setLabel(text);
              }}
              style={styles.inputLabel}
              height={hp(38)}
              borderWidth={0}
              placeholder="+ Add Labels" // TODO: Move to translations
              value={label}
              autoCorrect={false}
              backgroundColor={`${colorMode}.seashellWhite`}
              _input={
                colorMode === 'dark' && {
                  selectionColor: Colors.SecondaryWhite,
                  cursorColor: Colors.SecondaryWhite,
                }
              }
            />
          </Box>
          <TouchableOpacity style={styles.addBtnWrapper} onPress={onAdd} testID="btn_addUtxoLabel">
            {label && label !== '' ? <ConfirmSquareGreen /> : <ConfirmSquare />}
          </TouchableOpacity>
        </Box>
        {existingLabels && existingLabels.length > 0 && (
          <View style={styles.listSubContainer}>
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
          </View>
        )}
      </Box>
      {lablesUpdated && (
        <Box style={styles.ctaBtnWrapper}>
          <Buttons
            primaryLoading={syncingUTXOs}
            primaryCallback={onSaveChangeClick}
            primaryText="Save Labels"
            fullWidth
          />
        </Box>
      )}
    </Box>
  );
}

function UTXOLabeling() {
  const { showToast } = useToastMessage();
  const navigation = useNavigation();

  const {
    params: { utxo, wallet },
  } = useRoute() as { params: { utxo: UTXO; wallet: any } };
  const { labels: txNoteLabels } = useLabelsNew({ txid: utxo.txId, wallet });

  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const exchangeRates = useExchangeRates();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const [txNoteModalVisible, setTxNoteModalVisible] = useState(false);
  const [updatingTxNote, setUpdatingTxNote] = useState(false);
  const noteRef = useRef();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { transactions: txTranslations, common } = translations;

  const dispatch = useDispatch();

  function InfoCard({
    title,
    description = '',
    descComponent = null,
    showIcon = false,
    numberOfLines = 1,
    Icon = null,
    Content = null,
    onIconPress = () => {},
  }) {
    return (
      <Box style={styles.infoCardContainer} borderBottomColor={`${colorMode}.separator`}>
        <Box style={[showIcon && { flexDirection: 'row', width: '100%', alignItems: 'center' }]}>
          <Box width={showIcon ? '90%' : '100%'}>
            <Text color={`${colorMode}.headerText`} style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            {Content ? (
              <Content />
            ) : descComponent ? (
              descComponent
            ) : (
              <Text
                style={[styles.descText, { width: showIcon ? '60%' : '90%' }]}
                color={`${colorMode}.GreyText`}
                numberOfLines={numberOfLines}
              >
                {description}
              </Text>
            )}
          </Box>
          {showIcon && (
            <TouchableOpacity style={{ padding: 10 }} onPress={onIconPress}>
              {Icon}
            </TouchableOpacity>
          )}
        </Box>
      </Box>
    );
  }

  useEffect(() => {
    if (txNoteLabels[utxo.txId][0] && noteRef.current) {
      if (txNoteLabels[utxo.txId][0].name === noteRef.current) setUpdatingTxNote(false);
    }
    if (!txNoteLabels[utxo.txId][0] && !noteRef.current) setUpdatingTxNote(false);
  }, [txNoteLabels]);

  useEffect(() => {
    if (updatingTxNote) {
      if (noteRef.current) {
        const finalLabels = [{ name: noteRef.current, isSystem: false }];
        if (txNoteLabels[utxo.txId][0]?.name) {
          const labelChanges = getLabelChanges(txNoteLabels[utxo.txId], finalLabels);
          dispatch(bulkUpdateLabels({ labelChanges, txId: utxo.txId, wallet }));
        } else {
          dispatch(
            addLabels({
              labels: finalLabels,
              txId: utxo.txId,
              wallet,
              type: LabelRefType.TXN,
            })
          );
        }
      } else {
        if (txNoteLabels[utxo.txId][0]?.name) {
          const labelChanges = getLabelChanges(txNoteLabels[utxo.txId], []);
          dispatch(bulkUpdateLabels({ labelChanges, txId: utxo.txId, wallet }));
        }
      }
    }
  }, [updatingTxNote]);

  const EditTxNoteContent = React.useCallback(
    () => (
      <EditNoteContent existingNote={txNoteLabels[utxo.txId][0]?.name || ''} noteRef={noteRef} />
    ),
    [utxo, txNoteLabels]
  );

  const redirectToBlockExplorer = (type: 'address' | 'tx') => {
    openLink(
      `https://mempool.space${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/${type}/${type == 'tx' ? utxo.txId : utxo.address}`
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="UTXO Details" // TODO: Move to translations
        subtitle="See your UTXO details and manage its labels" // TODO: Move to translations
      />
      <ScrollView
        style={styles.scrollViewWrapper}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <LabelsEditor
          utxo={utxo}
          wallet={wallet}
          onLabelsSaved={() => {
            showToast('Labels saved successfully', <TickIcon />);
            navigation.goBack();
          }}
        />
        <Box style={styles.detailsBox}>
          <Box>
            <InfoCard
              title="UTXO Value"
              descComponent={
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Box style={{ marginHorizontal: 5, marginBottom: hp(7) }}>
                    {getCurrencyImageByRegion(
                      currencyCode,
                      colorMode === 'light' ? 'green' : 'light',
                      currentCurrency,
                      colorMode === 'light' ? BtcBlack : BtcWhite
                    )}
                  </Box>
                  <Text
                    style={styles.subHeaderValue}
                    color={`${colorMode}.secondaryText`}
                    numberOfLines={1}
                  >
                    {getAmt(utxo.value, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                    <Box width={wp(2)}></Box>
                    <Text color={`${colorMode}.secondaryText`} style={styles.unitText}>
                      {getUnit(currentCurrency, satsEnabled)}
                    </Text>
                  </Text>
                </View>
              }
              showIcon={false}
            />
            <InfoCard
              title="Address"
              description={utxo.address}
              showIcon={true}
              Icon={colorMode === 'light' ? <Link /> : <LinkWhite />}
              onIconPress={() => redirectToBlockExplorer('address')}
            />
            <InfoCard
              title="Transaction Note"
              description={
                txNoteLabels[utxo.txId]?.[0]?.name ||
                common.addNote.charAt(0) + common.addNote.slice(1).toLowerCase()
              }
              showIcon={true}
              Icon={colorMode === 'light' ? <Edit /> : <EditWhite />}
              onIconPress={() => setTxNoteModalVisible(true)}
            />
            <InfoCard
              title="Transaction ID"
              description={utxo.txId}
              showIcon={true}
              Icon={colorMode === 'light' ? <Link /> : <LinkWhite />}
              onIconPress={() => redirectToBlockExplorer('tx')}
            />
          </Box>
        </Box>
      </ScrollView>
      <KeeperModal
        visible={txNoteModalVisible}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.primaryText`}
        subTitleColor={`${colorMode}.secondaryText`}
        close={() => setTxNoteModalVisible(false)}
        title={common.addNote}
        subTitle={txTranslations.updateLabelSubTitle}
        buttonText={common.save}
        justifyContent="center"
        Content={EditTxNoteContent}
        buttonCallback={() => {
          setUpdatingTxNote(true);
          setTxNoteModalVisible(false);
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollViewWrapper: {
    marginTop: hp(15),
    flex: 1,
  },
  ctaBtnWrapper: {
    marginTop: wp(20),
    marginHorizontal: wp(5),
  },
  inputLabeWrapper: {
    flexDirection: 'row',
    height: hp(40),
    width: '98%',
    alignItems: 'center',
    borderRadius: 10,
    paddingLeft: wp(5),
    borderWidth: 1,
  },
  inputLabelBox: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
  },
  addBtnWrapper: {
    width: wp(32),
    height: hp(32),
    alignItems: 'center',
    marginRight: 3,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: 13,
  },
  subHeader: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 38,
  },
  subHeaderTitle: {
    fontSize: 14,
    marginEnd: 5,
  },
  subHeaderValue: {
    fontSize: 14,
    marginEnd: 5,
    letterSpacing: 2,
    marginBottom: hp(7),
  },
  listHeader: {
    flex: 1,
    fontSize: 14,
  },
  listContainer: {
    marginTop: 18,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingTop: hp(26),
    paddingBottom: hp(21),
    borderRadius: 10,
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginTop: hp(15),
    marginBottom: hp(5),
    flexDirection: 'row',
  },
  detailsBox: {
    height: '100%',
    marginTop: hp(30),
    paddingHorizontal: wp(15),
  },
  infoCardContainer: {
    marginVertical: hp(7),
    justifyContent: 'center',
    paddingVertical: hp(5),
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: 14,
    letterSpacing: 1.12,
    width: '90%',
    marginBottom: hp(5),
  },
  descText: {
    fontSize: 12,
    marginBottom: hp(7),
  },
});

export default UTXOLabeling;
