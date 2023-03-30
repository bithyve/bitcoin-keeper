import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, HStack, Input, useColorMode, VStack } from 'native-base';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Buttons from 'src/components/Buttons';
import { hp } from 'src/common/data/responsiveness/responsive';
import useLabels from 'src/hooks/useLabels';
import { UTXO } from 'src/core/wallets/interfaces';
import { LabelType, NetworkType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import LinkIcon from 'src/assets/images/link.svg';
import DeleteCross from 'src/assets/images/deletelabel.svg';
import useBalance from 'src/hooks/useBalance';
import BtcBlack from 'src/assets/images/btc_black.svg';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import config from 'src/core/config';
import Done from 'src/assets/images/selected.svg';

function UTXOLabeling() {
  const navigation = useNavigation();
  const {
    params: { utxo, wallet },
  } = useRoute() as { params: { utxo: UTXO; wallet: any } };
  const [label, setLabel] = useState('');
  const { labels } = useLabels({ utxos: [utxo], wallet });
  const [existingLabels, setExistingLabels] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const { colorMode } = useColorMode();
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
    if (editingIndex !== -1) {
      existingLabels[editingIndex] = { name: label, type: LabelType.USER };
    } else {
      existingLabels.push({ name: label, type: LabelType.USER });
    }
    setEditingIndex(-1);
    setExistingLabels(existingLabels);
    setLabel('');
  };

  const onSaveChangeClick = () => {
    const finalLabels = existingLabels.filter(
      (label) => !(label.type === LabelType.SYSTEM && label.name === wallet.presentationData.name) // ignore the wallet label since they are internal references
    );
    dispatch(bulkUpdateLabels({ labels: finalLabels, UTXO: utxo }));
    navigation.goBack();
  };

  const redirectToBlockExplorer = () => {
    openLink(
      `https://blockstream.info${config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${utxo.txId}`
    );
  };

  return (
    <ScreenWrapper>
      <HeaderTitle
        title="UTXO Details"
        subtitle="Easily identify specific aspects of various UTXOs"
      />
      <Box flex={1}>
        <HStack style={{ padding: 20 }}>
          <VStack>
            <Text style={styles.subHeaderTitle}>Transaction ID</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.subHeaderValue} numberOfLines={1}>
                {utxo.txId}
              </Text>
              <TouchableOpacity style={{ margin: 5 }} onPress={redirectToBlockExplorer}>
                <LinkIcon />
              </TouchableOpacity>
            </View>
          </VStack>
          <View>
            <Text style={styles.subHeaderTitle}>UTXO Value</Text>
            <View style={{ flexDirection: 'row' }}>
              <Box style={{ marginTop: 5 }}>
                {getCurrencyIcon(BtcBlack, 'dark')}
              </Box>
              <Text style={styles.subHeaderValue} numberOfLines={1}>
                {getBalance(utxo.value)}
                <Text color={`${colorMode}.dateText`} style={styles.unitText}>
                  {getSatUnit()}
                </Text>
              </Text>
            </View>
          </View>
        </HStack>
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
                    {item.type === LabelType.USER ? (
                      <TouchableOpacity onPress={() => onCloseClick(index)}>
                        <Box style={styles.deleteContainer}>
                          <DeleteCross />
                        </Box>
                      </TouchableOpacity>
                    ) : null}
                  </Text>
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
      </Box>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.select({ ios: 8, android: 500 })}
        style={styles.ctaBtnWrapper}
      >
        <Buttons
          primaryDisable={!lablesUpdated}
          primaryCallback={onSaveChangeClick}
          primaryText="Save Changes"
          secondaryCallback={navigation.goBack}
          secondaryText="Cancel"
        />
      </KeyboardAvoidingView>
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
