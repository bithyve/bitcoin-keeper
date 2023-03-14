/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
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

const labelRenderItem = ({ item }) => (
  <Box style={styles.itemWrapper}>
    <Box>
      <Text>{item.name}</Text>
    </Box>
    <Box>
      <Text>X</Text>
    </Box>
  </Box>
);

function UTXOLabeling() {
  const navigation = useNavigation();
  const {
    params: { utxo },
  } = useRoute() as { params: { utxo: UTXO } };
  const [label, setLabel] = useState('');
  const [addLabelModal, setAddLabelModal] = useState(false);
  const { labels } = useLabels({ utxos: [utxo] });
  const closeLabelModal = () => {
    setAddLabelModal(false);
  };
  function AddLabelInput() {
    return (
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
    );
  }
  return (
    <ScreenWrapper>
      <HeaderTitle
        title="Modify UTXO Labels"
        subtitle="Lorem ipsum sit"
        onPressHandler={() => navigation.goBack()}
      />
      <TouchableOpacity style={styles.addnewWrapper} onPress={() => setAddLabelModal(true)}>
        <Box style={[styles.addNewIcon, { backgroundColor: 'rgba(7,62,57,1)' }]}>
          <Text style={styles.plusText}>+</Text>
        </Box>
        <Box>
          <Text style={styles.addnewText}>Add new label</Text>
        </Box>
      </TouchableOpacity>
      <FlatList
        style={{ marginTop: 20 }}
        data={labels ? labels[`${utxo.txId}${utxo.vout}`] || [] : []}
        renderItem={labelRenderItem}
        keyExtractor={(item) => `${item.txId}${item.vout}`}
        showsVerticalScrollIndicator={false}
      />
      <Box style={styles.ctaBtnWrapper}>
        <Box ml={windowWidth * -0.09}>
          <Buttons primaryText="Save Changes" />
        </Box>
      </Box>
      <KeeperModal
        visible={addLabelModal}
        close={closeLabelModal}
        title="Add New Label"
        subTitle="Lorem ipsum sit"
        buttonText="Add"
        buttonTextColor="light.white"
        textColor="light.primaryText"
        Content={AddLabelInput}
        justifyContent="center"
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
    justifyContent: 'space-between',
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
