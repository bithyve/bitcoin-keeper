import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';

type ActionCardProps = {
  cardName: string;
  description?: string;
  icon?: Element;
  callback: () => void;
  customStyle?: ViewStyle;
  dottedBorder?: boolean;
};

function ActionCard({
  cardName,
  icon,
  description,
  customStyle,
  callback,
  dottedBorder = false,
}: ActionCardProps) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity onPress={callback}>
      <Box
        style={[styles.cardContainer, { ...customStyle }]}
        backgroundColor={`${colorMode}.seashellWhite`}
      >
        <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle}>
          {dottedBorder && (
            <Box borderColor={`${colorMode}.PearlWhite`} style={styles.dottedBorder} />
          )}
          {icon && icon}
        </Box>
        <Text numberOfLines={2} style={styles.cardName} color={`${colorMode}.primaryText`}>
          {cardName}
        </Text>
        {description && (
          <Text fontSize={11} numberOfLines={2} color={`${colorMode}.GreenishGrey`}>
            {description}
          </Text>
        )}
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: wp(114),
    height: hp(125),
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
    marginTop: hp(25),
    marginBottom: hp(10),
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
    fontFamily: Fonts.FiraSansCondensedMedium,
    fontSize: 12,
  },
});

export default ActionCard;
