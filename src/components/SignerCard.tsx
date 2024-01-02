import { Box, useColorMode } from 'native-base';
import Text from './KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';

type SignerCardProps = {
  walletName: string;
  walletDescription: string;
  icon: Element;
  selectedCard: string;
  onCardSelect: (cardName: string) => void;
};

function SignerCard({
  walletName,
  walletDescription,
  icon,
  selectedCard,
  onCardSelect,
}: SignerCardProps) {
  const isSelected = selectedCard === walletName;
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity
      style={[styles.walletContainer, isSelected && styles.selectedCard]}
      onPress={() => onCardSelect(walletName)}
    >
      <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.circle} />
      <Box style={styles.detailContainer}>
        <Box backgroundColor={`${colorMode}.RussetBrown`} style={styles.iconWrapper}>
          {icon}
        </Box>
        <Text style={isSelected ? { color: `${colorMode}.white` } : styles.walletName}>
          {walletName}
        </Text>
        <Text
          style={[
            isSelected
              ? { color: `${colorMode}.white` }
              : [styles.walletDescription, { color: `${colorMode}.GreenishGrey` }],
          ]}
          numberOfLines={1}
        >
          {walletDescription}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: 114,
    padding: 10,
    height: 125,
    alignItems: 'flex-start',
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#eee3d8',
  },
  walletName: {
    color: 'rgba(36, 49, 46, 1)',
    fontSize: 12,
    fontWeight: '400',
  },
  walletDescription: {
    fontSize: 11,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    alignSelf: 'flex-end',
    borderWidth: 1,
  },
  detailContainer: {
    gap: 2,
    marginTop: 15,
  },
  selectedCard: {
    backgroundColor: '#2e6759',
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignerCard;
