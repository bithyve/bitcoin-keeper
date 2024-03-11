import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack, useColorMode } from 'native-base';
import React from 'react';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { windowWidth } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';

type OptionProps = {
  title: string;
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
    <Pressable onPress={callback} disabled={disabled}>
      <HStack
        padding={3}
        width={windowWidth * 0.9}
        justifyContent="space-between"
        alignItems="center"
        borderRadius={10}
        testID={`view_${title.replace(/ /g, '_')}`}
      >
        <HStack style={styles.iconContainer}>
          {LeftIcon && LeftIcon}
          <VStack>
            <Text
              color={titleColor || `${colorMode}.primaryText`}
              testID={`text_${title.replace(/ /g, '_')}`}
              style={{ fontSize: 13, letterSpacing: 0.13 }}
            >
              {title}
            </Text>
            {description && (
              <Text
                color={descriptionColor || `${colorMode}.GreyText`}
                style={{ fontSize: 12, letterSpacing: 0.12 }}
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
});

export default OptionCard;
