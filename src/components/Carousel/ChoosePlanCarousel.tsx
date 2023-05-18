import { Box } from 'native-base';
import { FlatList, StyleSheet, Dimensions } from 'react-native';
import React, { useContext, useState, useMemo } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import { SubScriptionPlan } from 'src/common/data/models/interfaces/Subscription';
import ChoosePlanCarouselItem from './ChoosePlanCarouselItem';

const { width } = Dimensions.get('window')
const itemWidth = width / 3 - 10
interface Props {
  data: SubScriptionPlan[],
  onPress?: any,
  onChange?: any,
  isMonthly: boolean
}


function ChoosePlanCarousel(props: Props) {
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  const [currentPosition, setCurrentPosition] = useState(subscription.level - 1);

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
