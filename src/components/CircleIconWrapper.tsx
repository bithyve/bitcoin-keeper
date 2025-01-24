import { Box } from 'native-base';
import { Image, StyleSheet, PixelRatio } from 'react-native';

type Props = {
  icon: Element;
  width?: number;
  backgroundColor?: string;
  image?: string;
};

function CircleIconWrapper({ icon, width = 50, backgroundColor, image = null }: Props) {
  const scaledWidth = PixelRatio.roundToNearestPixel(width);

  return (
    <Box
      width={scaledWidth}
      height={scaledWidth}
      borderRadius={scaledWidth / 2}
      backgroundColor={backgroundColor}
      style={styles.alignItems}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={[
            styles.associatedContactImage,
            { width: scaledWidth * 0.5, height: scaledWidth * 0.5, borderRadius: scaledWidth / 2 },
          ]}
        />
      ) : (
        icon
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  alignItems: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  associatedContactImage: {
    alignSelf: 'center',
    resizeMode: 'cover',
  },
});

export default CircleIconWrapper;
