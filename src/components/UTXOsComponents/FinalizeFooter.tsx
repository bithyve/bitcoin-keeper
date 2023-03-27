import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { wp } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FinalizeFooter({
  setEnableSelection,
  footerCallback,
  initiateWhirlpool,
  setInitiateWhirlpool,
  secondaryText,
  initateWhirlpoolMix,
  setInitateWhirlpoolMix,
}) {
  const { bottom } = useSafeAreaInsets();
  return (
    <Box style={[styles.footerContainer, { marginBottom: bottom }]}>
      <Buttons
        primaryText={initiateWhirlpool ? 'Mix' : initateWhirlpoolMix ? 'Start Mix' : 'Send'}
        secondaryText={secondaryText}
        secondaryCallback={() => {
          if (initiateWhirlpool) {
            setInitiateWhirlpool(false);
          }
          if (initateWhirlpoolMix) {
            setInitateWhirlpoolMix(false);
          }
          setEnableSelection(false);
        }}
        primaryCallback={footerCallback}
        // secondaryCallback={() => setEnableSelection(false)}
        // primaryCallback={goToSend}
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
