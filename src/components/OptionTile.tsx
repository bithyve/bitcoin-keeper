import { Box, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import Text from './KeeperText';

type OptionTileProps = {
  title: string;
  icon?: Element;
  callback: () => void;
  customStyle?: ViewStyle;
};

function OptionTile({ title, icon, customStyle, callback }: OptionTileProps) {
  const { colorMode } = useColorMode();

  return (
    <TouchableOpacity onPress={callback}>
      <Box
        style={[styles.cardContainer, customStyle]}
        backgroundColor={`${colorMode}.seashellWhite`}
        borderColor={`${colorMode}.greyBorder`}
      >
        <Box style={styles.infoContainer}>
          {icon}
          <Text medium style={styles.cardName} color={`${colorMode}.primaryText`} numberOfLines={1}>
            {title}
          </Text>
        </Box>
        <RightArrowIcon />
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    height: hp(75),
    paddingLeft: wp(10),
    paddingRight: wp(24),
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardName: {
    width: wp(150),
    fontSize: 14,
    lineHeight: 24,
  },
});

export default OptionTile;
