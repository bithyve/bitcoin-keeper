import { Box } from 'native-base';
import { Image, StyleSheet, PixelRatio } from 'react-native';

type Props = {
  icon: React.ReactElement;
  width?: number;
  backgroundColor?: string;
  image?: string;
};

function CircleIconWrapper({ icon, width = 50, backgroundColor, image = null }: Props) {
  const scaledWidth = PixelRatio.roundToNearestPixel(width || 50);
  return (
    <Box
      backgroundColor={backgroundColor}
      style={[
        styles.alignItems,
        {
          width: scaledWidth,
          height: scaledWidth,
          borderRadius: scaledWidth / 2,
        },
      ]}
    >
      {image ? (
        <Image
          source={{ uri: image }}
          style={[
            styles.associatedContactImage,
            {
              width: scaledWidth * 0.5,
              height: scaledWidth * 0.5,
              borderRadius: scaledWidth * 0.25,
            },
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
