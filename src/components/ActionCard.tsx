import { Box, Pressable, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet } from 'react-native';

type ActionCardProps = {
  data: any;
};

function ActionCard({ data }: ActionCardProps) {
  const { colorMode } = useColorMode();
  const { name, icon, onPress } = data;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.cardContainer]}
      backgroundColor={`${colorMode}.seashellWhite`}
    >
      <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle}>
        {icon && icon}
      </Box>
      <Text color={`${colorMode}.primaryText`}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 114,
    height: 125,
    padding: 10,
    borderRadius: 10,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
});

export default ActionCard;
