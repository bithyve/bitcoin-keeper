import { Box, useColorMode, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import Arrow from 'src/assets/images/digonal-arrow-white.svg';
import Buttons from 'src/components/Buttons';

const SigningRequestCard = ({ title, dateTime, amount, timeRemaining, buttonText, onCancel }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  return (
    <Box
      style={styles.cardContainer}
      backgroundColor={
        isDarkMode ? `${colorMode}.modalWhiteBackground` : `${colorMode}.ChampagneBliss`
      }
      borderColor={`${colorMode}.separator`}
      borderWidth={1}
    >
      <Box style={styles.header}>
        <Box style={styles.headerLeft}>
          <CircleIconWrapper
            icon={<Arrow />}
            width={wp(30)}
            backgroundColor={`${colorMode}.FlameOrange`}
          />
          <Box>
            <Text>{title}</Text>
            <Text>{dateTime}</Text>
          </Box>
        </Box>
        <Text>{amount}</Text>
      </Box>

      <View style={styles.divider} backgroundColor={`${colorMode}.textColor3`} />

      <Box style={styles.header}>
        <Text>Time until signing:</Text>
        <Text>{timeRemaining}</Text>
      </Box>

      <Box style={styles.btnContainer}>
        <Buttons
          primaryText={buttonText}
          primaryFontWeight="medium"
          fullWidth
          primaryBackgroundColor={`${colorMode}.brownColor`}
          primaryCallback={onCancel}
        />
      </Box>
    </Box>
  );
};

export default SigningRequestCard;

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: wp(20),
    paddingVertical: wp(25),
    borderRadius: wp(15),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
  divider: {
    height: 1,
    marginVertical: hp(15),
    opacity: 0.1,
  },
  btnContainer: {
    marginTop: hp(20),
  },
});
