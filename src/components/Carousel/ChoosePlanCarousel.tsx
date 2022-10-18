import React, { useContext, useRef, useState } from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import Carousel from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList, Dimensions, Pressable } from 'react-native';
import CustomYellowButton from '../CustomButton/CustomYellowButton';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const ChoosePlanCarousel = (props) => {

  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  const [currentPosition, setCurrentPosition] = useState(subscription.level);
  const carasualRef = useRef<Carousel<FlatList>>(null);

  console.log('subscription', subscription.level);

  const _onSnapToItem = (index) => {
    setCurrentPosition(index);
    props.onChange(index);
  };

  const getBtnTitle = (item) => {
    if (item.productId === SubscriptionTier.PLEB) {
      return 'Downgrade';
    }
    if (
      item.name.split(' ')[0] === SubscriptionTier.HODLER &&
      subscription.name === SubscriptionTier.DIAMOND_HANDS
    ) {
      return 'Downgrade';
    }
    return 'Upgrade';
  };

  const _renderItem = ({ item, index }) => {
    return (
      <Pressable onPress={() => setCurrentPosition(index)}>
        <LinearGradient
          colors={currentPosition == index ? ['#00836A', '#073E39'] : ['#848484', '#848484']}
          style={{
            borderRadius: 20,
            marginHorizontal: wp(3),
            width: wp(currentPosition == index ? 115 : 100),
            height: hp(currentPosition == index ? 260 : 200),
            position: 'relative'
          }}
        >
          <Box py={5} alignItems={'center'} justifyContent={'center'}>
            {subscription.productId === item.productId && (
              <Box bg={'light.white'} borderRadius={10} px={2}>
                <Text
                  fontSize={RFValue(8)}
                  letterSpacing={0.64}
                  fontWeight={300}
                >
                  Current
                </Text>
              </Box>
            )}
            <Box my={15}>{currentPosition == index ? item.iconFocused : item.icon}</Box>
            <Text
              fontSize={RFValue(13)}
              fontWeight={'300'}
              color={'light.textLight'}
              mt={2}
              fontFamily={'body'}
              letterSpacing={0.48}
            >
              {item.name}
            </Text>
            <Text
              fontSize={RFValue(10)}
              color={'light.textLight'}
              mb={2}
              fontWeight={'200'}
              letterSpacing={0.5}
            >
              {item.subTitle}
            </Text>
            {currentPosition == index && subscription.productId !== item.productId ? (
              <Box style={{
                marginTop: hp(30)
              }} >
                <CustomYellowButton onPress={() => props.onPress(item, index)} value={getBtnTitle(item)} />
              </Box>
            ) : null}
          </Box>
        </LinearGradient>
      </Pressable>
    );
  };
  return (
    <Box style={{
      marginTop: hp(40),
    }}>
      {/* <Carousel
        onSnapToItem={_onSnapToItem}
        ref={carasualRef}
        data={props.data}
        renderItem={_renderItem}
        sliderWidth={Dimensions.get('screen').width}
        itemWidth={150}
        layout={'default'}
      /> */}
      <FlatList
        data={props.data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={_renderItem}
        keyExtractor={item => item.productId}
        scrollEnabled={false}
      />
    </Box>
  );
};
export default ChoosePlanCarousel;
