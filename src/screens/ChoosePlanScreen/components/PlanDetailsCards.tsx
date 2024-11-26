import { Box, Flex, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import PlanCheckMark from 'src/assets/images/planCheckMark.svg';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const TitleCard = ({ plansData, currentPosition, restorePurchases, showRestore }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { choosePlan } = translations;
  return (
    <Flex
      backgroundColor={`${colorMode}.secondaryBackground`}
      borderColor={`${colorMode}.solidGreyBorder`}
      style={styles.titleContainer}
      minWidth={showRestore ? wp(195) : null}
    >
      <Text style={styles.titleText} color={`${colorMode}.primaryText`} bold>
        {plansData?.[currentPosition]?.name + ' Features'}
      </Text>
      {showRestore && (
        <Pressable onPress={restorePurchases} testID="btn_restorePurchases">
          <Text style={styles.restorePurchase} semiBold color={`${colorMode}.brownColor`}>
            {choosePlan.restorePurchases}
          </Text>
        </Pressable>
      )}
    </Flex>
  );
};

const PlanDetailsCards = ({ plansData, currentPosition, restorePurchases }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { choosePlan } = translations;
  const selectedPlan = plansData?.[currentPosition]?.name;
  const showRestore = selectedPlan?.toString()?.toLowerCase() !== SubscriptionTier.L1.toLowerCase();
  return (
    <Flex
      style={styles.container}
      backgroundColor={`${colorMode}.secondaryBackground`}
      borderColor={`${colorMode}.solidGreyBorder`}
    >
      <TitleCard
        plansData={plansData}
        currentPosition={currentPosition}
        restorePurchases={restorePurchases}
        showRestore={showRestore}
      />
      <Box marginTop={showRestore ? 57 : 39}>
        {plansData?.[currentPosition]?.benifits.map(
          (benifit) =>
            benifit !== '*Coming soon' && (
              <Box style={styles.benefitContainer} key={benifit}>
                <Box style={styles.iconContainer}>
                  <PlanCheckMark />
                </Box>
                <Text fontSize={14} color={`${colorMode}.secondaryText`}>
                  {`${benifit}`}
                </Text>
              </Box>
            )
        )}
      </Box>
      {showRestore && (
        <Text
          style={{ fontSize: 13, lineHeight: 17, marginTop: hp(25) }}
          color={`${colorMode}.noteText`}
        >
          {choosePlan.noteSubTitle}
        </Text>
      )}
    </Flex>
  );
};

export default PlanDetailsCards;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: wp(21),
    paddingBottom: hp(31),
  },
  benefitContainer: {
    flexDirection: 'row',
    gap: 10,
    width: wp(260),
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconContainer: {
    marginTop: 6,
  },
  titleContainer: {
    position: 'absolute',
    top: -19,
    left: 10,
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 12,
    zIndex: 1,
  },
  titleText: {
    fontSize: 13,
    lineHeight: 29,
  },
  restorePurchase: {
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 2,
    textDecorationLine: 'underline',
  },
});
