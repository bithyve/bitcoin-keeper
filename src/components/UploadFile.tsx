import React, { useCallback, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import DocumentPicker, { types } from 'react-native-document-picker';
import Text from 'src/components/KeeperText';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs';

function UploadFile({ fileHandler }) {
  const { colorMode } = useColorMode();
  const handleDocumentSelection = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.docx, types.allFiles],
        allowMultiSelection: false,
      });
      const content = await RNFS.readFile(response[0].uri, 'utf8');
      fileHandler(content);
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={handleDocumentSelection}
      style={{
        alignItems: 'center',
      }}
      testID="btn_importBSMS"
    >
      <Box backgroundColor={`${colorMode}.pantoneGreen`} style={styles.container}>
        <Text style={styles.text} color={`${colorMode}.white`}>
          Import a BSMS or Wallet Configuration File
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    letterSpacing: 0.6,
    fontSize: 12,
    marginLeft: 5,
  },
});

export default UploadFile;
