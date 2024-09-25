import React from 'react';
import { HStack, useColorMode } from 'native-base';
import Text from '../KeeperText';
import CrossIcon from 'src/assets/images/cross-icon.svg';
import { Pressable, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';

interface CustomLabelItemProps {
  label: string;
  onDelete: () => void;
  onEdit: () => void;
  isSelected: boolean;
  onSelect: (label: string) => void;
}

const CustomLabelItem: React.FC<CustomLabelItemProps> = ({ label, onDelete, onSelect }) => {
  const { colorMode } = useColorMode();
  return (
    <Pressable onPress={() => onSelect(label)}>
      <HStack
        style={styles.container}
        backgroundColor={`${colorMode}.selectedLabel`}
        borderColor={`${colorMode}.selectedLabel`}
      >
        <Text style={styles.labelText} color={`${colorMode}.whiteText`}>
          {label}
        </Text>
        <Pressable onPress={onDelete}>
          <CrossIcon />
        </Pressable>
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

export default CustomLabelItem;
