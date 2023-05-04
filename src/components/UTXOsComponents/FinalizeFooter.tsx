import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import Buttons from 'src/components/Buttons';
import { Box } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from 'src/theme/Colors';

function FinalizeFooter({
  setEnableSelection,
  footerCallback,
  initiateWhirlpool,
  setInitiateWhirlpool,
  secondaryText,
  initateWhirlpoolMix,
  setInitateWhirlpoolMix,
  selectedUTXOs,
}) {
  const { bottom } = useSafeAreaInsets();
  return (
    <Box style={[styles.footerContainer, { marginBottom: bottom }]}>
      <Buttons
        primaryText={
          initiateWhirlpool ? 'Initiate Premix' : initateWhirlpoolMix ? 'Start Mix' : 'Send'
        }
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
        primaryDisable={!selectedUTXOs.length}
      />
    </Box>
  );
}

export default FinalizeFooter;

const styles = StyleSheet.create({
  footerContainer: {
    height: 70,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 5 : 15,
    width: windowWidth,
    paddingHorizontal: '10%',
    backgroundColor: Colors.LightWhite,
  },
});
