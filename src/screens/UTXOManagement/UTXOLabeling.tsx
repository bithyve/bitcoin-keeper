import React, { useContext, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Box, Input, useColorMode } from 'native-base';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth } from 'src/common/data/responsiveness/responsive';
import useLabels from 'src/hooks/useLabels';
import { UTXO } from 'src/core/wallets/interfaces';
import { LabelType, NetworkType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import LinkIcon from 'src/assets/images/link.svg';
import DeleteCross from 'src/assets/images/deletelabel.svg';
import BtcBlack from 'src/assets/images/btc_black.svg';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import config from 'src/core/config';
import Done from 'src/assets/images/selected.svg';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import useExchangeRates from 'src/hooks/useExchangeRates';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import Relay from 'src/core/services/operations/Relay';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import useAsync from 'src/hooks/useAsync';

function UTXOLabeling() {
  const navigation = useNavigation();
  const {
    params: { utxo, wallet },
  } = useRoute() as { params: { utxo: UTXO; wallet: any } };
  const [label, setLabel] = useState('');
  const { labels } = useLabels({ utxos: [utxo], wallet });
  const [existingLabels, setExistingLabels] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const exchangeRates = useExchangeRates();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { colorMode } = useColorMode();
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const lablesUpdated =
    labels[`${utxo.txId}${utxo.vout}`].reduce((a, c) => {
      a += c.name;
      return a;
    }, '') !==
    existingLabels.reduce((a, c) => {
      a += c.name;
      return a;
    }, '');

  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const { inProgress, error, data, start } = useAsync();

  useEffect(() => {
    setExistingLabels(labels ? labels[`${utxo.txId}${utxo.vout}`] || [] : []);
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
        existingLabels[editingIndex] = { name: label, type: LabelType.USER };
      } else {
        existingLabels.push({ name: label, type: LabelType.USER });
      }
      setEditingIndex(-1);
      setExistingLabels(existingLabels);
      setLabel('');
    }
  };

  useEffect(() => {
    if (error) {
      showToast(error.toString(), <ToastErrorIcon />, 3000);
    }
    if (data) {
      navigation.goBack();
    }
  }, [data, error]);

  const onSaveChangeClick = async () => {
    await start(async () => {
      const finalLabels = existingLabels.filter(
        (label) => !(label.type === LabelType.SYSTEM && label.name === wallet.presentationData.name) // ignore the wallet label since they are internal references
      );
      const { updated } = await Relay.modifyUTXOinfo(
        keeper.id,
        { labels: finalLabels },
        `${utxo.txId}${utxo.vout}`
      );
      if (updated) dispatch(bulkUpdateLabels({ labels: finalLabels, UTXO: utxo }));
      return updated;
    });
  };

  const redirectToBlockExplorer = () => {
    openLink(
      `https://blockstream.info${
        config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${utxo.txId}`
    );
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="UTXO Details"
        subtitle="Easily identify specific aspects of various UTXOs"
      />
      <ScrollView
        style={styles.scrollViewWrapper}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps
      >
        <View style={styles.subHeader}>
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
        <View style={styles.listContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.listHeader}>Labels</Text>
          </View>
          <View style={styles.listSubContainer}>
            {existingLabels.map((item, index) => (
              <View
                key={`${item}`}
                style={[
                  styles.labelView,
                  {
                    backgroundColor:
                      item.type === LabelType.SYSTEM
                        ? '#23A289'
                        : editingIndex !== index
                        ? '#E0B486'
                        : '#A88763',
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.labelEditContainer}
                  activeOpacity={item.type === LabelType.USER ? 0.5 : 1}
                  onPress={() => (item.type === LabelType.USER ? onEditClick(item, index) : null)}
                >
                  <Text style={styles.itemText} bold>
                    {item.name.toUpperCase()}
                  </Text>
                  {item.type === LabelType.USER ? (
                    <TouchableOpacity onPress={() => onCloseClick(index)}>
                      <Box style={styles.deleteContainer}>
                        <DeleteCross />
                      </Box>
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <Box style={styles.inputLabeWrapper}>
            <Box style={styles.inputLabelBox}>
              <Input
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
              />
            </Box>
            <TouchableOpacity style={styles.addBtnWrapper} onPress={onAdd}>
              <Done />
            </TouchableOpacity>
          </Box>
        </View>
        <View style={{ flex: 1 }} />
      </ScrollView>
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons
            primaryLoading={inProgress}
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
    backgroundColor: '#F7F2EC',
  },
  inputLabelBox: {
    width: '90%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  addBtnWrapper: {
    width: '10%',
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
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
  },
  labelView: {
    borderRadius: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },
  listSubContainer: {
    flexWrap: 'wrap',
    marginBottom: 20,
    flexDirection: 'row',
  },
  labelEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  itemText: {
    color: '#fff',
    fontSize: 11,
  },
  deleteContainer: {
    paddingHorizontal: 4,
  },
});

export default UTXOLabeling;
