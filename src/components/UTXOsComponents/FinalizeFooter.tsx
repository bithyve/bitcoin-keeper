import { StyleSheet } from 'react-native';
import React from 'react';
import { wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { Box, useColorMode } from 'native-base';

function FinalizeFooter({ setEnableSelection, footerCallback, secondaryText, selectedUTXOs }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={[styles.footerContainer]} backgroundColor={`${colorMode}.primaryBackground`}>
      <Buttons
        primaryText={
          'Send' // TODO: Use translations
        }
        secondaryText={secondaryText}
        secondaryCallback={() => {
          setEnableSelection(false);
        }}
        primaryCallback={footerCallback}
        primaryDisable={!selectedUTXOs.length}
      />
    </Box>
  );
}

export default FinalizeFooter;

const styles = StyleSheet.create({
  footerContainer: {
    paddingHorizontal: wp(20),
  },
});
