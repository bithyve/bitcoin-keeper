import React, { useMemo } from 'react';
import { Box } from 'native-base';
import { Pressable, StyleSheet, } from 'react-native';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { SvgUri } from 'react-native-svg';
import { SubscriptionTier } from 'src/common/data/enums/SubscriptionTier';
import Text from 'src/components/KeeperText';
import config from 'src/core/config';
import SubScription, { SubScriptionPlan } from 'src/common/data/models/interfaces/Subscription';
import CustomYellowButton from '../CustomButton/CustomYellowButton';

const styles = StyleSheet.create({
  wrapperView: {
    borderRadius: 10,
    marginHorizontal: wp(4),
    position: 'relative',
    paddingBottom: 20
  },
});

interface Props {
  item: SubScriptionPlan,
  onPress?: any,
  index: number,
  currentPosition: number,
  isMonthly: boolean,
  subscription: SubScription,
  onSelect?: any,
  itemWidth: number,
  requesting: boolean
}

function ChoosePlanCarouselItem({ index, onPress, isMonthly, currentPosition, item, subscription, onSelect, itemWidth, requesting }: Props) {

  const getFreeTrail = useMemo(() => {
    if (item.monthlyPlanDetails || item.yearlyPlanDetails) {
      if (isMonthly) return item.monthlyPlanDetails.trailPeriod
      return item.yearlyPlanDetails.trailPeriod
    } return ''
  }, [item])

  const getAmt = useMemo(() => {
    try {
      if (item.productType === 'free') return 'Free'
      if (isMonthly) {
        return item.monthlyPlanDetails.price
      }
      return item.yearlyPlanDetails.price
    } catch (error) {
      return ''
    }
  }, [item, isMonthly])

  const getBtnTitle = useMemo(() => {
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
  }, [item, isMonthly])

  const canSelectPlan = useMemo(() => {
    if (currentPosition === index) {
      if (isMonthly) {
        return !item.monthlyPlanDetails?.productId.includes(subscription.productId.toLowerCase())
      }
      return !item.yearlyPlanDetails?.productId.includes(subscription.productId.toLowerCase())
    }
    return false
  }, [item, isMonthly, currentPosition, index, subscription.productId])

  return (
    <Pressable onPress={() => onPress(index)} testID='btn_selectPlan'>
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
            width: wp(itemWidth),
          },
        ]}
      >
        <Box py={2} alignItems="center" justifyContent="center">
          {item.productIds.includes(subscription.productId.toLowerCase()) ? (
            <Box alignSelf="flex-start" backgroundColor="light.white" borderRadius={10} mx={2} py={0.5} px={2}>
              <Text fontSize={8} letterSpacing={0.64} bold>
                Current
              </Text>
            </Box>
          ) : <Box alignSelf="flex-start" borderRadius={10} mx={2} py={0.5} px={2}>
            <Text fontSize={8} letterSpacing={0.64} bold />
          </Box>}
          {/* <Box my={15}>{currentPosition === index ? <SvgUri uri={`${config.RELAY}${item.iconFocused}`} /> : <SvgUri uri={`${config.RELAY}${item.icon}`} />}</Box> */}
          <Text fontSize={13} bold color="light.white" mt={2}>
            {item.name}
          </Text>
          <Text fontSize={10} color="light.white" mb={2}>
            {item.subTitle}
          </Text>
          <Text bold fontSize={10} color="light.white" my={2}>
            {getFreeTrail}
          </Text>
          <Text textAlign="center" fontSize={15} color="light.white">
            {getAmt}
          </Text>
          <Text fontSize={10} color="light.white">
            {(item.productType !== 'free' && item.isActive) ? isMonthly ? '/month' : '/year' : ''}
          </Text>
          {/* <Text bold fontSize={10} color="light.white" my={item.productIds.includes(subscription.productId.toLowerCase()) ? 0.5 : 2}>
            {getFreeTrail}
          </Text> */}
          {canSelectPlan === true ? (
            <Box
              style={{
                marginTop: hp(20),
              }}
            >
              <CustomYellowButton
                onPress={() => onSelect(item, index)}
                value={getBtnTitle}
                disabled={!item.isActive || requesting}
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Pressable>
  )
}

export default ChoosePlanCarouselItem

