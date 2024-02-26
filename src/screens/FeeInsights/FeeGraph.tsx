import { useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient, Stop } from 'react-native-svg';
import customTheme from 'src/navigation/themes';

interface Props {
  dataSet: any[];
}

const FeeGraph = (props: Props) => {
  const [graphData, setGraphData] = useState([]);
  const {colorMode} = useColorMode();
  const {dataSet} =props;
  useEffect(() => {
    generateSmoothedDatasetForGraph(dataSet);
  }, [dataSet]);

  function generateSmoothedDatasetForGraph(historicalFeesData, numberOfPoints = 12) {
    // Calculate the interval size for sampling
    const intervalSize = Math.floor(historicalFeesData.length / numberOfPoints);
    const smoothedData = [];

    for (let i = 0; i < numberOfPoints; i++) {
        // Calculate the index to sample - we take the middle of each interval for a representative value
        const index = i * intervalSize + Math.floor(intervalSize / 2);

        // Ensure the index is within the bounds of the historicalFeesData array
        if(index < historicalFeesData.length) {
            smoothedData.push({
                value: historicalFeesData[index].avgFee_75,
                dataPointText: historicalFeesData[index].avgFee_75.toString(),
                hideDataPoint: true,
            });
        }
    }

    // If the intervals didn't cover the last part of the dataset, add the last data point
    if(smoothedData.length < numberOfPoints && historicalFeesData.length > 0) {
        smoothedData.push({
            value: historicalFeesData[historicalFeesData.length - 1].avgFee_75,
            dataPointText: historicalFeesData[historicalFeesData.length - 1].avgFee_75.toString(),
            hideDataPoint: true
        });
    }
    setGraphData(smoothedData);
}



  return (
    <View style={styles.container}>
      <LineChart
        areaChart
        curved
        initialSpacing={0}
        data={graphData}
        spacing={25}
        thickness={5}
        hideOrigin
        yAxisColor={ customTheme.colors[colorMode].lightSeashell}
        xAxisColor={ customTheme.colors[colorMode].lightSeashell}
        yAxisLabelWidth={18}
        color={ customTheme.colors[colorMode].fadedblue}
        yAxisTextStyle={{ color:  customTheme.colors[colorMode].primaryText, fontSize: 10, }}
        areaGradientId="ag"
        areaGradientComponent={() => {
          return (
            <LinearGradient id="ag" x1="1" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={customTheme.colors[colorMode].fadedblue} />
              <Stop offset="1" stopColor={customTheme.colors[colorMode].seashellWhite} />
            </LinearGradient>
          );
        }}
      />
    </View>
  );
};

export default FeeGraph;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:10
  },
  graphHeader: {
    paddingVertical: 10,
  },
});
