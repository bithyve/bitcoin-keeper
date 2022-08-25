import React, { useRef, useState } from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import Carousel from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList, Dimensions } from 'react-native';
import CustomYellowButton from '../CustomButton/CustomYellowButton';

const ChoosePlanCarousel = (props) => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const carasualRef = useRef<Carousel<FlatList>>(null);

  const _onSnapToItem = (index) => {
    setCurrentPosition(index);
    props.onChange(index);
  };

  const _renderItem = ({ item, index }) => {
    return (
      <LinearGradient
        colors={currentPosition == index ? ['#00836A', '#073E39'] : ['#848484', '#848484']}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
          paddingVertical: 20,
        }}
      >
        <Box py={3} alignItems={'center'} justifyContent={'center'}>
          {item.activate && (
            <Box bg={'light.white'} borderRadius={10} px={2}>
              <Text fontSize={RFValue(8)}>Current</Text>
            </Box>
          )}
          <Box my={15}>{currentPosition == index ? item.iconFocused : item.icon}</Box>
          <Text
            fontSize={RFValue(13)}
            fontWeight={'300'}
            color={'light.textLight'}
            mt={2}
            fontFamily={'body'}
          >
            {item.name}
          </Text>
          <Text fontSize={RFValue(10)} color={'light.textLight'} mb={2} fontFamily={'body'}>
            {item.subTitle}
          </Text>
          <Text fontSize={RFValue(24)} color={'light.textLight'} fontFamily={'body'}>
            {item.productType === 'free' ? '0' : item.price}
          </Text>
          <Text fontSize={RFValue(10)} color={'light.textLight'} fontFamily={'body'}>
            / month
          </Text>
          {item.upgrade ? (
            <Box mt={10}>
              <CustomYellowButton onPress={props.onPress} value={'Upgrade'} />
            </Box>
          ) : null}
        </Box>
      </LinearGradient>
    );
  };
  return (
    <Box>
      <Carousel
        onSnapToItem={_onSnapToItem}
        ref={carasualRef}
        data={props.data}
        renderItem={_renderItem}
        sliderWidth={Dimensions.get('screen').width}
        itemWidth={150}
        layout={'default'}
      />
    </Box>
  );
};
export default ChoosePlanCarousel;
