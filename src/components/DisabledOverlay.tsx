import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Colors from 'src/theme/Colors';

type DisabledOverlayProps = {
  visible: boolean;
  topComponent?: Element;
  bottomComponent?: Element;
};

const DisabledOverlay = ({ visible, topComponent, bottomComponent }: DisabledOverlayProps) => {
  const { colorMode } = useColorMode();
  const gradientColors =
    colorMode === 'dark'
      ? [
          Colors.SecondaryBlackTranslucent,
          Colors.SecondaryBlackMidTranslucent,
          Colors.SecondaryBlackMidTranslucent,
          Colors.SecondaryBlack,
          Colors.SecondaryBlack,
        ]
      : [
          Colors.WarmBeigeTranslucent,
          Colors.WarmbeigeMidTranslucent,
          Colors.WarmbeigeMidTranslucent,
          Colors.WarmbeigeMidTranslucent,
          Colors.Warmbeige,
          Colors.Warmbeige,
        ];

  return visible ? (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      {topComponent && <Box style={styles.top}>{topComponent}</Box>}

      {bottomComponent && <Box style={styles.bottom}>{bottomComponent}</Box>}
    </LinearGradient>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
});

export default DisabledOverlay;
