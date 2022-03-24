import React from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { View, Text } from 'native-base'
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { ImageBackground, FlatList, TouchableOpacity } from 'react-native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import AccordionsComponent from '../components/AccordionsComponent';
import LeftArrow from '../assets/Images/svgs/down_arrow.svg';

const AddWalletScreen = () => {

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent padding={50} />
      <TouchableOpacity>
        <LeftArrow />
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.addWalletText} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'200'}>Add a Wallet</Text>
      <Text numberOfLines={1} style={styles.addWalletDescription} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'100'}>Lorem ipsum dolor sit amet,</Text>
      <AccordionsComponent/>

    </View >
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
    marginTop:hp(5)
  },
  addWalletDescription: {
    fontSize: RFValue(12),
    lineHeight: '15@s',
    letterSpacing: '0.5@s',
  }
});
export default AddWalletScreen;