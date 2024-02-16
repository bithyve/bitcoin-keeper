import { Platform, StyleSheet } from 'react-native';
import React from 'react';
import { windowWidth } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FinalizeFooter({
  setEnableSelection,
  footerCallback,
  initiateWhirlpool,
  setInitiateWhirlpool,
  secondaryText,
  initateWhirlpoolMix,
  setInitateWhirlpoolMix,
  selectedUTXOs,
  isRemix,
  remixingToVault,
  setRemixingToVault,
}) {
  const { bottom } = useSafeAreaInsets();
  const { colorMode } = useColorMode();
  return (
    <Box
      style={[styles.footerContainer, { marginBottom: bottom / 2 }]}
      backgroundColor={`${colorMode}.primaryBackground`}
    >
      <Buttons
        primaryText={
          initiateWhirlpool
            ? 'Initiate Premix'
            : initateWhirlpoolMix
            ? isRemix
              ? remixingToVault
                ? 'Remix to vault'
                : 'Start Remix'
              : 'Start Mix'
            : 'Send'
        }
        secondaryText={secondaryText}
        secondaryCallback={() => {
          if (initiateWhirlpool) {
            setInitiateWhirlpool(false);
          }
          if (initateWhirlpoolMix) {
            setInitateWhirlpoolMix(false);
          }
          if (remixingToVault) {
            setRemixingToVault(false);
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
  },
});
