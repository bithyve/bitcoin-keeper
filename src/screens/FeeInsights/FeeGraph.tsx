import { useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient, Stop } from 'react-native-svg';
import Fonts from 'src/constants/Fonts';
import { HistoricalInisightData } from 'src/nativemodules/interface';
import customTheme from 'src/navigation/themes';

interface Props {
  dataSet: HistoricalInisightData[];
  recentData: HistoricalInisightData[];
}

const FeeGraph = (props: Props) => {
  const [graphData, setGraphData] = useState([]);
  const { colorMode } = useColorMode();
  const { dataSet, recentData } = props;
  useEffect(() => {
    generateSmoothedDatasetForGraph(dataSet);
  }, [dataSet]);

  function generateSmoothedDatasetForGraph(historicalFeesData, targetCount = 12) {
    const step = historicalFeesData.length / targetCount;
    const adjustedDataPoints = [];

    for (let i = 0; i < targetCount; i++) {
      const index = Math.round(i * step);
      if (index < historicalFeesData.length) {
        adjustedDataPoints.push({ value: historicalFeesData[index].avgFee_75 });
      }
    }
    const currentFeeRate = recentData[recentData.length - 1];
    setGraphData([...adjustedDataPoints, { value: currentFeeRate.avgFee_75 }]);
  }

  return (
    <View style={styles.container}>
      {graphData.length > 0 && (
        <LineChart
          areaChart
          curved
          initialSpacing={0}
          data={graphData}
          spacing={22.5}
          thickness={5}
          hideOrigin
          hideDataPoints1
          yAxisColor={customTheme.colors[colorMode].lightSeashell}
          xAxisColor={customTheme.colors[colorMode].lightSeashell}
          yAxisLabelWidth={18}
          color={customTheme.colors[colorMode].Border}
          yAxisTextStyle={{
            color: customTheme.colors[colorMode].DarkSage,
            fontSize: 12,
            fontFamily: Fonts.FiraSansSemiBold,
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
});
