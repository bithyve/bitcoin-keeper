import React from 'react';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { View, Text } from 'native-base'
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { FlatList, TouchableOpacity } from 'react-native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import AccordionsComponent from 'src/components/AccordionsComponent';
import HardWare from 'src/assets/Images/svgs/hardware.svg';
import BackButton from 'src/assets/Images/svgs/back.svg';

const AddWalletScreen = () => {
  const Data = [
    {
      id: 1,
      heading: 'Hexa Wallets',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [
        {
          title: 'Single-sig Wallet',
          description: 'Lorem ipsum dolor sit amet, consectetur',
          icon: HardWare,
        },
      ],
    },
    {
      id: 2,
      heading: 'Import a Wallet',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [],
    },
    {
      id: 3,
      heading: 'Add a Vault',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscin',
      items: [],
    },
  ];
  const renderItem = ({ item }) => <AccordionsComponent item={item} />;

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <TouchableOpacity>
        <BackButton />
      </TouchableOpacity>
      <Text
        numberOfLines={1}
        style={styles.addWalletText}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'200'}
      >
        Add a Wallet
      </Text>
      <Text
        numberOfLines={1}
        style={styles.addWalletDescription}
        color={'light.lightBlack'}
        fontFamily={'body'}
        fontWeight={'100'}
      >
        Lorem ipsum dolor sit amet,
      </Text>
      <FlatList data={Data} renderItem={renderItem} keyExtractor={(item) => item.id} />

    </View>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
  },
  addWalletText: {
    fontSize: RFValue(22),
    lineHeight: '20@s',
    letterSpacing: '0.7@s',
    marginTop: hp(5),
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  }
});
export default AddWalletScreen;
