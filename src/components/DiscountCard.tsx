import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { hp, wp } from 'src/constants/responsive';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Text from './KeeperText';
type DiscountCardProps = {
  card: any;

  handleSelectedOffer: any;
};

function DiscountCard({ card, handleSelectedOffer }: DiscountCardProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        handleSelectedOffer(card);
      }}
      style={styles.discountCardContainer}
      testID="btn_discountCard"
    >
      <HStack>
        <HStack style={styles.offerNameSection}>
          <Box>{card.icon}</Box>
        </HStack>
        <VStack style={[styles.offerSection, { backgroundColor: `rgba(111, 124, 119, 0.1)` }]}>
          <Box>
            <Text fontSize={14} bold color={`${colorMode}.GreenishGrey`}>
              {card.discount}% OFF
            </Text>
            <Text fontSize={11} color={`${colorMode}.GreenishGrey`}>
              {card.description}
            </Text>
          </Box>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
}

export default DiscountCard;

const styles = StyleSheet.create({
  discountCardContainer: {
    backgroundColor: 'rgba(253, 247, 240, 1)',
    height: hp(90),
    width: '80%',
    marginLeft: wp(30),
    borderRadius: 10,
  },
  offerSection: {
    width: '40%',
    height: hp(90),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  offerNameSection: {
    width: '60%',
    height: hp(90),
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    // borderRightWidth: 0.2,
    // borderRightColor: 'rgba(189, 183, 177, 1)',
    // marginRight: 2,
  },
});
