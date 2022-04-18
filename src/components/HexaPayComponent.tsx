import React from 'react';

import { StyleSheet, View, Dimensions } from 'react-native';
import { Text } from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
const windowHeight = Dimensions.get('window').height;

type Props = {
  Icon: React.SFC<React.SVGProps<SVGSVGElement>>,
  title: string,
  subtitle: string,
  body: string
};

export const HexaPayComponent = ({ Icon, title, subtitle = '', body = '' }: Props) => {
  return (
    <View style={styles.container}>
      <View style={{ marginVertical: hp(2), marginLeft: wp(4) }}>
        <View style={styles.item}>
          <Icon />
        </View>
        <View style={styles.item}>
          <Text style={styles.text} color={'light.textBlack'} fontFamily="body" fontWeight={'200'}>
            {title}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.text1} color={'light.textBlack'} fontFamily="body" fontWeight={'100'}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.name} color={'light.lightBlack'} fontFamily="body" fontWeight={'200'}>
            {body}
          </Text>
        </View>
      </View>
      <Text></Text>
    </View>
  );
};

export default HexaPayComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FDF6F0',
    borderRadius: 10,
    height: hp(
      windowHeight >= 850
        ? '20%'
        : windowHeight >= 750
          ? '22%'
          : windowHeight >= 650
            ? '24%'
            : '24%'
    ),
    width: wp('80%'),
  },
  text: {
    fontSize: RFValue(14),
    letterSpacing: 0.28,
  },
  text1: {
    fontSize: RFValue(10),
    letterSpacing: 0.5,
  },
  name: {
    fontSize: RFValue(20),
    letterSpacing: 1,
  },
  item: {
    marginVertical: hp(0.5),
  },
});
