import { Box, useColorMode } from 'native-base';
import { StyleSheet, ViewStyle } from 'react-native';
import Text from './KeeperText';

type CardPillProps = {
  heading: string;
  cardStyles?: ViewStyle;
};

function CardPill({ heading, cardStyles }: CardPillProps) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.LightKhaki`}
      style={[styles.pillContainer, cardStyles && cardStyles]}
    >
      <Text style={styles.heading} color={`${colorMode}.SlateGrey`} numberOfLines={1}>
        {heading}
      </Text>
    </Box>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    width: 51,
    height: 17,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 8,
  },
});

export default CardPill;
