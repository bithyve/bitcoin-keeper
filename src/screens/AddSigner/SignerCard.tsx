import React from 'react';
import { Box, Pressable } from 'native-base';
import { Image, StyleSheet, ViewStyle } from 'react-native';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/tick_icon.svg';
import { getPersistedDocument } from 'src/services/documents';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

type SignerCardProps = {
  name: string;
  subtitle?: string;
  description?: string | Element;
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
  isFeePriority?: boolean;
  boldDesc?: boolean;
  image?: string;
  cardBackground?: string;
  borderColor?: string;
  nameColor?: string;
  disabledWithTouch?: boolean;
  titleSize?: number;
  subtitleFont?: number;
  badgeText?: string;
};

function SignerCard({
  name,
  subtitle = '',
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
  isFeePriority = false,
  boldDesc = false,
  image = null,
  cardBackground,
  borderColor,
  nameColor,
  titleSize,
  subtitleFont,
  disabledWithTouch = false,
  badgeText,
}: SignerCardProps) {
  const backgroundColor =
    colorVarient === 'brown'
      ? `${colorMode}.pantoneGreen`
      : colorVarient === 'transparent'
      ? 'transparent'
      : `${colorMode}.pantoneGreen`;

  const cardBackgroundColor = cardBackground || `${colorMode}.seashellWhite`;
  const cardBorderColor = borderColor || `${colorMode}.separator`;
  const cardNameColor = nameColor || `${colorMode}.modalWhiteContent`;

  const cardStyle = [
    styles.walletContainer,
    disabled || disabledWithTouch ? { opacity: 0.5 } : null,
    disabledWithTouch ? { backgroundColor: `${colorMode}.disabledBackground` } : null,
    customStyle,
  ];

  const isPressable = !disabled;
  const badgeText_background = ThemedColor({ name: 'badgeText_background' });
  const badgeText_color = ThemedColor({ name: 'badgeText_color' });

  return (
    <Pressable
      disabled={!isPressable}
      backgroundColor={cardBackgroundColor}
      borderColor={cardBorderColor}
      style={cardStyle}
      onPress={() => {
        if (onCardSelect) onCardSelect(isSelected);
      }}
      testID={`btn_${name}`}
    >
      {badgeText && (
        <Box
          position="absolute"
          top={hp(10)}
          right={0}
          bg={badgeText_background}
          px={3}
          py={1}
          borderTopLeftRadius={5}
          borderBottomLeftRadius={5}
        >
          <Text color={badgeText_color} fontSize={10} medium>
            {badgeText}
          </Text>
        </Box>
      )}
      <Box style={styles.selectionIcon}>
        {showSelection &&
          (isSelected ? <Checked /> : StaticIcon ? <StaticIcon /> : <Box style={styles.circle} />)}
      </Box>

      <Box style={styles.detailContainer}>
        {!isFeePriority ? (
          <Box backgroundColor={backgroundColor} style={styles.iconWrapper}>
            {image ? (
              <Image src={getPersistedDocument(image)} style={styles.associatedContactImage} />
            ) : (
              icon
            )}
            {showDot ? <Box style={styles.redDot} /> : null}
          </Box>
        ) : (
          <Box style={styles.feeIconWrapper}></Box>
        )}
        {titleComp}
        <Text
          color={cardNameColor}
          style={{
            ...styles.walletName,
            fontSize: titleSize || styles.walletName.fontSize,
          }}
          numberOfLines={isFullText ? 2 : 1}
          medium
        >
          {name}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.walletSubtTitle,
              {
                fontSize: subtitleFont || styles.walletSubtTitle.fontSize,
                marginBottom: isFeePriority ? -7 : 0,
              },
            ]}
            color={`${colorMode}.secondaryText`}
            numberOfLines={numberOfLines}
          >
            {subtitle}
          </Text>
        ) : null}
        {typeof description === 'string' ? (
          <Text
            style={[styles.walletDescription, { fontWeight: boldDesc ? '500' : 'normal' }]}
            color={`${colorMode}.secondaryText`}
            numberOfLines={numberOfLines}
          >
            {description}
          </Text>
        ) : (
          description
        )}
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  walletContainer: {
    width: windowWidth * 0.42,
    height: wp(135),
    paddingHorizontal: wp(15),
    paddingVertical: hp(12),
    alignItems: 'flex-start',
    borderRadius: 10,
    margin: 3,
    position: 'relative',
    borderWidth: 1,
  },
  walletName: {
    fontSize: 16,
    marginTop: hp(6),
  },
  walletSubtTitle: {
    fontSize: 14,
  },
  walletDescription: {
    fontSize: 14,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    alignSelf: 'flex-end',
    borderWidth: 1,
  },
  detailContainer: {
    width: '100%',
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
  feeIconWrapper: {
    width: 15,
    height: 15,
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
  associatedContactImage: {
    width: '60%',
    height: '60%',
    borderRadius: 100,
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default SignerCard;
