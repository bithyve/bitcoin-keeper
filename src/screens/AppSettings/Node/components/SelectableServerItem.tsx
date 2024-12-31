import React, { useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const SelectableServerItem = ({ item, onSelect, currentlySelectedNode }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;
  const isDarkMode = colorMode === 'dark';
  const isSelected = item.id === currentlySelectedNode?.id;

  return (
    <Pressable onPress={() => onSelect(item)}>
      <Box
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        style={[styles.nodeList, isSelected && styles.selectedItem]}
        borderColor={
          isSelected
            ? `${colorMode}.pantoneGreen`
            : isDarkMode
            ? `${colorMode}.receiptBorder`
            : null
        }
        borderWidth={isDarkMode && !isSelected ? 1 : isSelected ? 2 : 0}
      >
        <Box style={styles.nodeDetail}>
          <Box flex={1}>
            <Text color={`${colorMode}.secondaryText`} style={[styles.nodeTextHeader]} medium>
              {settings.host}
            </Text>
            <Text numberOfLines={1} style={styles.nodeTextValue}>
              {item.host}
            </Text>
          </Box>
          <Box flex={-1}>
            <Text color={`${colorMode}.secondaryText`} style={[styles.nodeTextHeader]} medium>
              {settings.portNumber}
            </Text>
            <Text style={styles.nodeTextValue}>{item.port}</Text>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  selectedItem: {
    borderRadius: 7,
  },
  nodeList: {
    width: '100%',
    borderRadius: 7,
    paddingHorizontal: wp(14),
    paddingVertical: hp(25),
    marginBottom: hp(10),
  },
  nodeDetail: {
    overflow: 'hidden',
    width: '95%',
    flexDirection: 'row',
  },
  nodeTextHeader: {
    marginHorizontal: wp(10),
    fontSize: 12,
  },
  nodeTextValue: {
    fontSize: 12,
    marginLeft: wp(10),
    paddingBottom: hp(2),
  },
});

export default SelectableServerItem;
