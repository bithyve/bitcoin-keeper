import React, { useMemo } from 'react';
import { Box, useColorMode, HStack } from 'native-base';
import { Pressable, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import Text from 'src/components/KeeperText';
import SubScription, { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import PlebIcon from 'src/assets/images/pleb_white.svg';
import HodlerIcon from 'src/assets/images/hodler.svg';
import DiamondIcon from 'src/assets/images/diamond_hands.svg';
import CustomYellowButton from '../CustomButton/CustomYellowButton';
import Colors from 'src/theme/Colors';
import PlanCheckMarkSelected from 'src/assets/images/planCheckMarkSelected.svg';

const styles = StyleSheet.create({
  wrapperView: {
    borderRadius: 10,
    marginHorizontal: wp(4),
    position: 'relative',
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Colors.GrayX11,
    height: 135,
  },

  circle: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 13,
    marginRight: 15,
  },
});

interface Props {
  item: SubScriptionPlan;
  onPress?: any;
  index: number;
  currentPosition: number;
  isMonthly: boolean;
  subscription: SubScription;
  onSelect?: any;
  itemWidth: number;
  requesting: boolean;
}

function ChoosePlanCarouselItem({
  index,
  onPress,
  isMonthly,
  currentPosition,
  item,
  subscription,
  onSelect,
  itemWidth,
  requesting,
}: Props) {
  const { colorMode } = useColorMode();
  const isSelected = currentPosition === index;
  const getFreeTrail = useMemo(() => {
    if (item.monthlyPlanDetails || item.yearlyPlanDetails) {
      if (isMonthly) return item.monthlyPlanDetails.trailPeriod;
      return item.yearlyPlanDetails.trailPeriod;
    }
    return '';
  }, [item]);

  const getAmt = useMemo(() => {
    try {
      if (item.productType === 'free') return 'Free';
      if (isMonthly) {
        return item.monthlyPlanDetails.price;
      }
      return item.yearlyPlanDetails.price;
    } catch (error) {
      return '';
    }
  }, [item, isMonthly]);

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
  }, [item, isMonthly]);

  const canSelectPlan = useMemo(() => {
    if (isSelected) {
      if (isMonthly) {
        return !item.monthlyPlanDetails?.productId.includes(subscription.productId.toLowerCase());
      }
      return !item.yearlyPlanDetails?.productId.includes(subscription.productId.toLowerCase());
    }
    return false;
  }, [item, isMonthly, currentPosition, index, subscription.productId]);

  return (
    <Pressable onPress={() => onPress(index)} testID="btn_selectPlan">
      {isSelected && (
        <Box position={'absolute'} top={13} right={17} zIndex={1}>
          <PlanCheckMarkSelected />
        </Box>
      )}
      <HStack
        backgroundColor={isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.choosePlanCard`}
        style={[styles.wrapperView, { width: wp(itemWidth) }]}
      >
        {/* Icon */}
        <Box>
          <Box
            backgroundColor={
              isSelected
                ? `${colorMode}.choosePlanIconBackSelected`
                : `${colorMode}.choosePlanIconBack`
            }
            style={styles.circle}
          >
            {item.name === 'Pleb' && <PlebIcon />}
            {item.name === 'Hodler' && <HodlerIcon />}
            {item.name === 'Diamond Hands' && <DiamondIcon />}
          </Box>
        </Box>
        {/* Details */}
        <Box>
          <Text
            fontSize={15}
            bold={true}
            color={isSelected ? `${colorMode}.white` : `${colorMode}.choosePlanInactiveText`}
          >
            {item.name}
          </Text>
          <Text
            fontSize={15}
            color={isSelected ? `${colorMode}.white` : `${colorMode}.choosePlanInactiveText`}
            mb={1.5}
          >
            {`(${item.subTitle})`}
          </Text>
          <Text
            fontSize={14}
            lineHeight={20}
            color={isSelected ? `${colorMode}.white` : `${colorMode}.pantoneGreen`}
          >
            {getAmt +
              (item.productType !== 'free' && item.isActive
                ? isMonthly
                  ? '/month'
                  : '/year'
                : '')}
          </Text>

          <Text
            bold={true}
            fontSize={14}
            color={isSelected ? `${colorMode}.white` : `${colorMode}.pantoneGreen`}
          >
            {getFreeTrail ? '- ' + getFreeTrail : ''}
          </Text>
        </Box>
      </HStack>
    </Pressable>
  );
}

export default ChoosePlanCarouselItem;
