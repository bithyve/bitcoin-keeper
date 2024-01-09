import { Box, Pressable, useColorMode } from 'native-base';
import React, { StyleSheet, ViewStyle } from 'react-native';
import Text from './KeeperText';

type WalletCardProps = {
  id: number;
  walletName: string;
  walletDescription: string;
  icon: Element;
  selectedIcon: Element;
  selectedCard: number;
  onCardSelect: (cardName: number) => void;
  arrowStyles: ViewStyle;
};

function WalletCard({
  id,
  walletName,
  walletDescription,
  icon,
  selectedIcon,
  selectedCard,
  onCardSelect,
  arrowStyles,
}: WalletCardProps) {
  const { colorMode } = useColorMode();
  const isSelected = selectedCard === id;

  return (
    <Pressable onPress={() => onCardSelect(id)}>
      <Box
        borderColor={`${colorMode}.Eggshell`}
        backgroundColor={isSelected ? `${colorMode}.GreenishBlue` : `${colorMode}.seashellWhite`}
        style={[styles.walletContainer, !isSelected && { opacity: 0.7 }]}
      >
        <Box style={styles.detailContainer}>
          <Box
            backgroundColor={isSelected ? `${colorMode}.seashellWhite` : `${colorMode}.RussetBrown`}
            style={styles.circle}
          >
            {isSelected ? selectedIcon : icon}
          </Box>
          <Box>
            <Text
              color={isSelected ? `${colorMode}.white` : `${colorMode}.black`}
              numberOfLines={1}
            >
              {walletName}
            </Text>
            <Text
              color={isSelected ? `${colorMode}.white` : `${colorMode}.black`}
              numberOfLines={1}
            >
              {walletDescription}
            </Text>
          </Box>
        </Box>
      </Box>
      {isSelected && (
        <Box borderTopColor={`${colorMode}.GreenishBlue`} style={[styles.arrow, arrowStyles]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: 114,
    height: 125,
    padding: 10,
    borderRadius: 10,
    borderWidth: 0.5,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 5,
    marginTop: 15,
  },
  arrow: {
    marginTop: -10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 20,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default WalletCard;
