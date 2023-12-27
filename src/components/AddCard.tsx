import { Box } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from 'src/theme/Colors';

type AddSignerCardProps = {
  name: string;
  walletDescription: string;
  icon: Element;
  selectedCard: string;
  onCardSelect: (cardName: string) => void;
};

function AddSignerCard({ name, icon, selectedCard, onCardSelect }: AddSignerCardProps) {
  const isSelected = selectedCard === name;
  return (
    <TouchableOpacity style={styles.AddCardContainer} onPress={() => onCardSelect(name)}>
      <Box style={styles.detailContainer}>
        <Box style={styles.iconWrapper}>{icon}</Box>
        <Text style={isSelected ? { color: Colors.White } : styles.nameStyle}>{name}</Text>
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

export default AddSignerCard;
