import { useColorMode } from 'native-base';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient, Stop } from 'react-native-svg';
import Fonts from 'src/constants/Fonts';
import { windowWidth } from 'src/constants/responsive';
import customTheme from 'src/navigation/themes';

const NO_OF_SECTIONS_Y = 7;

const BtcGraph = ({ dataSet, spacing }) => {
  const { colorMode } = useColorMode();
  const yOffset = Math.floor(Math.min(...dataSet.map((item) => item.value)) * 0.99);

  return (
    <View style={styles.container}>
      {dataSet.length > 0 && (
        <LineChart
          width={windowWidth}
          isAnimated={true}
          areaChart
          curved
          scrollToIndex={1}
          data={dataSet}
          spacing={spacing}
          thickness={3}
          hideOrigin
          hideDataPoints1
          noOfSections={NO_OF_SECTIONS_Y - 1}
          yAxisOffset={yOffset}
          yAxisColor={customTheme.colors[colorMode].lightSeashell}
          xAxisColor={customTheme.colors[colorMode].lightSeashell}
          yAxisLabelWidth={0}
          hideYAxisText
          color={customTheme.colors[colorMode].Border}
          yAxisTextStyle={{
            color: customTheme.colors[colorMode].primaryText,
            ...styles.labelText,
          }}
          xAxisLabelTextStyle={{
            color: customTheme.colors[colorMode].primaryText,
            ...styles.labelText,
          }}
          areaGradientId="ag"
          areaGradientComponent={() => {
            return (
              <LinearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={customTheme.colors[colorMode].pantoneGreen} />
                <Stop offset="1" stopColor={customTheme.colors[colorMode].seashellWhite} />
              </LinearGradient>
            );
          }}
        />
      )}
    </View>
  );
};

export default BtcGraph;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  graphHeader: {
    paddingVertical: 10,
  },
  labelText: { fontSize: 12, fontFamily: Fonts.LoraSemiBold },
});
