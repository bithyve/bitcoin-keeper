import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';

type ActionCardProps = {
  cardName: string;
  icon?: Element;
};

function ActionCard({ cardName, icon }: ActionCardProps) {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity style={[styles.cardContainer, { backgroundColor: `${colorMode}.Ivory` }]}>
      <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle}>
        {icon && icon}
      </Box>
      <Text color={`${colorMode}.primaryText`}>{cardName}</Text>
    </TouchableOpacity>
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
