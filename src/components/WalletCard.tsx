import { Box, Pressable, useColorMode } from 'native-base';
import React, { StyleSheet, ViewStyle } from 'react-native';
import Text from './KeeperText';

type WalletCardProps = {
  id: number;
  walletName: string;
  walletDescription?: string;
  icon: Element;
  selectedIcon: Element;
  selectedCard: number;
  onCardSelect: (cardName: number) => void;
  arrowStyles: ViewStyle;
  numberOfLines?: number;
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
  numberOfLines = 1,
}: WalletCardProps) {
  const { colorMode } = useColorMode();
  const isSelected = selectedCard === id;

  return (
    <Pressable testID={`btn_${walletName}`} onPress={() => onCardSelect(id)}>
      <Box
        borderColor={`${colorMode}.TransactionIconBackColor`}
        backgroundColor={isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.seashellWhite`}
        style={[styles.walletContainer, !isSelected && { opacity: 0.5 }]}
      >
        <Box style={styles.detailContainer}>
          <Box
            backgroundColor={isSelected ? `${colorMode}.seashellWhite` : `${colorMode}.BrownNeedHelp`}
            style={styles.circle}
          >
            {isSelected ? selectedIcon : icon}
          </Box>
          <Box>
            <Text
              color={isSelected ? `${colorMode}.white` : `${colorMode}.black`}
              numberOfLines={1}
              style={styles.walletName}
              medium={isSelected}
            >
              {walletName}
            </Text>
            <Text
              color={isSelected ? `${colorMode}.white` : `${colorMode}.black`}
              fontSize={isSelected ? 11 : 10}
              numberOfLines={2}
              style={styles.walletDesc}
            >
              {walletDescription}
            </Text>
          </Box>
        </Box>
      </Box>
      {isSelected && (
        <Box borderTopColor={`${colorMode}.pantoneGreen`} style={[styles.arrow, arrowStyles]} />
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
    width: 34,
    height: 34,
    borderRadius: 34 / 2,
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
  walletName: {
    fontSize: 12,
    letterSpacing: 0.12,
  },
  walletDesc: {
    letterSpacing: 0.11,
    lineHeight: 18,
  },
});

export default WalletCard;
