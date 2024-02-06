import React from 'react';
import { StyleSheet } from 'react-native';
import { Box } from 'native-base';
import Svg, { Path } from 'react-native-svg';

type Props = {
  width: number;
  height: number;
  backgroundColor: string;
  icon: Element;
};

function HexagonIcon({ width, height, backgroundColor, icon }: Props) {
  return (
    <Box style={styles.container}>
      <Svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 32 28">
        <Path
          d="M21.1,0A5,5,0,0,1,25.44,2.519l5.143,9a5,5,0,0,1,0,4.961l-5.143,9A5,5,0,0,1,21.1,28H10.9A5,5,0,0,1,6.56,25.481l-5.143-9a5,5,0,0,1,0-4.961l5.143-9A5,5,0,0,1,10.9,0Z"
          fill={backgroundColor}
        />
      </Svg>
      <Box style={styles.icon}>{icon}</Box>
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
});

export default HexagonIcon;
