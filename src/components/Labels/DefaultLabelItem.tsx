import React from 'react';
import { HStack, Pressable, useColorMode } from 'native-base';
import Text from '../KeeperText';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import TickCircle from 'src/assets/images/tick-circle.svg';

interface DefaultLabelItemProps {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}

const DefaultLabelItem: React.FC<DefaultLabelItemProps> = ({ label, isSelected, onSelect }) => {
  const { colorMode } = useColorMode();
  return (
    <Pressable onPress={onSelect}>
      <HStack
        style={styles.container}
        backgroundColor={isSelected ? `${colorMode}.selectedLabel` : 'transparent'}
        borderColor={`${colorMode}.selectedLabel`}
      >
        <Text
          style={styles.labelText}
          color={isSelected ? `${colorMode}.whiteText` : `${colorMode}.primaryText`}
        >
          {label}
        </Text>
        {isSelected && <TickCircle />}
      </HStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp(28),
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    borderWidth: 1,
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
    gap: wp(5),
  },
  labelText: {
    fontSize: 12,
    lineHeight: 14.4,
  },
});

export default DefaultLabelItem;
