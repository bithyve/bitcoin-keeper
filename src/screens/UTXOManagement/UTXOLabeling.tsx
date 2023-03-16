/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { FlatList, Box, Text, Input } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import KeeperModal from 'src/components/KeeperModal';
import useLabels from 'src/hooks/useLabels';
import { UTXO } from 'src/core/wallets/interfaces';
import { LabelType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { addLabels } from 'src/store/sagaActions/utxos';
import EditIcon from 'src/assets/images/edit.svg';

function UTXOLabeling() {
  const navigation = useNavigation();
  const {
    params: { utxo, wallet },
  } = useRoute() as { params: { utxo: UTXO; wallet: any } };
  const [label, setLabel] = useState('');
  const [addLabelModal, setAddLabelModal] = useState(false);
  const { labels } = useLabels({ utxos: [utxo], wallet });
  const [existingLabels, setExistingLabels] = useState([]);
  const [labelTitle, setLabelTitle] = useState('Add New Label');
  const [labelButtonText, setLabelButtonText] = useState('Add');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const dispatch = useDispatch();

  useEffect(() => {
    setExistingLabels(labels ? labels[`${utxo.txId}${utxo.vout}`] || [] : []);
  }, [labels]);

  const onCloseClick = (index) => {
    existingLabels.splice(index, 1);
    setExistingLabels([...existingLabels]);
  };
  const onEditClick = (item, index) => {
    setAddLabelModal(true);
    setLabel(item.name);
    setLabelTitle('Update Label');
    setLabelButtonText('Update');
    setSelectedIndex(index);
  };
  const onAddLabelClick = () => {
    setAddLabelModal(true);
    setLabelTitle('Add New Label');
    setLabelButtonText('Add');
  };

  function labelRenderItem({ item, index }) {
    return (
      <Box style={styles.itemWrapper}>
        <Box style={{ flex: 1 }}>
          <Text>{item.name}</Text>
        </Box>
        {item.type === LabelType.USER && (
          <Box style={{flexDirection: 'row'}}>
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

  const closeLabelModal = () => {
    setAddLabelModal(false);
    setLabel('')
  };
  const onAddClick = () => {
    closeLabelModal();
    if (labelButtonText === 'Add') existingLabels.push({ name: label, type: LabelType.USER });
    else existingLabels[selectedIndex].name = label;
    setExistingLabels(existingLabels);
    setLabel('');
  };
  const AddLabelInput = useCallback(
    () => (
      <Box>
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
        />
      </Box>
    ),
    []
  );
  const onSaveChangeClick = () => {
    const names: string[] = [];
    existingLabels.map((item) => {
      if (item.type !== LabelType.SYSTEM) names.push(item.name);
    });
    dispatch(addLabels({ walletId: wallet?.id, names, UTXO: utxo }));
    navigation.goBack();
  };
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Modify UTXO Labels"
        subtitle="Lorem ipsum sit"
        onPressHandler={() => navigation.goBack()}
      />
      <TouchableOpacity style={styles.addnewWrapper} onPress={() => onAddLabelClick()}>
        <Box style={[styles.addNewIcon, { backgroundColor: 'rgba(7,62,57,1)' }]}>
          <Text style={styles.plusText}>+</Text>
        </Box>
        <Box>
          <Text style={styles.addnewText}>Add new label</Text>
        </Box>
      </TouchableOpacity>
      <FlatList
        style={{ marginTop: 20 }}
        data={existingLabels}
        renderItem={labelRenderItem}
        keyExtractor={(item) => `${item}`}
        // keyExtractor={(item) => `${item.txId}${item.vout}`}
        showsVerticalScrollIndicator={false}
      />
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons primaryCallback={onSaveChangeClick} primaryText="Save Changes" />
        </Box>
      </Box>
      <KeeperModal
        visible={addLabelModal}
        close={closeLabelModal}
        title={labelTitle}
        subTitle="Lorem ipsum sit"
        buttonText={labelButtonText}
        buttonTextColor="light.white"
        textColor="light.primaryText"
        Content={AddLabelInput}
        justifyContent="center"
        buttonCallback={onAddClick}
      />
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
    // justifyContent: 'space-between',
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
