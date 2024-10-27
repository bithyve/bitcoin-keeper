import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import Text from './KeeperText';
import CardPill from './CardPill';

type ActionCardProps = {
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
};

function ActionCard({
  cardName,
  icon,
  description,
  customStyle,
  callback,
  dottedBorder = false,
  cardPillText = '',
  showDot = false,
  smallDeviceHeight = hp(110),
  smallDeviceWidth = wp(110),
}: ActionCardProps) {
  const { colorMode } = useColorMode();
  const isSmallDevice = useIsSmallDevices();
  return (
    <TouchableOpacity testID={`btn_${cardName}`} activeOpacity={0.95} onPress={callback}>
      <Box
        style={[
          styles.cardContainer,
          { ...customStyle },
          { minHeight: isSmallDevice ? smallDeviceHeight : hp(114) },
          { minWidth: isSmallDevice ? smallDeviceWidth : wp(104) },
        ]}
        backgroundColor={`${colorMode}.seashellWhite`}
      >
        {cardPillText && (
          <Box style={styles.cardPillContainer}>
            <CardPill heading={cardPillText} backgroundColor={`${colorMode}.btcLabelBack`} />
          </Box>
        )}
        <Box backgroundColor={`${colorMode}.BrownNeedHelp`} style={styles.circle}>
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
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: wp(104),
    height: hp(114),
    paddingVertical: hp(10),
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 10,
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
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.12,
  },
  cardPillContainer: {
    maxWidth: wp(100),
    alignSelf: 'flex-end',
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
});

export default ActionCard;
