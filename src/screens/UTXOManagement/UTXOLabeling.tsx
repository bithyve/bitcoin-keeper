import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { FlatList, Box, Text, Input } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import useLabels from 'src/hooks/useLabels';
import { UTXO } from 'src/core/wallets/interfaces';
import { LabelType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import EditIcon from 'src/assets/images/edit.svg';

function LabelRenderItem({ item, index, onEditClick, onCloseClick }: any) {
  return (
    <Box style={styles.itemWrapper}>
      <Box style={{ flex: 1 }}>
        <Text>{item.name}</Text>
      </Box>
      {item.type === LabelType.USER && (
        <Box style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            onPress={() => onEditClick(item, index)}
            style={{
              width: hp(24),
              height: hp(24),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box>
              <EditIcon />
            </Box>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onCloseClick(index)}
            style={{
              width: hp(24),
              height: hp(24),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box>
              <Text style={styles.addnewText}>X</Text>
            </Box>
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
}

function UTXOLabeling() {
  const navigation = useNavigation();
  const {
    params: { utxo, wallet },
  } = useRoute() as { params: { utxo: UTXO; wallet: any } };
  const [label, setLabel] = useState('');
  const { labels } = useLabels({ utxos: [utxo], wallet });
  const [existingLabels, setExistingLabels] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);

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
    setExistingLabels(existingLabels);
    setLabel('');
    setEditingIndex(-1);
  };

  const onSaveChangeClick = () => {
    const finalLabels = existingLabels.filter(
      (label) => !(label.type === LabelType.SYSTEM && label.name === wallet.presentationData.name) // ignore the wallet label since they are internal references
    );
    dispatch(bulkUpdateLabels({ labels: finalLabels, UTXO: utxo }));
    navigation.goBack();
  };
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Modify UTXO Labels"
        subtitle="Modify your labels of this UTXO"
        onPressHandler={() => navigation.goBack()}
      />
      <FlatList
        style={{ marginTop: 20 }}
        data={existingLabels}
        renderItem={({ item, index }) => (
          <LabelRenderItem
            item={item}
            index={index}
            onEditClick={onEditClick}
            onCloseClick={onCloseClick}
          />
        )}
        keyExtractor={(item) => `${item}`}
        showsVerticalScrollIndicator={false}
      />
      <Input
        onChangeText={(text) => {
          setLabel(text);
        }}
        style={styles.inputLabelBox}
        width={wp(300)}
        height={hp(40)}
        placeholderTextColor="#2F2F2F"
        placeholder="Enter label Word"
        color="#000000"
        backgroundColor="light.primaryBackground"
        value={label}
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={onAdd}
      />
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons primaryCallback={onSaveChangeClick} primaryText="Save Changes" />
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
  addnewText: {
    fontSize: 16,
    fontWeight: '400',
  },
  plusText: {
    fontSize: 18,
    color: 'white',
  },
  inputLabelBox: {
    borderRadius: 10,
    borderWidth: 0,
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default UTXOLabeling;
