import React from 'react';
import { HStack, useColorMode } from 'native-base';
import DefaultLabelItem from './DefaultLabelItem';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';

interface DefaultLabelListProps {
  defaultLabels: string[];
  selectedLabels: string[];
  onSelect: (label: string) => void;
}

const DefaultLabelList: React.FC<DefaultLabelListProps> = ({
  defaultLabels,
  selectedLabels,
  onSelect,
}) => {
  const { colorMode } = useColorMode();
  return (
    <HStack style={styles.container} backgroundColor={`${colorMode}.seashellWhite`}>
      {defaultLabels.map((label) => (
        <DefaultLabelItem
          key={label}
          label={label}
          isSelected={selectedLabels.includes(label)}
          onSelect={() => onSelect(label)}
        />
      ))}
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexWrap: 'wrap',
    gap: 5,
    borderRadius: 10,
    paddingLeft: wp(19),
    paddingRight: wp(16),
    paddingVertical: hp(14),
  },
});

export default DefaultLabelList;
