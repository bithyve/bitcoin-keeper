import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import Svg, { Path } from 'react-native-svg';
import TickIcon from 'src/assets/images/tick_icon.svg';

type Props = {
  width: number;
  height: number;
  backgroundColor: string;
  icon: Element;
  showSelection: boolean;
};

function HexagonIcon({ width, height, backgroundColor, icon, showSelection = false }: Props) {
  return (
    <Box style={styles.container}>
      <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 32 28">
        <Path
          d="M21.1,0A5,5,0,0,1,25.44,2.519l5.143,9a5,5,0,0,1,0,4.961l-5.143,9A5,5,0,0,1,21.1,28H10.9A5,5,0,0,1,6.56,25.481l-5.143-9a5,5,0,0,1,0-4.961l5.143-9A5,5,0,0,1,10.9,0Z"
          fill={backgroundColor}
          stroke={showSelection && 'rgb(149, 175, 165)'}
          strokeWidth={showSelection && '2'}
        />
      </Svg>
      <Box style={styles.icon}>{icon}</Box>
      {showSelection && (
        <Box style={styles.tickIcon}>
          <TickIcon />
        </Box>
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
  },
  tickIcon: {
    position: 'absolute',
    top: 0,
    left: 27,
  },
});

export default HexagonIcon;
