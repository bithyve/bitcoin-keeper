import React, { useMemo } from 'react';
import { Box, useColorMode } from 'native-base';
import { Pressable, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import Text from 'src/components/KeeperText';
import SubScription, { SubScriptionPlan } from 'src/models/interfaces/Subscription';
import PlebIcon from 'src/assets/images/pleb_white.svg';
import HodlerIcon from 'src/assets/images/hodler.svg';
import DiamondIcon from 'src/assets/images/diamond_hands.svg';
import CustomYellowButton from '../CustomButton/CustomYellowButton';

const styles = StyleSheet.create({
  wrapperView: {
    borderRadius: 10,
    marginHorizontal: wp(4),
    position: 'relative',
    paddingBottom: 20,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
        return parseFloat(
          item.monthlyPlanDetails.price.slice(1, item.monthlyPlanDetails.price.length)
        ).toFixed(0);
      }
      return parseFloat(
        item.yearlyPlanDetails.price.slice(1, item.monthlyPlanDetails.price.length)
      ).toFixed(0);
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
      <Box
        backgroundColor={isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.choosePlanCard`}
        style={[
          styles.wrapperView,
          {
            width: wp(itemWidth),
            height: isSelected ? 260 : 230,
          },
        ]}
      >
        <Box py={2} alignItems="center" justifyContent="center">
          {item.productIds.includes(subscription.productId.toLowerCase()) ? (
            <Box
              alignSelf="flex-start"
              backgroundColor={`${colorMode}.primaryBackground`}
              borderRadius={10}
              mx={2}
              py={0.5}
              px={2}
            >
              <Text fontSize={8} letterSpacing={0.56} bold color={`${colorMode}.pantoneGreen`}>
                CURRENT
              </Text>
            </Box>
          ) : (
            <Box alignSelf="flex-start" borderRadius={10} mx={2} py={0.5} px={2}>
              <Text fontSize={8} letterSpacing={0.64} bold />
            </Box>
          )}
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
          <Text
            fontSize={12}
            bold={isSelected}
            medium={!isSelected}
            color={`${colorMode}.white`}
            mt={2}
          >
            {item.name}
          </Text>
          <Text fontSize={10} color={`${colorMode}.white`} mb={4}>
            {item.subTitle}
          </Text>
          <Text
            textAlign="center"
            bold={item.productType !== 'free'}
            fontSize={isSelected ? 26 : 22}
            lineHeight={isSelected ? 26 : 22}
            color={`${colorMode}.white`}
          >
            {getAmt}
          </Text>
          <Text fontSize={10} color={`${colorMode}.white`}>
            {item.productType !== 'free' && item.isActive ? (isMonthly ? '/month' : '/year') : ''}
          </Text>
          <Text bold fontSize={10} color={`${colorMode}.white`} my={2}>
            {getFreeTrail}
          </Text>
          {canSelectPlan === true &&
          !item.productIds.includes(subscription.productId.toLowerCase()) ? (
            <Box
              style={{
                marginTop: hp(10),
                marginBottom: hp(20),
              }}
            >
              <CustomYellowButton
                onPress={() => onSelect(item, index)}
                value={getBtnTitle}
                disabled={!item.isActive || requesting}
                titleColor={`${colorMode}.pantoneGreen`}
                backgroundColor={`${colorMode}.seashellWhite`}
                boldTitle
              />
            </Box>
          ) : null}
        </Box>
      </Box>
    </Pressable>
  );
}

export default ChoosePlanCarouselItem;
