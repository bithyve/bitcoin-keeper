import { Box } from 'native-base';
import { FlatList, StyleSheet, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import ChoosePlanCarouselItem from './ChoosePlanCarouselItem';
import { useQuery } from '@realm/react';

const { width } = Dimensions.get('window');
const itemWidth = width / 3.5 - 10;
interface Props {
  data: SubScriptionPlan[];
  onPress?: any;
  onChange?: any;
  isMonthly: boolean;
  requesting: boolean;
  currentPosition: number;
}

function ChoosePlanCarousel(props: Props) {
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  const [currentPosition, setCurrentPosition] = useState(
    props.currentPosition !== 0 ? props.currentPosition : subscription.level - 1
  );

  const _onSnapToItem = (index) => {
    setCurrentPosition(index);
    props.onChange(index);
  };

  const getBtnTitle = (item: SubScriptionPlan) => {
    if (!item.isActive) {
      return 'Coming soon';
    }
    if (item.productIds.includes(SubscriptionTier.L1)) {
      return 'Select';
    }
    if (
      item.name.split(' ')[0] === SubscriptionTier.L2 &&
      subscription.name === SubscriptionTier.L3
    ) {
      return 'Select';
    }
    return 'Select';
  };

  return (
    <Box
      style={{
        marginTop: hp(20),
      }}
    >
      <FlatList
        data={props.data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        snapToStart
        renderItem={({ item, index }) => (
          <ChoosePlanCarouselItem
            isMonthly={props.isMonthly}
            item={item}
            currentPosition={currentPosition}
            index={index}
            subscription={subscription}
            onPress={() => _onSnapToItem(index)}
            onSelect={() => props.onPress(item, index)}
            itemWidth={itemWidth}
            requesting={props.requesting}
          />
        )}
      />
    </Box>
  );
}
const styles = StyleSheet.create({
  wrapperView: {
    borderRadius: 20,
    marginHorizontal: wp(4),
    position: 'relative',
  },
});
export default ChoosePlanCarousel;
