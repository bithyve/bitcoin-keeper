import React from 'react';
import { Box, Pressable, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { windowWidth } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/check.svg';

type SignerCardProps = {
  name: string;
  description: string;
  icon: Element;
  isSelected: boolean;
  onCardSelect?: (selected: any) => void;
  showSelection?: boolean;
  colorVarient?: string;
  disabled?: boolean;
  isFullText?: boolean;
};

function SignerCard({
  name,
  description,
  icon,
  isSelected,
  onCardSelect,
  showSelection = true,
  colorVarient = 'brown',
  disabled = false,
  isFullText = false,
}: SignerCardProps) {
  const { colorMode } = useColorMode();
  const backgroundColor =
    colorVarient === 'brown' ? `${colorMode}.RussetBrown` : `${colorMode}.pantoneGreen`;

  return (
    <Pressable
      disabled={disabled}
      backgroundColor={isSelected ? `${colorMode}.Teal` : `${colorMode}.seashellWhite`}
      borderColor={`${colorMode}.Eggshell`}
      style={[styles.walletContainer, disabled ? { opacity: 0.5 } : null]}
      onPress={() => {
        if (showSelection) {
          onCardSelect(isSelected);
        }
      }}
    >
      {showSelection &&
        (isSelected ? (
          <Checked style={{ alignSelf: 'flex-end' }} />
        ) : (
          <Box style={styles.circle} />
        ))}
      <Box style={styles.detailContainer}>
        <Box backgroundColor={backgroundColor} style={styles.iconWrapper}>
          {icon}
        </Box>
        <Text
          color={`${colorMode}.SlateGrey`}
          style={styles.walletName}
          numberOfLines={isFullText ? 0 : 1}
          bold
        >
          {name}
        </Text>
        <Text
          style={[{ color: `${colorMode}.GreenishGrey` }, styles.walletDescription]}
          numberOfLines={1}
        >
          {description}
        </Text>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: windowWidth / 3 - windowWidth * 0.05,
    padding: 10,
    height: 125,
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 0.5,
    backgroundColor: '#FDF7F0',
    margin: 3,
  },
  walletName: {
    fontSize: 12,
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
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignerCard;
