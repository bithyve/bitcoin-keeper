import { Box } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import AddCardIcon from 'src/assets/images/addCardIcon.svg';

type AddSignerCardProps = {
  name: string;
  callback?: (param: string) => void;
  cardStyles?: ViewStyle;
};

function AddCard({ name, callback, cardStyles }: AddSignerCardProps) {
  return (
    <TouchableOpacity
      style={[styles.AddCardContainer, cardStyles && cardStyles]}
      onPress={() => callback(name)}
    >
      <Box style={styles.detailContainer}>
        <Box style={styles.iconWrapper}>
          <AddCardIcon />
        </Box>
        <Text style={styles.nameStyle}>{name}</Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  AddCardContainer: {
    width: 114,
    padding: 10,
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(45, 103, 89, 0.08)',
    borderColor: 'rgba(45, 103, 89, 1)',
    borderStyle: 'dashed',
  },
  nameStyle: {
    color: 'rgba(36, 49, 46, 1)',
    fontSize: 12,
    fontWeight: '400',
  },

  detailContainer: {
    gap: 2,
    marginTop: 15,
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#2e6759',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    backgroundColor: 'rgba(45, 103, 89, 1)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddCard;
