import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack, useColorMode } from 'native-base';
import React from 'react';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { windowWidth } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';

type OptionProps = {
  title: string;
  preTitle?: string;
  description: string;
  callback?: () => void;
  titleColor?: string;
  descriptionColor?: string;
  Icon?: Element;
  LeftIcon?: Element;
  disabled?: boolean;
  CardPill?: Element;
};

export function OptionCard({
  title,
  preTitle,
  description,
  Icon,
  callback = null,
  titleColor,
  descriptionColor,
  LeftIcon,
  disabled = false,
  CardPill,
}: OptionProps) {
  const { colorMode } = useColorMode();
  return (
    <Pressable testID={`btn_${title}`} onPress={callback} disabled={disabled}>
      <HStack style={styles.container} testID={`view_${title.replace(/ /g, '_')}`}>
        <HStack style={[styles.iconContainer, { opacity: disabled ? 0.8 : 1 }]}>
          {LeftIcon && LeftIcon}
          <VStack>
            {preTitle && (
              <Text
                italic
                color={`${colorMode}.PretitleColor`}
                testID={`text_${title.replace(/ /g, '_')}`}
                style={[
                  styles.preTitle,
                  {
                    opacity: colorMode === 'light' ? 1 : 0.7,
                  },
                ]}
              >
                {preTitle}
              </Text>
            )}
            <Text
              color={
                disabled
                  ? colorMode === 'light'
                    ? `${colorMode}.LightGreenish`
                    : titleColor || `${colorMode}.primaryText`
                  : titleColor || `${colorMode}.primaryText`
              }
              testID={`text_${title.replace(/ /g, '_')}`}
              style={styles.preTitle}
            >
              {title}
            </Text>
            {description && (
              <Text
                color={descriptionColor || `${colorMode}.GreyText`}
                style={[
                  styles.descpTitle,
                  {
                    opacity: colorMode === 'light' ? 1 : 0.8,
                  },
                ]}
              >
                {description}
              </Text>
            )}
          </VStack>
        </HStack>
        {CardPill || (
          <Box justifyContent="center" alignItems="flex-end">
            {Icon || <RightArrowIcon />}
          </Box>
        )}
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingRight: 20,
  },
  preTitle: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
  descpTitle: {
    fontSize: 12,
    letterSpacing: 0.12,
  },
  container: {
    padding: 3,
    width: windowWidth * 0.85,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
  },
});

export default OptionCard;
