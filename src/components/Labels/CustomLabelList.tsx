import React, { useState } from 'react';
import { VStack, Input, FlatList, HStack, useColorMode, Box } from 'native-base';
import CustomLabelItem from './CustomLabelItem';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import TickIcon from 'src/assets/images/tick-white.svg';

interface CustomLabelListProps {
  customLabels: string[];
  onAdd: (label: string) => void;
  onDelete: (label: string) => void;
  onEdit: (label: string, index: number) => void;
}

const CustomLabelList: React.FC<CustomLabelListProps> = ({
  customLabels,
  onAdd,
  onDelete,
  onEdit,
}) => {
  const { colorMode } = useColorMode();
  const [newLabel, setNewLabel] = useState('');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      if (selectedLabel) {
        const indexToUpdate = customLabels.indexOf(selectedLabel);

        onEdit(newLabel.trim(), indexToUpdate);

        setSelectedLabel(null);
      } else {
        onAdd(newLabel.trim());
      }
      setNewLabel('');
    }
  };

  const handleSelectLabel = (label: string) => {
    setNewLabel(label);
    setSelectedLabel(label);
  };

  return (
    <VStack space={4} style={styles.wrapper} backgroundColor={`${colorMode}.creamBrownBackground`}>
      <HStack space={2}>
        <Input
          w={'100%'}
          h={hp(40)}
          variant={'unstyled'}
          placeholder="Write your own Tags"
          placeholderTextColor={`${colorMode}.placeHolderTextColor`}
          value={newLabel}
          onChangeText={setNewLabel}
          style={styles.inputField}
          borderWidth={1}
          borderRadius={5}
          borderColor={`${colorMode}.selectedLabel`}
          _focus={{ borderColor: `${colorMode}.selectedLabel` }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          backgroundColor={`${colorMode}.ChampagneBliss`}
          onSubmitEditing={handleAddLabel}
          InputRightElement={
            <TouchableOpacity onPress={handleAddLabel}>
              <Box
                backgroundColor={
                  isFocused ? `${colorMode}.greenButtonBackground` : `${colorMode}.selectedLabel`
                }
                style={styles.inputFieldButton}
              >
                <TickIcon />
              </Box>
            </TouchableOpacity>
          }
        />
      </HStack>
      <FlatList
        data={customLabels}
        renderItem={({ item, index }) => (
          <CustomLabelItem
            label={item}
            onDelete={() => onDelete(item)}
            onEdit={() => onEdit(item, index)}
            isSelected={true}
            onSelect={handleSelectLabel}
          />
        )}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.listContainer}
      />
    </VStack>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: wp(16),
    paddingVertical: hp(16),
    borderRadius: 10,
  },
  listContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: wp(8),
  },
  inputField: {
    fontSize: 12,
    letterSpacing: 0.96,
  },
  inputFieldButton: {
    width: wp(32),
    height: hp(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: hp(4),
    marginHorizontal: wp(4),
    borderRadius: 5,
  },
});

export default CustomLabelList;
