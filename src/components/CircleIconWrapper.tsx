import { Box } from 'native-base';
import { Image, StyleSheet } from 'react-native';

type Props = {
  icon: Element;
  width?: number;
  backgroundColor?: string;
  image?: string;
};

function CircleIconWrapper({ icon, width = 50, backgroundColor, image = null }: Props) {
  return (
    <Box
      width={width}
      height={width}
      borderRadius={width / 2}
      backgroundColor={backgroundColor}
      style={styles.alignItems}
    >
      {image ? <Image src={image} style={styles.associatedContactImage} /> : icon}
    </Box>
  );
}

const styles = StyleSheet.create({
  alignItems: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  associatedContactImage: {
    width: '50%',
    height: '50%',
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default CircleIconWrapper;
