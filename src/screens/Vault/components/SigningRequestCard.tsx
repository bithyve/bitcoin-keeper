import { Box, useColorMode, View } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import Arrow from 'src/assets/images/digonal-arrow-white.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import BtcSignIcon from 'src/assets/images/btc-sign.svg';
import BtcDarkIcon from 'src/assets/images/btc-sign-white.svg';

function SigningRequestCard({ title, dateTime, amount, timeRemaining }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signingServer } = translations;

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
            <Text fontSize={14} medium style={styles.title}>
              {title}
            </Text>
            <Text fontSize={11} medium>
              {dateTime}
            </Text>
          </Box>
        </Box>
        {amount && (
          <Text style={styles.amount} fontSize={16}>
            {isDarkMode ? <BtcDarkIcon /> : <BtcSignIcon />} {amount}
          </Text>
        )}
      </Box>

      <View style={styles.divider} backgroundColor={`${colorMode}.textColor3`} />

      <Box style={styles.header}>
        <Text medium>{signingServer.timeUntilSigning}:</Text>
        {timeRemaining && <Text fontSize={13}>{timeRemaining} Remains</Text>}
      </Box>

      {/* <Box style={styles.btnContainer}>
        <Buttons
          primaryText={buttonText}
          primaryFontWeight="medium"
          fullWidth
          primaryBackgroundColor={`${colorMode}.brownColor`}
          primaryCallback={onCancel}
        />
      </Box> */}
    </Box>
  );
}

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
    marginVertical: hp(20),
    opacity: 0.1,
  },
  btnContainer: {
    marginTop: hp(20),
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(10),
  },
  title: {
    marginBottom: hp(5),
  },
});
