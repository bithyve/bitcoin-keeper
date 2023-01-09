import { Box } from 'native-base';
import { FlatList, Pressable, StyleSheet, Platform } from 'react-native';
import React, { useContext, useState, useMemo } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { SvgUri } from 'react-native-svg';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import Text from 'src/components/KeeperText';
import config from 'src/core/config';
import { SubScriptionPlan } from 'src/common/data/models/interfaces/Subscription';
import CustomYellowButton from '../CustomButton/CustomYellowButton';

interface Props {
  data: SubScriptionPlan[],
  onPress?: any,
  onChange?: any,
}


function ChoosePlanCarousel(props: Props) {
  const { useQuery } = useContext(RealmWrapperContext);
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];

  const [currentPosition, setCurrentPosition] = useState(subscription.level);

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

  function renderItem({ item, index }) {

    function getAmt() {
      try {
        if (item.productType === 'free') return 'Free'
        if (Platform.OS === 'ios') {
          return item.planDetails.localizedPrice;
        }
        return item.planDetails.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[1]
          .formattedPrice;
      } catch (error) {
        return ''
      }
    }

    return (
      <Pressable onPress={() => _onSnapToItem(index)}>
        <Box
          backgroundColor={{
            linearGradient: {
              colors:
                currentPosition === index
                  ? ['light.gradientStart', 'light.gradientEnd']
                  : ['#848484', '#848484'],
              start: [0, 0],
              end: [1, 1],
            },
          }}
          style={[
            styles.wrapperView,
            {
              width: wp(currentPosition === index ? 115 : 100),
              height: hp(currentPosition === index ? 260 : 200),
            },
          ]}
        >
          <Box py={2} alignItems="center" justifyContent="center">
            {subscription.productId === item.productId && (
              <Box backgroundColor="light.white" borderRadius={10} px={2}>
                <Text fontSize={8} letterSpacing={0.64} bold>
                  Current
                </Text>
              </Box>
            )}
            <Box my={15}>{currentPosition === index ? <SvgUri uri={`${config.RELAY}${item.iconFocused}`} /> : <SvgUri uri={`${config.RELAY}${item.icon}`} />}</Box>
            <Text fontSize={13} bold color="light.white" mt={2}>
              {item.name}
            </Text>
            <Text fontSize={10} color="light.white" mb={2}>
              {item.subTitle}
            </Text>

            <Text fontSize={15} color="light.white">
              {getAmt()}
            </Text>
            <Text fontSize={10} color="light.white">
              {item.productType !== 'free' ? '/month' : ''}
            </Text>
            <Text bold fontSize={10} color="light.white" my={2}>
              {item.trailPeriod}
            </Text>
            {currentPosition === index && subscription.productId !== item.productId ? (
              <Box
                style={{
                  marginTop: hp(10),
                }}
              >
                <CustomYellowButton
                  onPress={() => props.onPress(item, index)}
                  value={getBtnTitle(item)}
                  disabled={!item.isActive}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
      </Pressable>
    );
  }
  return (
    <Box
      style={{
        marginTop: hp(40),
      }}
    >
      <FlatList
        data={props.data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item) => item.productId}
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
