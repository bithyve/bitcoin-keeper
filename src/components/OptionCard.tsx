import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack, useColorMode } from 'native-base';
import React from 'react';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { windowWidth, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';

type OptionProps = {
  title: string;
  preTitle?: string;
  description?: string;
  callback?: () => void;
  titleColor?: string;
  descriptionColor?: string;
  Icon?: Element;
  LeftIcon?: Element;
  disabled?: boolean;
  visible?: boolean;
  CardPill?: Element;
};

export function OptionCard({
  title,
  preTitle,
  description,
  Icon,
  callback,
  titleColor,
  descriptionColor,
  LeftIcon,
  disabled = false,
  CardPill,
  visible = true,
}: OptionProps) {
  const { colorMode } = useColorMode();

  if (!visible) return null;

  const containerOpacity = disabled ? 0.8 : 1;
  const preTitleOpacity = colorMode === 'light' ? 1 : 0.7;
  const descriptionOpacity = colorMode === 'light' ? 1 : 0.8;

  const getTextColor = (type: 'title' | 'description' | 'preTitle') => {
    if (disabled) {
      return colorMode === 'light' ? `${colorMode}.LightGreenish` : `${colorMode}.primaryText`;
    }

    switch (type) {
      case 'title':
        return titleColor || `${colorMode}.primaryText`;
      case 'description':
        return descriptionColor || `${colorMode}.GreyText`;
      case 'preTitle':
        return colorMode === 'light' ? `${colorMode}.LightGreenish` : `${colorMode}.primaryText`;
    }
  };

  return (
    <Pressable
      testID={`btn_${title}`}
      onPress={callback}
      disabled={disabled}
      opacity={disabled ? 0.8 : 1}
    >
      <HStack
        py={3}
        width={windowWidth * 0.85}
        justifyContent="space-between"
        alignItems="center"
        borderRadius={10}
        testID={`view_${title.replace(/ /g, '_')}`}
      >
        <HStack space={3} style={[styles.iconContainer, { opacity: containerOpacity }]}>
          {LeftIcon && <Box style={styles.iconWrapper}>{LeftIcon}</Box>}

          <VStack flex={1} space={1}>
            {preTitle && (
              <Text
                italic
                color={getTextColor('preTitle')}
                testID={`text_preTitle_${title.replace(/ /g, '_')}`}
                style={[styles.preTitle, { opacity: preTitleOpacity }]}
              >
                {preTitle}
              </Text>
            )}

            <Text
              color={getTextColor('title')}
              testID={`text_${title.replace(/ /g, '_')}`}
              style={styles.title}
            >
              {title}
            </Text>

            {description && (
              <Text
                color={getTextColor('description')}
                style={[styles.description, { opacity: descriptionOpacity }]}
              >
                {description}
              </Text>
            )}
          </VStack>
        </HStack>

        <Box style={styles.arrowWrapper}>
          {CardPill || Icon || <RightArrowIcon style={styles.arrowMargin} />}
        </Box>
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  preTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrapper: {
    width: wp(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowWrapper: {
    minWidth: wp(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowMargin: {
    marginRight: wp(20),
  },
});

export default OptionCard;
