import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect } from 'react';
import { Box, useColorMode } from 'native-base';
import DeleteCross from 'src/assets/images/deletelabel.svg';
import Text from 'src/components/KeeperText';
import { sha256 } from 'bitcoinjs-lib/src/crypto';
import { hp, wp } from 'src/constants/responsive';

function LabelItem({
  item,
  index,
  onCloseClick,
  onEditClick,
  editingIndex,
  onLayout,
  onUnmount,
  editable = true,
}: {
  item: { name: string; isSystem: boolean };
  index: number;
  onCloseClick?: Function;
  onEditClick?: Function;
  editingIndex?: number;
  editable?: boolean;
  onLayout?: (event, index) => void;
  onUnmount?: (index) => void;
}) {
  const { colorMode } = useColorMode();

  function getLabelColor(label) {
    const labelHash = sha256(label).toString('hex');
    const num = parseInt(labelHash.slice(0, 8), 16);
    // Update when adding more label colors
    const labelColorsCount = 10;
    const colorIndex = (num % labelColorsCount) + 1;
    return `${colorMode}.tagColor${colorIndex}`;
  }

  useEffect(() => {
    return () => {
      if (onUnmount) {
        onUnmount(index);
      }
    };
  }, []);

  return (
    <Box
      style={[styles.labelView, {}]}
      onLayout={(event) => {
        if (onLayout) {
          onLayout(event, index);
        }
      }}
      backgroundColor={getLabelColor(item.name)}
    >
      <TouchableOpacity
        style={styles.labelEditContainer}
        activeOpacity={!item.isSystem && editable ? 0.5 : 1}
        onPress={() => (!item.isSystem && editable ? onEditClick(item, index) : null)}
        testID={`btn_${item.name}`}
      >
        <Text
          style={styles.labelText}
          color={`${colorMode}.labelText`}
          testID={`text_${item.name}`}
        >
          {item.name}
        </Text>

        {!item.isSystem && editable ? (
          <TouchableOpacity onPress={() => onCloseClick(index)}>
            <Box style={styles.deleteContainer}>
              <DeleteCross size={wp(8)} />
            </Box>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
    </Box>
  );
}

export default LabelItem;

const styles = StyleSheet.create({
  labelView: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(3),
    borderRadius: 20,
    marginHorizontal: wp(3),
    marginTop: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 11,
    lineHeight: 18,
  },
  deleteContainer: {
    paddingLeft: wp(10),
    paddingVertical: wp(4),
  },
  labelEditContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
