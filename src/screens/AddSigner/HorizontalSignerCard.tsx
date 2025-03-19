import React, { useContext } from 'react';
import { Box, Pressable } from 'native-base';
import { StyleSheet, ViewStyle } from 'react-native';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/tick_icon.svg';
import ArrowRightIcon from 'src/assets/images/icon_arrow_grey.svg';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type HorizontalSignerCardProps = {
  name: string;
  subtitle?: string;
  description?: string;
  icon: Element;
  isSelected?: boolean;
  onCardSelect?: (selected: any) => void;
  showSelection?: boolean;
  colorVarient?: string;
  disabled?: boolean;
  showDot?: boolean;
  customStyle?: ViewStyle;
  StaticIcon?: any;
  colorMode: string;
  changeKey: () => void;
};

function HorizontalSignerCard({
  name,
  description = '',
  icon,
  colorVarient = 'brown',
  showDot = false,
  customStyle,
  colorMode,
  changeKey,
}: HorizontalSignerCardProps) {
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultTranslations } = translations;
  const backgroundColor =
    colorVarient === 'brown'
      ? `${colorMode}.BrownNeedHelp`
      : colorVarient === 'transparent'
      ? 'transparent'
      : `${colorMode}.pantoneGreen`;

  return (
    <Pressable
      backgroundColor={`${colorMode}.seashellWhite`}
      borderColor={`${colorMode}.RecoveryBorderColor`}
      style={[styles.horizontalContainer, { ...customStyle }]}
      testID={`btn_${name}`}
      onPress={changeKey}
    >
      <Box style={styles.infoContainer}>
        <Box backgroundColor={backgroundColor} style={styles.iconWrapper}>
          {icon}
          {showDot ? <Box style={styles.redDot} /> : null}
        </Box>
        <Box style={styles.textContainer}>
          <Text
            color={`${colorMode}.primaryText`}
            style={styles.walletName}
            numberOfLines={1}
            medium
          >
            {name}
          </Text>
          {description ? (
            <Text
              style={styles.walletSubtTitle}
              color={`${colorMode}.secondaryText`}
              numberOfLines={1}
            >
              {description}
            </Text>
          ) : null}
        </Box>
      </Box>
      <Box style={styles.rightContainer}>
        <Box style={styles.selectionIcon}>
          <Checked />
        </Box>
        <Box style={styles.changeKeyContainer}>
          <Text underline style={styles.changeKeyText} medium color={`${colorMode}.BrownNeedHelp`}>
            {vaultTranslations.changeKey}
          </Text>
          <ArrowRightIcon fill={`${colorMode}.BrownNeedHelp`} height={hp(20)} width={wp(5)} />
        </Box>
      </Box>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    position: 'relative',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingVertical: hp(15),
    paddingHorizontal: wp(15),
  },
  infoContainer: {
    gap: 5,
  },
  iconWrapper: {
    width: 35,
    height: 35,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(10),
    marginBottom: hp(5),
  },
  walletName: {
    fontSize: 14,
    letterSpacing: 0.12,
    opacity: 0.8,
  },
  walletSubtTitle: {
    fontSize: 12,
    letterSpacing: 0.11,
  },
  selectionIcon: {
    alignSelf: 'flex-end',
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
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    alignSelf: 'center',
    gap: hp(35),
  },
  changeKeyContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  changeKeyText: {
    fontSize: 13,
    marginRight: wp(5),
  },
});

export default HorizontalSignerCard;
