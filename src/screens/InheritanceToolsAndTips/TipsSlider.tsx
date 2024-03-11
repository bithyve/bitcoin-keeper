import React, { useContext, useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, FlatList, Dimensions, BackHandler } from 'react-native';
import { Box, useColorMode } from 'native-base';

import { LocalizationContext } from 'src/context/Localization/LocContext';

import { hp, wp } from 'src/constants/responsive';

import OnboardingSlideComponent from 'src/components/onBoarding/OnboardingSlideComponent';

const { width } = Dimensions.get('window');

function TipsSlider({ navigation, items }) {
  const { colorMode } = useColorMode();
  const onboardingSlideRef = useRef(null);
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
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
        <Box flex={0.9}>
          <FlatList
            ref={onboardingSlideRef}
            data={items}
            horizontal
            snapToInterval={width}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            disableIntervalMomentum
            decelerationRate="fast"
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OnboardingSlideComponent
                title={item.title}
                illustration={item.illustration}
                paragraph={item.paragraph}
                currentPosition={currentPosition}
                navigation={navigation}
              />
            )}
          />
        </Box>
      </SafeAreaView>
    </Box>
  );
}

export default TipsSlider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaViewWrapper: {
    flex: 1,
    position: 'relative',
  },
});
