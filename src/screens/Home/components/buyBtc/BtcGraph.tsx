import { useColorMode } from 'native-base';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient, Stop } from 'react-native-svg';
import Fonts from 'src/constants/Fonts';
import customTheme from 'src/navigation/themes';
import { compactNumber } from 'src/utils/utilities';

const NO_OF_SECTIONS_Y = 7;

const BtcGraph = (props) => {
  const { colorMode } = useColorMode();
  const { dataSet } = props;
  const yOffset = Math.floor(Math.min(...dataSet.map((item) => item.value)) * 0.99);

  function generateBufferedLabels(arr) {
    try {
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('Input must be a non-empty array');
      }

      const min = Math.min(...arr);
      const max = Math.max(...arr);

      if (min === max) {
        // Avoid zero range
        const bufferedMin = min * 0.1;
        const bufferedMax = min * 1.9;
        const step = (bufferedMax - bufferedMin) / NO_OF_SECTIONS_Y - 1;
        return Array.from({ length: 5 }, (_, i) => compactNumber(bufferedMin + i * step));
      }

      const bufferedMin = min;
      const bufferedMax = max;

      const step = (bufferedMax - bufferedMin) / NO_OF_SECTIONS_Y - 1;
      const labels = [];

      for (let i = 0; i < NO_OF_SECTIONS_Y; i++) {
        if (i === NO_OF_SECTIONS_Y - 1) {
          labels.push(compactNumber(Math.round(bufferedMax)));
          continue;
        }
        if (i === 0) {
          labels.push(compactNumber(Math.floor(bufferedMin)));
          continue;
        }
        const value = bufferedMin + i * step;
        labels.push(compactNumber(Math.round(value)));
      }

      return labels;
    } catch (error) {
      console.log('🚀 ~ generateBufferedLabels ~ error:', error);
    }
  }

  return (
    <View style={styles.container}>
      {dataSet.length > 0 && (
        <LineChart
          isAnimated={true}
          areaChart
          curved
          scrollToEnd
          scrollAnimation
          initialSpacing={20}
          data={dataSet}
          spacing={50}
          thickness={5}
          hideOrigin
          hideDataPoints1
          noOfSections={NO_OF_SECTIONS_Y - 1}
          yAxisOffset={yOffset}
          yAxisColor={customTheme.colors[colorMode].lightSeashell}
          xAxisColor={customTheme.colors[colorMode].lightSeashell}
          yAxisLabelWidth={50}
          yAxisLabelTexts={generateBufferedLabels(dataSet.map((item) => item.value))}
          color={customTheme.colors[colorMode].Border}
          yAxisTextStyle={{
            color: customTheme.colors[colorMode].primaryText,
            ...styles.labelText,
          }}
          xAxisTextNumberOfLines={2}
          xAxisLabelTextStyle={{
            color: customTheme.colors[colorMode].primaryText,
            ...styles.labelText,
          }}
          areaGradientId="ag"
          areaGradientComponent={() => {
            return (
              <LinearGradient id="ag" x1="1" y1="0" x2="0" y2="1">
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
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  graphHeader: {
    paddingVertical: 10,
  },
  labelText: { fontSize: 12, fontFamily: Fonts.LoraSemiBold },
});
