import React, { useRef } from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import Carousel from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList, Dimensions } from 'react-native';
import CustomYellowButton from '../CustomButton/CustomYellowButton';

const planData = [
  {
    id: 1,
    title: 'Basic',
    subTitle: 'Lorem ipsum dolor sit amet,',
    amount: '0',
    upgrade: false,
  },
  {
    id: 2,
    title: 'Pro',
    subTitle: 'Lorem ipsum',
    amount: '5',
    upgrade: true,
  },
  {
    id: 3,
    title: 'Elite',
    subTitle: 'Lorem ipsum dolor sit amet,',
    amount: '10',
    upgrade: false,
  },
];

const ChoosePlanCarousel = () => {
  const carasualRef = useRef<Carousel<FlatList>>(null);
  const _onSnapToItem = (index) => {
    // console.log('index', index);
    // carasualRef.snapCallback(index, planData);
    // carasualRef.onSnapToItem(index, planData);
  };
  const _renderItem = ({ item }) => {
    return (
      <LinearGradient
        colors={['#00836A', '#073E39']}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 20,
        }}
      >
        <Box py={3} alignItems={'center'} justifyContent={'center'}>
          <Box
            h={20}
            w={20}
            borderRadius={40}
            bg={'light.lightBlack'}
            borderColor={'light.borderColor'}
            borderWidth={0.5}
            my={15}
          ></Box>
          <Text
            fontSize={RFValue(13)}
            fontWeight={'300'}
            color={'light.textLight'}
            mt={2}
            fontFamily={'body'}
          >
            {item.title}
          </Text>
          <Text fontSize={RFValue(10)} color={'light.textLight'} mb={2} fontFamily={'body'}>
            {item.subTitle}
          </Text>
          <Text fontSize={RFValue(24)} color={'light.textLight'} fontFamily={'body'}>
            $ {item.amount}
          </Text>
          <Text fontSize={RFValue(10)} color={'light.textLight'} fontFamily={'body'}>
            / month
          </Text>
          {item.upgrade ? (
            <Box mt={5}>
              <CustomYellowButton value={'Upgrade'} />
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
        data={planData}
        renderItem={_renderItem}
        sliderWidth={Dimensions.get('screen').width}
        itemWidth={Dimensions.get('screen').width - 150}
        layout={'default'}
      />
    </Box>
  );
};
export default ChoosePlanCarousel;
