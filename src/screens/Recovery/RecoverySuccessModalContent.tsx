import React, { useContext } from 'react';
import { Box, HStack } from 'native-base';
import { useColorMode } from 'native-base';
import { hp, windowWidth, wp } from '../../constants/responsive';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import AsterisksIcon from 'src/assets/images/asterisks.svg';
import { StyleSheet } from 'react-native';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import Text from 'src/components/KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const RecoverySuccessModalContent = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { seed } = translations;

  return (
    <Box style={styles.container}>
      <Box style={styles.outerBox}>
        <Box style={styles.firstLayer} bg={`${colorMode}.seashellWhite`} shadow={2} />
        <Box style={styles.secondLayer} bg={`${colorMode}.seashellWhite`} shadow={2} />
        <Box style={styles.thirdLayer} bg={`${colorMode}.seashellWhite`} shadow={2}>
          <Box style={styles.pillsContainer}>
            <Box style={styles.pill} backgroundColor={`${colorMode}.SignleSigCardPillBackColor`} />
            <Box style={styles.pill} backgroundColor={`${colorMode}.pillPlaceholderBack`} />
          </Box>

          <HStack style={styles.hStack}>
            <Box mr={4}>
              <HexagonIcon
                width={wp(42.5)}
                height={hp(38)}
                icon={<WalletIcon />}
                backgroundColor={colorMode == 'dark' ? Colors.ForestGreenDark : Colors.pantoneGreen}
              />
            </Box>
            <AsterisksIcon />
          </HStack>
        </Box>
      </Box>
      <Text color={`${colorMode}.primaryText`} style={styles.text}>
        {seed.appRecoveredSuccessfulDesc}
      </Text>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
  },
  outerBox: {
    alignItems: 'center',
    marginBottom: hp(45),
  },
  firstLayer: {
    position: 'absolute',
    top: '16%',
    zIndex: 0,
    width: '90%',
    height: hp(85),
    borderRadius: 10,
  },
  secondLayer: {
    position: 'absolute',
    top: '8%',
    zIndex: 1,
    width: '95%',
    height: hp(85),
    borderRadius: 10,
  },
  thirdLayer: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: hp(85),
    borderRadius: 10,
    padding: 16,
  },
  hStack: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
  },
  pillsContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    width: wp(18),
    height: hp(11),
    borderRadius: 4,
    marginHorizontal: 4,
  },
  text: {
    width: windowWidth * 0.75,
    fontSize: 13,
    fontWeight: '400',
    marginBottom: hp(20),
  },
});

export default RecoverySuccessModalContent;
