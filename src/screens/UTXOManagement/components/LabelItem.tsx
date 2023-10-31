import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import DeleteCross from 'src/assets/images/deletelabel.svg';
import Text from 'src/components/KeeperText';

function LabelItem({
  item,
  index,
  onCloseClick,
  onEditClick,
  editingIndex,
  editable = true,
}: {
  item: { name: string; isSystem: boolean };
  index: number;
  onCloseClick?: Function;
  onEditClick?: Function;
  editingIndex?: number;
  editable?: boolean;
}) {
  const { colorMode } = useColorMode();
  return (
    <Box
      style={[styles.labelView, {}]}
      backgroundColor={
        item.isSystem
          ? `${colorMode}.forestGreen`
          : editingIndex !== index
          ? `${colorMode}.accent`
          : `${colorMode}.coffeeBackground`
      }
    >
      <TouchableOpacity
        style={styles.labelEditContainer}
        activeOpacity={!item.isSystem && editable ? 0.5 : 1}
        onPress={() => (!item.isSystem && editable ? onEditClick(item, index) : null)}
        testID={`btn_${item.name}`}
      >
        <Text style={styles.itemText} bold testID={`text_${item.name}`}>
          {item.name.toUpperCase()}
        </Text>
        {!item.isSystem && editable ? (
          <TouchableOpacity onPress={() => onCloseClick(index)}>
            <Box style={styles.deleteContainer}>
              <DeleteCross />
            </Box>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    </Box>
  );
}

export default LabelItem;

const styles = StyleSheet.create({
  deleteContainer: {
    paddingHorizontal: 4,
  },
  itemText: {
    color: '#fff',
    fontSize: 11,
  },
  labelView: {
    borderRadius: 5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10,
  },
  labelEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
