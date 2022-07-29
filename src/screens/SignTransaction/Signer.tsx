import React from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { View, StyleSheet } from 'react-native';

import Next from 'src/assets/images/svgs/icon_arrow.svg';

type Props = {
  Icon: Function;
  title: string;
  description: string;
};

const Signer = ({
  Icon = null,
  title = 'Name',
  description = 'Description',
}: Props) => {

  return (
    <Box m={5} >
      <Box flexDirection={'row'} borderRadius={10} justifyContent={'space-between'}>
        <Box flexDirection={'row'} >
          <View style={styles.inheritenceView}>
            <Icon />
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text
              color={'light.textBlack'}
              fontSize={RFValue(14)}
              fontWeight={200}
              fontFamily={'heading'}
              letterSpacing={1.12}
            >
              {title}
            </Text>
            <Text
              color={'light.GreyText'}
              fontSize={RFValue(12)}
              marginRight={10}
              fontFamily={'body'}
              letterSpacing={0.6}
            >
              {`Added on ${description}`}
            </Text>
          </View>
        </Box>
        <Box alignItems={'center'} justifyContent={'center'} >
          <Next />
        </Box>
      </Box>
    </Box>
  );
};

export default Signer;

const styles = StyleSheet.create({
  inheritenceView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    backgroundColor: '#E3E3E3',
    borderRadius: 30,
    marginRight: 20,
    alignSelf: 'center',
  }
})
