import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FinalizeFooter({ setEnableSelection, footerCallback, primaryText, secondaryText }) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Box style={[styles.footerContainer, { marginBottom: bottom }]}>
      <Buttons
        primaryText={primaryText}
        secondaryText={secondaryText}
        secondaryCallback={() => setEnableSelection(false)}
        primaryCallback={footerCallback}
      />
    </Box>
  );
}

export default FinalizeFooter;

const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 5 : 0,
    width: wp(375),
    paddingHorizontal: '10%',
    marginBottom: '4%',
  },
});
