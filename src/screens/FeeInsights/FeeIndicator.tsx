import { StyleSheet } from 'react-native';
import React from 'react';
import { SegmentedArc } from '@shipt/segmented-arc-for-react-native';
import Fonts from 'src/constants/Fonts';
import { View, useColorMode } from 'native-base';
import customTheme from 'src/navigation/themes';
import { calculateIndicatorScale } from 'src/utils/feeInisghtUtil';
interface Props {
  percentageDifference: number;
}

const FeeIndicator = (props: Props) => {
  const range = [''];
  const { percentageDifference } = props;
  const { colorMode } = useColorMode();

  const segments = [
    {
      scale: 1,
      filledColor: customTheme.colors[colorMode].DarkSage,
      emptyColor: customTheme.colors[colorMode].DarkSage,
      data: { label: 'LOW' },
    },
  ];

  return (
    <View style={styles.container}>
      <SegmentedArc
        segments={segments}
        fillValue={calculateIndicatorScale(percentageDifference)}
        isAnimated={true}
        animationDelay={1000}
        showArcRanges={false}
        ranges={range}
        radius={40}
        filledArcWidth={6}
        emptyArcWidth={6}
        spaceBetweenSegments={0}
        rangesTextStyle={styles.rangeTextStyle}
        capInnerColor={customTheme.colors[colorMode].GreyText}
        capOuterColor={customTheme.colors[colorMode].seashellWhite}
      />
    </View>
  );
};

export default FeeIndicator;

const styles = StyleSheet.create({
  container: {},
  rangeTextStyle: {
    fontSize: 12,
    fontFamily: Fonts.InterBold,
  },
});
