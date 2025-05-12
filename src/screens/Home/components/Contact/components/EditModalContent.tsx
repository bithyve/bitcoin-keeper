import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Buttons from 'src/components/Buttons';
import KeeperTextInput from 'src/components/KeeperTextInput';

const EditModalContent = ({
  editReceiverProfileName,
  setEditReceiverProfileName,
  setOpenEditModal,
}) => {
  const { colorMode } = useColorMode();
  const [editName, setEditName] = useState('');
  useEffect(() => {
    setEditName(editReceiverProfileName);
  }, [editReceiverProfileName]);

  const handleEditName = () => {
    setEditReceiverProfileName(editName);
    setEditName('');
    setOpenEditModal(false);
  };
  return (
    <Box style={styles.container}>
      <KeeperTextInput
        placeholder="Enter Your Name/label"
        value={editName}
        onChangeText={setEditName}
      />
      <Buttons
        primaryText="Confirm"
        primaryBackgroundColor={`${colorMode}.pantoneGreen`}
        primaryTextColor={`${colorMode}.headerWhite`}
        fullWidth
        primaryCallback={() => {
          handleEditName();
        }}
      />
    </Box>
  );
};

export default EditModalContent;
const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
});
