import { Box } from 'native-base';
import { FlatList } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import { useQuery } from '@realm/react';
import ChoosePlanCarouselItem from './ChoosePlanCarouselItem';
import useIsSmallDevices from 'src/hooks/useSmallDevices';

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
  const listRef = useRef<FlatList>();

  const isSmallDevice = useIsSmallDevices();
  const itemWidth = isSmallDevice ? wp(233) : wp(210);

  const [currentPosition, setCurrentPosition] = useState(
    props.currentPosition !== 0 ? props.currentPosition : subscription.level - 1
  );

  useEffect(() => {
    setTimeout(() => {
      listRef?.current?.scrollToIndex({ animated: true, index: currentPosition });
    }, 200);
  }, []);

  const _onSnapToItem = (index) => {
    setCurrentPosition(index);
    props.onChange(index);
  };

  return (
    <Box
      style={{
        marginTop: hp(20),
      }}
    >
      <FlatList
        ref={listRef}
        onScrollToIndexFailed={(val) => console.log('onScrollToIndexFailed', val)}
        data={props.data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        snapToStart
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
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

export default ChoosePlanCarousel;
