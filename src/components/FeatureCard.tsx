import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import Text from './KeeperText';

type FeatureCardProps = {
  cardName: string;
  description?: string;
  icon?: Element;
  callback: () => void;
  customStyle?: ViewStyle;
  dottedBorder?: boolean;
  cardPillText?: string;
  showDot?: boolean;
  smallDeviceHeight?: number;
  smallDeviceWidth?: number;
  disable?: boolean;
  cardPillColor?: string;
  circleColor?: string;
  pillTextColor?: string;
  customCardPill?: Element;
};

function FeatureCard({
  cardName,
  icon,
  description,
  customStyle,
  callback,
  dottedBorder = false,
  showDot = false,
  smallDeviceHeight = hp(100),
  smallDeviceWidth = wp(105),
  disable = false,
  circleColor,
}: FeatureCardProps) {
  const { colorMode } = useColorMode();
  const isSmallDevice = useIsSmallDevices();

  return (
    <TouchableOpacity
      testID={`btn_${cardName}`}
      activeOpacity={0.95}
      onPress={callback}
      disabled={disable}
    >
      <Box
        style={[
          styles.cardContainer,
          { ...customStyle },
          { minHeight: isSmallDevice ? smallDeviceHeight : hp(84) },
          { minWidth: isSmallDevice ? smallDeviceWidth : wp(105) },
        ]}
        backgroundColor={`${colorMode}.seashellWhite`}
      >
        <Box backgroundColor={circleColor || `${colorMode}.BrownNeedHelp`} style={styles.circle}>
          {dottedBorder && (
            <Box borderColor={`${colorMode}.choosePlanHome`} style={styles.dottedBorder} />
          )}
          {icon && icon}
          {showDot && <Box style={styles.redDot} />}
        </Box>
        <Text numberOfLines={2} medium style={styles.cardName} color={`${colorMode}.primaryText`}>
          {cardName}
        </Text>
        {description && (
          <Text fontSize={11} numberOfLines={2} color={`${colorMode}.secondaryText`}>
            {description}
          </Text>
        )}
        {disable && (
          <Box style={styles.disabledOverlay} backgroundColor={`${colorMode}.thirdBackground`} />
        )}
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: wp(104),
    height: hp(83),
    padding: hp(10),
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '4%',
    marginBottom: hp(10),
    marginLeft: 2,
    zIndex: 1,
  },
  dottedBorder: {
    position: 'absolute',
    width: '85%',
    height: '85%',
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  cardName: {
    fontSize: 13,
    lineHeight: 16,
  },
  cardPillContainer: {
    maxWidth: wp(100),
    alignSelf: 'flex-end',
    zIndex: 1,
  },
  dot: {
    height: 7,
    width: 7,
    borderRadius: 10,
    backgroundColor: 'tomato',
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 10 / 2,
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    right: 0,
    borderWidth: 1,
    borderColor: 'white',
  },
  disabledOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
    borderRadius: 10,
  },
});

export default FeatureCard;
