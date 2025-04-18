import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import useIsSmallDevices from 'src/hooks/useSmallDevices';
import Text from './KeeperText';

type FeatureCardProps = {
  cardName: string;

  icon?: Element;
  callback: () => void;
  customStyle?: ViewStyle;

  smallDeviceHeight?: number;
  smallDeviceWidth?: number;
};

function FeatureCard({
  cardName,
  icon,
  customStyle,
  callback,

  smallDeviceHeight = hp(84),
  smallDeviceWidth = wp(105),
}: FeatureCardProps) {
  const { colorMode } = useColorMode();
  const isSmallDevice = useIsSmallDevices();

  return (
    <TouchableOpacity testID={`btn_${cardName}`} activeOpacity={0.95} onPress={callback}>
      <Box
        style={[
          styles.cardContainer,
          { ...customStyle },
          { minHeight: isSmallDevice ? smallDeviceHeight : hp(84) },
          { minWidth: isSmallDevice ? smallDeviceWidth : wp(105) },
        ]}
        backgroundColor={`${colorMode}.seashellWhite`}
        borderColor={`${colorMode}.separator`}
        borderWidth={1}
      >
        <Box backgroundColor={`${colorMode}.DarkSlateGray`} style={styles.circle}>
          {icon && icon}
        </Box>
        <Text numberOfLines={1} medium style={styles.cardName} color={`${colorMode}.primaryText`}>
          {cardName}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: wp(105),
    minHeight: hp(83),
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

  cardName: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default FeatureCard;
