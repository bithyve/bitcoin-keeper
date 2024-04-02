import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, FlatList, Dimensions, BackHandler } from 'react-native';
import { Box } from 'native-base';

import TipsSliderContentComponent from './components/TipsSliderContentComponent';
import { wp } from 'src/constants/responsive';

const { width } = Dimensions.get('window');

function TipsSlider({ items }) {
  const onboardingSlideRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const onViewRef = React.useRef((viewableItems) => {
    setCurrentPosition(viewableItems.changed[0].index);
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 100 });
  return (
    <Box style={styles.container} backgroundColor="light.pantoneGreen">
      <SafeAreaView style={styles.safeAreaViewWrapper}>
        <Box>
          <FlatList
            ref={onboardingSlideRef}
            data={items}
            horizontal
            snapToInterval={width}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexWrap: 'wrap' }}
            disableIntervalMomentum
            decelerationRate="fast"
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TipsSliderContentComponent
                title={item.title}
                icon={item.icon}
                paragraph={item.paragraph}
                paragraph2={item.paragraph2}
              />
            )}
          />
        </Box>
        <Box alignItems="center" flexDirection="row" height={5}>
          {items.map((item, index) => (
            <Box
              key={item.id}
              style={currentPosition === index ? styles.selectedDot : styles.unSelectedDot}
            />
          ))}
        </Box>
      </SafeAreaView>
    </Box>
  );
}

export default TipsSlider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: wp(5),
  },
  safeAreaViewWrapper: {
    flex: 1,
    position: 'relative',
  },
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#E3BE96',
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#89AEA7',
    marginEnd: 5,
  },
});
