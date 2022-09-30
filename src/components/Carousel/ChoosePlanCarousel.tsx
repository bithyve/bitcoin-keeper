import React, { useContext, useRef, useState } from 'react';
import { Box, Text } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import Carousel from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList, Dimensions } from 'react-native';
import CustomYellowButton from '../CustomButton/CustomYellowButton';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';

const ChoosePlanCarousel = (props) => {
  const [currentPosition, setCurrentPosition] = useState(0);
  const carasualRef = useRef<Carousel<FlatList>>(null);
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

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
          {subscription.productId === item.productId && (
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
          {subscription.productId !== item.productId ? (
            <Box mt={10}>
              <CustomYellowButton onPress={() => props.onPress(item)} value={getBtnTitle(item)} />
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
