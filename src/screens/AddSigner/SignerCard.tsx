import React from 'react';
import { Box, Pressable } from 'native-base';
import { StyleSheet, ViewStyle } from 'react-native';
import { windowWidth } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/tick_icon.svg';

type SignerCardProps = {
  name: string;
  description?: string;
  icon: Element;
  isSelected?: boolean;
  onCardSelect?: (selected: any) => void;
  showSelection?: boolean;
  colorVarient?: string;
  disabled?: boolean;
  isFullText?: boolean;
  showDot?: boolean;
  customStyle?: ViewStyle;
  numberOfLines?: number;
  StaticIcon?: any;
  titleComp?: any;
  colorMode: string;
};

function SignerCard({
  name,
  description = '',
  icon,
  isSelected,
  titleComp,
  onCardSelect,
  showSelection = true,
  colorVarient = 'brown',
  disabled = false,
  isFullText = false,
  showDot = false,
  StaticIcon = null,
  numberOfLines = 1,
  customStyle,
  colorMode,
}: SignerCardProps) {
  const backgroundColor =
    colorVarient === 'brown' ? `${colorMode}.BrownNeedHelp` : `${colorMode}.pantoneGreen`;
  return (
    <Pressable
      disabled={disabled}
      backgroundColor={`${colorMode}.seashellWhite`}
      style={[styles.walletContainer, disabled ? { opacity: 0.5 } : null, { ...customStyle }]}
      onPress={() => {
        if (onCardSelect) onCardSelect(isSelected);
      }}
      testID={`btn_${name}`}
    >
      <Box style={styles.selectionIcon}>
        {showSelection &&
          (isSelected ? <Checked /> : StaticIcon ? <StaticIcon /> : <Box style={styles.circle} />)}
      </Box>

      <Box style={styles.detailContainer}>
        <Box backgroundColor={backgroundColor} style={styles.iconWrapper}>
          {icon}
          {showDot ? <Box style={styles.redDot} /> : null}
        </Box>
        <Text
          color={`${colorMode}.primaryText`}
          style={styles.walletName}
          numberOfLines={isFullText ? 0 : 1}
          medium
        >
          {name}
        </Text>
        <Text
          style={styles.walletDescription}
          color={`${colorMode}.secondaryText`}
          numberOfLines={numberOfLines}
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
    margin: 3,
    position: 'relative',
  },
  walletName: {
    fontSize: 12,
    letterSpacing: 0.12,
    opacity: 0.8,
  },
  walletDescription: {
    fontSize: 11,
    letterSpacing: 0.11,
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
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 10 / 2,
    backgroundColor: 'red',
    position: 'absolute',
    top: 0,
    right: 0,
    borderWidth: 1,
    borderColor: 'white',
  },
  selectionIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignSelf: 'flex-end',
  },
});

export default SignerCard;
