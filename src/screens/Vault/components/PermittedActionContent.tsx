import { Box, Checkbox, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { PermittedAction } from 'src/models/interfaces/AssistedKeys';

const permissionLabels = Object.values(PermittedAction);

function PermittedActionContent({
  setPermittedActionData,
  PermittedActionData,
  setAddNewUserModal,
  setPermittedActions,
}) {
  const { colorMode } = useColorMode();
  const [permissions, setPermissions] = useState<{ [key: string]: boolean }>(
    Object.fromEntries(permissionLabels.map((label) => [label, false]))
  );
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  useEffect(() => {
    if (PermittedActionData) {
      const updatedPermissions = Object.fromEntries(
        permissionLabels.map((label) => [label, PermittedActionData[label]])
      );
      setPermissions(updatedPermissions);
    }
  }, [PermittedActionData]);

  const handleSingleChange = (label: string, isChecked: boolean) => {
    setPermissions((prev) => {
      const updated = { ...prev, [label]: isChecked };
      return updated;
    });
  };

  // Uncomment this if you want to implement the select all functionality

  // const handleSelectAll = (isChecked: boolean) => {
  //   const updated = Object.fromEntries(permissionLabels.map((label) => [label, isChecked]));
  //   setPermissions(updated);
  // };
  // const values = Object.values(permissions);
  // const allSelected = values.every(Boolean);
  // const someSelected = values.some(Boolean) && !allSelected;

  return (
    <Box>
      {/* <Box style={styles.selectAllContainer}>
        <Checkbox
          value="selectAll"
          isChecked={allSelected}
          isIndeterminate={someSelected}
          onChange={(isChecked) => handleSelectAll(isChecked)}
          accessibilityLabel="Select all permissions"
          mr={wp(10)}
          _checked={{
            bg: `${colorMode}.pantoneGreen`,
            borderColor: `${colorMode}.pantoneGreen`,
            _icon: {
              color: 'white',
            },
          }}
          _unchecked={{
            borderColor: `${colorMode}.pantoneGreen`,
            bg: `${colorMode}.pantoneGreen`,
          }}
        />
        <Text semiBold color={`${colorMode}.pantoneGreen`}>
          Select all
        </Text>
      </Box> */}

      {permissionLabels.map((label) => (
        <Box
          key={label}
          style={styles.container}
          backgroundColor={`${colorMode}.textInputBackground`}
          borderColor={`${colorMode}.greyBorder`}
        >
          <Checkbox
            value={label}
            isChecked={permissions[label]}
            onChange={(isChecked) => handleSingleChange(label, isChecked)}
            accessibilityLabel={label}
            mr={wp(10)}
            _checked={{
              bg: `${colorMode}.pantoneGreen`,
              borderColor: `${colorMode}.pantoneGreen`,
              _icon: {
                color: 'white',
              },
            }}
          />
          <Text medium>{getServerKeyPermittedActionLabelText(label)}</Text>
        </Box>
      ))}
      <Box mt={hp(20)} alignSelf="flex-end">
        <Buttons
          primaryCallback={() => {
            setPermittedActionData(permissions);
            setPermittedActions(false);
            setAddNewUserModal(true);
          }}
          fullWidth
          primaryText={common.confirm}
        />
      </Box>
    </Box>
  );
}

export default PermittedActionContent;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    borderRadius: 10,
    marginBottom: hp(10),
    borderWidth: 1,
    gap: hp(10),
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(15),
  },
});

export const getServerKeyPermittedActionLabelText = (label: string) => {
  switch (label) {
    case PermittedAction.SIGN_TRANSACTION:
      return 'Sign Transactions';
    default:
      return 'Unsupported Action';
  }
};
