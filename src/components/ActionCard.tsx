import { Box } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from 'src/theme/Colors';

type ActionCardProps = {
  cardName: string;
  icon?: Element;
};

function ActionCard({ cardName, icon }: ActionCardProps) {
  return (
    <TouchableOpacity style={styles.cardContainer}>
      <Box style={styles.circle}>{icon && icon}</Box>
      <Text>{cardName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 114,
    height: 125,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.Ivory,
  },
  circle: {
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
    backgroundColor: Colors.RussetBrown,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
});

export default ActionCard;
