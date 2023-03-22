import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import HeaderTitle from 'src/components/HeaderTitle';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { Box, Text, Input, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Buttons from 'src/components/Buttons';
import { hp, windowWidth, wp } from 'src/common/data/responsiveness/responsive';
import useLabels from 'src/hooks/useLabels';
import { UTXO } from 'src/core/wallets/interfaces';
import { LabelType } from 'src/core/wallets/enums';
import { useDispatch } from 'react-redux';
import { bulkUpdateLabels } from 'src/store/sagaActions/utxos';
import EditIcon from 'src/assets/images/edit.svg';
import LinkIcon from 'src/assets/images/link.svg';
import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import { getAmt, getCurrencyImageByRegion, getUnit } from 'src/common/constants/Bitcoin';
import BtcBlack from 'src/assets/images/btc_black.svg';
import useExchangeRates from 'src/hooks/useExchangeRates';

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
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const exchangeRates = useExchangeRates();
  const { satsEnabled } = useAppSelector((state) => state.settings);
  const { colorMode } = useColorMode();

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
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginTop: 38,
          // backgroundColor: 'red',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: '#00715B',
              marginEnd: 5,
              fontFamily: Fonts.RobotoCondensedRegular,
            }}
          >
            Transaction ID
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                color: '#4F5955',
                fontSize: 12,
                fontFamily: Fonts.RobotoCondensedRegular,
                marginEnd: 5,
                letterSpacing: 2.4,
                width: '50%'
              }}
              numberOfLines={1}
            >
              {utxo.txId}
            </Text>
            <Box style={{margin: 5}}>
              <LinkIcon />
            </Box>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              color: '#00715B',
              marginStart: 5,
              fontFamily: Fonts.RobotoCondensedRegular,
            }}
          >
            UTXO Value
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {/* <Box style={{ marginTop: 5, marginLeft:5 }}>
              {getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}
            </Box>

            <Text
              style={{
                color: '#4F5955',
                fontSize: 12,
                marginStart: 5,
                fontFamily: Fonts.RobotoCondensedRegular,
              }}
            >
              0.00015
            </Text> */}
            <Box style={{ marginTop: 5, marginLeft:5 }}>{getCurrencyImageByRegion(currencyCode, 'dark', currentCurrency, BtcBlack)}</Box>
          <Text style={{
                color: '#4F5955',
                fontSize: 12,
                marginStart: 5,
                fontFamily: Fonts.RobotoCondensedRegular,
              }} numberOfLines={1}>
            {getAmt(utxo.value, exchangeRates, currencyCode, currentCurrency, satsEnabled)}
            <Text color={`${colorMode}.dateText`} style={styles.unitText}>
              {getUnit(currentCurrency, satsEnabled)}
            </Text>
          </Text>
          </View>
        </View>
      </View>
      <View
        style={{
          marginTop: 18,
          marginHorizontal: 5,
          paddingHorizontal: 15,
          paddingVertical: 12,
          backgroundColor: '#FDF7F0',
          borderRadius: 10
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={{
              flex: 1,
              color: '#00715B',
              fontSize: 14,
              fontFamily: Fonts.RobotoCondensedRegular,
            }}
          >
            Labels
          </Text>
          <Box>
            <EditIcon />
          </Box>
        </View>
        <View style={{ flexWrap: 'wrap', marginBottom: 20, flexDirection: 'row' }}>
          {existingLabels.map((item, index) => (
            <View
              key={`${item}`}
              style={{
                borderRadius: 5,
                backgroundColor: item.type === LabelType.SYSTEM ? '#23A289' : '#E0B486',
                paddingHorizontal: 5,
                paddingVertical: 3,
                flexDirection: 'row',
                marginTop: 15,
                alignItems: 'center',
                marginEnd: 10,
              }}
            >
              <TouchableOpacity
                activeOpacity={item.type === LabelType.USER ? 0.5 : 1}
                onPress={() => (item.type === LabelType.USER ? onEditClick(item, index) : null)}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 11,
                    fontFamily: Fonts.RobotoCondensedRegular,
                  }}
                >
                  {item.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
              {item.type === LabelType.USER ? (
                <TouchableOpacity
                  onPress={() => onCloseClick(index)}
                  style={{
                    width: hp(24),
                    height: hp(15),
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.addnewText}>X</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
        {/* <FlatList
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
      /> */}
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
          value={label.toUpperCase()}
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onAdd}
        />
      </View>
      <View style={{ flex: 1 }} />
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
    fontSize: 15,
    fontFamily: Fonts.RobotoCondensedBold,
    color: Colors.White,
    paddingHorizontal: 8,
    marginTop: -2
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
  headerBTCIcon: {
    // marginRight: 3,
    // marginBottom: -hp(10),
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
});

export default UTXOLabeling;
