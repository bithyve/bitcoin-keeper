import React from 'react';
import { Box, HStack, VStack, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import TimerIcon from 'src/assets/images/timer-icon.svg';
import DashedLeft from 'src/assets/images/dashed-arrow-left.svg';
import DashedRight from 'src/assets/images/dashed-arrow-right.svg';
import DashedCenter from 'src/assets/images/dashed-arrow-center.svg';

const TimelineItem = ({ icon, title, description, phaseInfo, index, isLast }) => {
  const { colorMode } = useColorMode();

  const getArrowIcon = () => {
    if (isLast) {
      return <DashedCenter />;
    }
    return index % 2 === 0 ? <DashedLeft /> : <DashedRight />;
  };

  const getAlignment = () => {
    if (isLast) {
      return 'center';
    }
    return index % 2 === 0 ? 'flex-start' : 'flex-end';
  };

  const isLeftAligned = index % 2 === 0;

  return (
    <Box style={styles.mainContainer}>
      <Box
        style={styles.container}
        backgroundColor={`${colorMode}.primaryGreenBackground`}
        borderColor={`${colorMode}.greyBorderTransparent`}
      >
        <HStack style={styles.infoContainer}>
          {icon}
          <VStack flex={1} ml={4}>
            <Text style={styles.title} semiBold color={`${colorMode}.whiteText`}>
              {title}
            </Text>
            <Text style={styles.subtitle} color={`${colorMode}.whiteText`}>
              {description}
            </Text>
          </VStack>
        </HStack>
      </Box>
      <HStack
        style={styles.phaseContainer}
        justifyContent={getAlignment()}
        alignItems="center"
        mt={2}
      >
        {isLeftAligned ? (
          <>
            <Box
              style={[styles.durationPill, styles.leftPill]}
              borderColor={`${colorMode}.greyBorder`}
              backgroundColor={`${colorMode}.primaryGreenBackground`}
            >
              <TimerIcon />
              <Text color={`${colorMode}.whiteText`}>{phaseInfo.duration}</Text>
            </Box>
            <Box style={{ marginLeft: wp(80) }}>{getArrowIcon()}</Box>
            <Text style={styles.phaseLeft} medium color={`${colorMode}.limeText`}>
              {phaseInfo.phase}
            </Text>
          </>
        ) : !isLast ? (
          <>
            <Text style={styles.phaseRight} medium color={`${colorMode}.limeText`}>
              {phaseInfo.phase}
            </Text>
            <Box style={{ marginRight: wp(150) }}>{getArrowIcon()}</Box>
            <Box
              style={[styles.durationPill, styles.rightPill]}
              borderColor={`${colorMode}.greyBorder`}
              backgroundColor={`${colorMode}.primaryGreenBackground`}
            >
              <TimerIcon />
              <Text color={`${colorMode}.whiteText`}>{phaseInfo.duration}</Text>
            </Box>
          </>
        ) : (
          <>
            <Text style={styles.phaseCenter} medium color={`${colorMode}.limeText`}>
              {phaseInfo.phase}
            </Text>
            <Box style={{ marginRight: wp(150) }}>{getArrowIcon()}</Box>
            <Box
              style={[styles.durationPill, styles.centerPill]}
              borderColor={`${colorMode}.greyBorder`}
              backgroundColor={`${colorMode}.primaryGreenBackground`}
            >
              <TimerIcon />
              <Text color={`${colorMode}.whiteText`}>{phaseInfo.duration}</Text>
            </Box>
          </>
        )}
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
  },
  container: {
    width: '100%',
    paddingHorizontal: wp(20),
    paddingVertical: hp(20),
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: hp(4) },
    shadowOpacity: 0.15,
    elevation: 5,
  },
  infoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
  },
  durationPill: {
    position: 'absolute',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
    borderRadius: 30,
    gap: 5,
    zIndex: 1,
  },
  leftPill: {
    left: '10%',
  },
  rightPill: {
    right: '30%',
  },
  centerPill: {
    top: '102%',
  },
  phaseContainer: {
    position: 'relative',
    width: '100%',
  },
  phaseLeft: {
    marginLeft: wp(42),
  },
  phaseRight: {
    marginRight: wp(42),
  },
  phaseCenter: {
    marginLeft: wp(40),
  },
});

export default TimelineItem;
