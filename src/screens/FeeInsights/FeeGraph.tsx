import { useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient, Stop } from 'react-native-svg';
import Fonts from 'src/constants/Fonts';
import { HistoricalInisightData } from 'src/nativemodules/interface';
import customTheme from 'src/navigation/themes';
import { getDayForGraph } from 'src/utils/utilities';

interface Props {
  dataSet: HistoricalInisightData[];
  recentData: HistoricalInisightData[];
  spacing?: number;
  yAxisLabelWidth?: number;
}

const FeeGraph = (props: Props) => {
  const [graphData, setGraphData] = useState([]);
  const { colorMode } = useColorMode();
  const { dataSet, recentData } = props;
  useEffect(() => {
    generateSmoothedDatasetForGraph(dataSet);
  }, [dataSet]);

  function generateSmoothedDatasetForGraph(dataSet) {
    const seenDates = new Set();
    const uniqueDailyItems = [];
    for (const item of dataSet) {
      const dateStr = new Date(item.timestamp * 1000).toISOString().split('T')[0];
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        uniqueDailyItems.push({
          value: item.avgFee_75,
          label: item == dataSet[0] ? '' : getDayForGraph(item.timestamp * 1000),
        });
      }
    }
    const currentFeeRate = recentData[recentData.length - 1];
    uniqueDailyItems[uniqueDailyItems.length - 1] = {
      value: currentFeeRate.avgFee_75,
      label: getDayForGraph(currentFeeRate.timestamp * 1000),
    };
    setGraphData(uniqueDailyItems);
  }

  return (
    <View style={styles.container}>
      {graphData.length > 0 && (
        <LineChart
          isAnimated={true}
          areaChart
          curved
          initialSpacing={0}
          data={graphData}
          spacing={props.spacing ? props.spacing : 42}
          thickness={5}
          hideOrigin
          hideDataPoints1
          yAxisColor={customTheme.colors[colorMode].lightSeashell}
          xAxisColor={customTheme.colors[colorMode].lightSeashell}
          yAxisLabelWidth={props.yAxisLabelWidth ? props.yAxisLabelWidth : 18}
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

export default FeeGraph;

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
