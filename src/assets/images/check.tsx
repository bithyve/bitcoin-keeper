import * as React from 'react';
import Svg, { G, Circle, Path } from 'react-native-svg';

function SvgComponent(props) {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" {...props}>
      <G data-name="Group 46536" transform="translate(-215 -193)">
        <Circle
          cx={10}
          cy={10}
          r={10}
          fill={props.default ? '#2d6759' : '#fdf7f0'}
          data-name="Ellipse 2520"
          transform="translate(215 193)"
        />
        <Path
          fill={props.default ? '#fdf7f0' : '#2d6759'}
          fillRule="evenodd"
          d="m223.821 203.85 4.527-5.105 2.05 1.816-5.5 6.192a1.45 1.45 0 0 1-.991.454 1.391 1.391 0 0 1-1.018-.413l-2.77-2.751 1.94-1.954 1.72 1.72Z"
          data-name="Path 119486"
        />
      </G>
    </Svg>
  );
}
export default SvgComponent;
