import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack, useColorMode } from 'native-base';
import React from 'react';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import { windowWidth } from 'src/constants/responsive';

type OptionProps = {
  title: string;
  description: string;
  callback: () => void;
  Icon?: Element;
  LeftIcon?: Element;
};

export function OptionCard({ title, description, Icon, callback, LeftIcon }: OptionProps) {
  const { colorMode } = useColorMode();
  return (
    <Pressable onPress={callback}>
      <HStack
        padding={3}
        width={windowWidth * 0.9}
        justifyContent="space-between"
        alignItems="center"
        borderRadius={10}
        testID={`view_${title.replace(/ /g, '_')}`}
      >
        {LeftIcon && LeftIcon}
        <VStack>
          <Text
            color={`${colorMode}.primaryText`}
            testID={`text_${title.replace(/ /g, '_')}`}
            style={{ fontSize: 14, letterSpacing: 1.04 }}
          >
            {title}
          </Text>
          {description && (
            <Text
              color={`${colorMode}.GreyText`}
              style={{ fontSize: 12, letterSpacing: 0.36, width: windowWidth * 0.7 }}
            >
              {description}
            </Text>
          )}
        </VStack>
        <Box justifyContent="center" alignItems="flex-end">
          {Icon || <RightArrowIcon />}
        </Box>
      </HStack>
    </Pressable>
  );
}

export default OptionCard;
