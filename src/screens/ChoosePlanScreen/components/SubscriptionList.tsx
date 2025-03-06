import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import { hp, wp } from 'src/constants/responsive';
import { useSettingKeeper } from 'src/hooks/useSettingKeeper';
import ArrowRightGreen from 'src/assets/images/right-green-icon.svg';
import ArrowDownGreen from 'src/assets/images/down-green-icon.svg';
import ArrowDownWhite from 'src/assets/images/down-white-icon.svg';
import ArrowRightWhite from 'src/assets/images/right-white-icon.svg';
import Text from 'src/components/KeeperText';
import PlanDetailsCards from './PlanDetailsCards';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import Buttons from 'src/components/Buttons';
import Colors from 'src/theme/Colors';

const SubscriptionList: React.FC<{
  plans: any[];
  currentPosition: number;
  onChange?: any;
  primaryCallback?: any;
  isMonthly: boolean;
  getButtonText?: any;
  listFooterCta?: React.ReactNode;
}> = ({
  plans,
  currentPosition,
  onChange,
  primaryCallback,
  isMonthly,
  getButtonText,
  listFooterCta,
}) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { planData } = useSettingKeeper();
  const { subscription }: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [currentPositions, setCurrentPositions] = useState(
    currentPosition !== 0 ? currentPosition : subscription.level - 1
  );

  const _onSnapToItem = (index) => {
    setCurrentPositions(index);
    onChange(index);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      {planData.map((plan, index) => {
        const isExpanded = expandedIndex === index;
        const isActive = index === currentPositions;

        const matchedPlan = plans.find((p) => p.name.toLowerCase() === plan.title.toLowerCase());
        const isPleb = plan.title.toLowerCase() === 'pleb';

        const planDetails = isPleb
          ? 'Free'
          : isMonthly
          ? matchedPlan?.monthlyPlanDetails?.price
            ? matchedPlan.monthlyPlanDetails.price + '/'
            : ''
          : matchedPlan?.yearlyPlanDetails?.price
          ? matchedPlan.yearlyPlanDetails.price + '/'
          : '';

        const Trail = isMonthly
          ? matchedPlan?.monthlyPlanDetails?.trailPeriod
          : matchedPlan?.yearlyPlanDetails?.trailPeriod;

        const priceDisplay = (
          <Box style={styles.priceContainer}>
            <Text color={`${colorMode}.noteTextClosed`} style={styles.price}>
              {planDetails}{' '}
              {!isPleb && matchedPlan?.monthlyPlanDetails?.price && (
                <Text fontSize={12} color={`${colorMode}.noteTextClosed`}>
                  {isMonthly ? 'month' : 'yearly'}
                </Text>
              )}
            </Text>

            {!isPleb && matchedPlan?.monthlyPlanDetails?.trailPeriod && (
              <Box backgroundColor={`${colorMode}.brownColor`} style={styles.trialContainer}>
                <Text fontSize={10} color={Colors.ChampagneBliss}>
                  {Trail}
                </Text>
              </Box>
            )}
          </Box>
        );
        return (
          <TouchableOpacity
            onPress={() => {
              _onSnapToItem(index);
              toggleExpand(index);
            }}
            style={styles.touchable}
            key={index}
          >
            <Box
              key={index}
              borderColor={isActive ? `${colorMode}.darkBorderGreen` : 'transparent'}
              borderWidth={isActive ? 2 : 0}
              backgroundColor={`${colorMode}.textInputBackground`}
              style={styles.card}
            >
              <View style={styles.header}>
                <Box style={styles.titleContainer}>
                  {isDarkMode ? plan.subDarkIcon : plan.sublightIcon}
                  <Box style={styles.textContainer}>
                    <Box style={styles.titleBox}>
                      <Text color={`${colorMode}.textGreenGrey`} style={styles.title}>
                        {plan.title}
                      </Text>
                      <Text color={`${colorMode}.textGreenGrey`} style={styles.level}>
                        ({plan.subtitle})
                      </Text>
                    </Box>
                    <Text color={`${colorMode}.subPlansubtitle`} style={styles.description}>
                      {plan.subDescription}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <CircleIconWrapper
                    icon={
                      isExpanded ? (
                        isDarkMode ? (
                          <ArrowDownWhite />
                        ) : (
                          <ArrowDownGreen />
                        )
                      ) : isDarkMode ? (
                        <ArrowRightWhite />
                      ) : (
                        <ArrowRightGreen />
                      )
                    }
                    backgroundColor={`${colorMode}.solidGreyBorder`}
                    width={wp(18)}
                  />
                </Box>
              </View>
              <Box style={styles.divider} backgroundColor={`${colorMode}.brownColor`}>
                {' '}
              </Box>
              {isExpanded && (
                <>
                  <PlanDetailsCards plansData={plans} currentPosition={currentPosition} />
                  <Box style={styles.divider} backgroundColor={`${colorMode}.brownColor`}>
                    {' '}
                  </Box>
                </>
              )}

              {priceDisplay}

              {isExpanded && (
                <Box style={styles.btmCTR}>
                  <Buttons
                    primaryCallback={primaryCallback}
                    primaryText={getButtonText().text}
                    fullWidth
                    primaryDisable={getButtonText().disabled}
                  />
                </Box>
              )}
            </Box>
          </TouchableOpacity>
        );
      })}
      {listFooterCta}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trialContainer: {
    width: 78,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },

  touchable: {
    width: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
  },
  textContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  titleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  level: {
    fontSize: 14,
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  divider: {
    height: 1,
    marginTop: hp(20),
    marginBottom: hp(10),
    opacity: 0.2,
  },
  price: {
    paddingTop: hp(10),
    fontSize: 22,
    fontWeight: '700',
  },
  btmCTR: {
    marginTop: 15,
    marginBottom: 10,
  },
});

export default SubscriptionList;
