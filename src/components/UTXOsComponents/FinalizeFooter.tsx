import { StyleSheet } from 'react-native';
import React, { useContext } from 'react';
import { wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { Box, useColorMode } from 'native-base';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function FinalizeFooter({ setEnableSelection, footerCallback, secondaryText, selectedUTXOs }) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  return (
    <Box style={[styles.footerContainer]} backgroundColor={`${colorMode}.primaryBackground`}>
      <Buttons
        primaryText={common.send}
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
