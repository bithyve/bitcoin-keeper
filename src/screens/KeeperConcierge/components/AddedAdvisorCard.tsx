import { Box, Image, useColorMode } from 'native-base';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import CalendarLight from 'src/assets/images/calendar-light.svg';
import CalendarDark from 'src/assets/images/calendar-dark.svg';
import ArrowLight from 'src/assets/images/icon_arrow.svg';
import ArrowDark from 'src/assets/images/icon_arrow_white.svg';

const AddedAdvisorCard = ({ advisorData }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  return (
    <Pressable>
      <Box
        style={styles.container}
        backgroundColor={`${colorMode}.boxThirdBackground`}
        borderColor={`${colorMode}.dullGreyBorder`}
      >
        <Box style={styles.leftContainer}>
          <Image
            source={require('src/assets/images/person-placeholder-1.jpeg')}
            style={styles.profileImage}
            borderWidth={1}
            borderColor={`${colorMode}.pantoneGreen`}
          />

          <Text style={styles.text} color={`${colorMode}.primaryText`} medium numberOfLines={1}>
            {advisorData.name}
          </Text>
        </Box>
        <Box style={styles.rightContainer}>
          <Box style={styles.iconContainer} backgroundColor={`${colorMode}.pantoneGreen`}>
            {isDarkMode ? <CalendarDark /> : <CalendarLight />}
          </Box>
          {isDarkMode ? <ArrowDark /> : <ArrowLight />}
        </Box>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: wp(10),
    paddingRight: wp(16),
    paddingVertical: hp(9),
    borderWidth: 1,
    borderRadius: 10,
  },
  profileImage: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(34) / 2,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(12),
  },
  text: {
    width: wp(150),
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(17),
  },
  iconContainer: {
    width: wp(31),
    height: wp(31),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
});

export default AddedAdvisorCard;
