import React, { useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet, TouchableOpacity, View, ScrollView, Keyboard } from 'react-native';
import { Box, Input, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth } from 'src/constants/responsive';
import { UTXO } from 'src/services/wallets/interfaces';
import { NetworkType } from 'src/services/wallets/enums';
import { useDispatch } from 'react-redux';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import LinkIcon from 'src/assets/images/link.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import config from 'src/utils/service-utilities/config';
import Done from 'src/assets/images/selected.svg';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import useExchangeRates from 'src/hooks/useExchangeRates';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/constants/Bitcoin';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useLabelsNew from 'src/hooks/useLabelsNew';
import { resetState } from 'src/store/reducers/utxos';
import LabelItem from './components/LabelItem';

function UTXOLabeling() {
  const processDispatched = useRef(false);
  const navigation = useNavigation();
  const {
    params: { utxo, wallet },
  } = useRoute() as { params: { utxo: UTXO; wallet: any } };
  const [label, setLabel] = useState('');
  const { labels } = useLabelsNew({ utxos: [utxo], wallet });
  const [existingLabels, setExistingLabels] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const exchangeRates = useExchangeRates();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { colorMode } = useColorMode();
  const getSortedNames = (labels) =>
    labels
      .sort((a, b) =>
        a.isSystem < b.isSystem ? 1 : a.isSystem > b.isSystem ? -1 : a.name > b.name ? 1 : -1
      )
      .reduce((a, c) => {
        a += c.name;
        return a;
      }, '');
  const lablesUpdated =
    getSortedNames(labels[`${utxo.txId}:${utxo.vout}`]) !== getSortedNames(existingLabels);

  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const { syncingUTXOs, apiError } = useAppSelector((state) => state.utxos);

  useEffect(() => {
    setExistingLabels(labels ? labels[`${utxo.txId}:${utxo.vout}`] || [] : []);
    return () => {
      dispatch(resetState());
    };
  }, []);

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

  useEffect(() => {
    if (apiError) {
      showToast(apiError.toString(), <ToastErrorIcon />);
      processDispatched.current = false;
    }
    if (processDispatched.current && !syncingUTXOs) {
      processDispatched.current = false;
      navigation.goBack();
    }
  }, [apiError, syncingUTXOs]);

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

  const onSaveChangeClick = async () => {
    Keyboard.dismiss();
    const finalLabels = existingLabels.filter(
      (label) => !label.isSystem // ignore the system label since they are internal references
    );
    const initialLabels = labels[`${utxo.txId}:${utxo.vout}`].filter((label) => !label.isSystem);
    const labelChanges = getLabelChanges(initialLabels, finalLabels);
    processDispatched.current = true;
    dispatch(bulkUpdateLabels({ labelChanges, UTXO: utxo, wallet }));
  };

  const redirectToBlockExplorer = () => {
    openLink(
      `https://mempool.space${config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''}/tx/${
        utxo.txId
      }`
    );
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="UTXO Details"
        subtitle="Easily identify specific aspects of various UTXOs"
      />
      <ScrollView
        style={styles.scrollViewWrapper}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.subHeader} testID="view_utxosLabelSubHeader">
          <View style={{ flex: 1 }}>
            <Text style={styles.subHeaderTitle}>Transaction ID</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.subHeaderValue} numberOfLines={1}>
                {utxo.txId}
              </Text>
              <TouchableOpacity style={{ margin: 5 }} onPress={redirectToBlockExplorer}>
                <LinkIcon />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subHeaderTitle}>UTXO Value</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Box style={{ marginHorizontal: 5 }}>
                {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}
              </Box>
              <Text style={styles.subHeaderValue} numberOfLines={1}>
                {getAmt(utxo.value, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
                <Text color={`${colorMode}.dateText`} style={styles.unitText}>
                  {getUnit(currentCurrency, satsEnabled)}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <Box style={styles.listContainer} backgroundColor={`${colorMode}.seashellWhite`}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.listHeader}>Labels</Text>
          </View>
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
          <Box style={styles.inputLabeWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
            <Box style={styles.inputLabelBox}>
              <Input
                testID="input_utxoLabel"
                onChangeText={(text) => {
                  setLabel(text);
                }}
                style={styles.inputLabel}
                borderWidth={0}
                height={hp(40)}
                placeholder="Type to add label or Select to edit"
                color="#E0B486"
                value={label}
                autoCorrect={false}
                autoCapitalize="characters"
                backgroundColor={`${colorMode}.seashellWhite`}
              />
            </Box>
            <TouchableOpacity
              style={styles.addBtnWrapper}
              onPress={onAdd}
              testID="btn_addUtxoLabel"
            >
              <Done />
            </TouchableOpacity>
          </Box>
        </Box>
        <View style={{ flex: 1 }} />
      </ScrollView>
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons
            primaryLoading={syncingUTXOs}
            primaryDisable={!lablesUpdated}
            primaryCallback={onSaveChangeClick}
            primaryText="Save Changes"
            secondaryCallback={navigation.goBack}
            secondaryText="Cancel"
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollViewWrapper: {
    flex: 1,
  },
  itemWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FDF7F0',
    marginVertical: 5,
    borderRadius: 10,
    padding: 20,
  },
  ctaBtnWrapper: {
    marginBottom: hp(5),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addnewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(30),
    marginBottom: hp(10),
  },
  addNewIcon: {
    height: 25,
    width: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  plusText: {
    fontSize: 18,
    color: 'white',
  },
  inputLabeWrapper: {
    flexDirection: 'row',
    height: 50,
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    paddingLeft: 5,
  },
  inputLabelBox: {
    width: '88%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  addBtnWrapper: {
    width: '12%',
    alignItems: 'center',
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
  subHeader: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 38,
  },
  subHeaderTitle: {
    fontSize: 14,
    color: '#00715B',
    marginEnd: 5,
  },
  subHeaderValue: {
    color: '#4F5955',
    fontSize: 12,
    marginEnd: 5,
    letterSpacing: 2.4,
    width: '50%',
  },
  listHeader: {
    flex: 1,
    color: '#00715B',
    fontSize: 14,
  },
  listContainer: {
    marginTop: 18,
    marginHorizontal: 5,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginBottom: 20,
    flexDirection: 'row',
  },
});

export default UTXOLabeling;
