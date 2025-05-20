import { Box, useColorMode } from 'native-base';
import { Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import Text from './KeeperText';
import ThemedColor from './ThemedColor/ThemedColor';

type OptionTileProps = {
  title: string;
  icon?: Element;
  callback: () => void;
  customStyle?: ViewStyle;
  image?: string;
};

function OptionTile({ title, icon, customStyle, callback, image }: OptionTileProps) {
  const { colorMode } = useColorMode();
  const image_containerBackground = ThemedColor({ name: 'image_containerBackground' });

  const ImageContainer = () => {
    return (
      <Box style={styles.associatedContactImageCtr} backgroundColor={image_containerBackground}>
        <Image src={image} style={styles.associatedContactImage} />
      </Box>
    );
  };

  return (
    <TouchableOpacity onPress={callback} testID={`btn_${title}`}>
      <Box
        style={[styles.cardContainer, customStyle]}
        backgroundColor={`${colorMode}.seashellWhite`}
        borderColor={`${colorMode}.greyBorder`}
      >
        <Box style={styles.infoContainer}>
          {image ? <ImageContainer /> : icon}
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
  associatedContactImage: {
    height: hp(21),
    width: wp(21),
    borderRadius: wp(12),
    padding: 10,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  associatedContactImageCtr: {
    height: hp(34),
    width: wp(34),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
});

export default OptionTile;
