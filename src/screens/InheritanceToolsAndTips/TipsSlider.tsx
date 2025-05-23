import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, FlatList, Dimensions, BackHandler } from 'react-native';
import { Box } from 'native-base';
import TipsSliderContentComponent from './components/TipsSliderContentComponent';
import { wp } from 'src/constants/responsive';
import Colors from 'src/theme/Colors';
import { useSelector } from 'react-redux';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

const { width } = Dimensions.get('window');

function TipsSlider({ items }) {
  const onboardingSlideRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const PrivateThemeLight = themeMode === 'PRIVATE_LIGHT';
  const slider_background = ThemedColor({ name: 'slider_background' });

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentPosition(viewableItems[0].index);
    }
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const maxOffsetX = (items.length - 1) * width;

    if (offsetX > maxOffsetX) {
      onboardingSlideRef.current.scrollToOffset({ offset: maxOffsetX, animated: true });
    }
  };
  const getDotStyle = (isSelected, isPrivateLight) => {
    if (isPrivateLight) {
      return {
        width: isSelected ? 25 : 6,
        height: 5,
        borderRadius: 5,
        marginEnd: 5,
        backgroundColor: isSelected ? Colors.lightorange : Colors.separator,
      };
    }

    return isSelected ? styles.selectedDot : styles.unSelectedDot;
  };

  return (
    <Box style={styles.container} backgroundColor={slider_background}>
      <SafeAreaView style={styles.safeAreaViewWrapper}>
        <Box>
          <FlatList
            ref={onboardingSlideRef}
            data={items}
            horizontal
            pagingEnabled
            snapToInterval={width}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            renderItem={({ item }) => (
              <TipsSliderContentComponent
                title={item.title}
                icon={item.icon}
                paragraph={item.paragraph}
                paragraph2={item.paragraph2}
              />
            )}
            onMomentumScrollEnd={handleScrollEnd}
          />
        </Box>
        <Box style={styles.indicatorContainer}>
          {items.map((item, index) => (
            <Box
              key={`dot-${item.id ? item.id : index}`}
              style={getDotStyle(currentPosition === index, PrivateThemeLight)}
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
  indicatorContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
  },
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.primaryCream,
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.TropicalRainForestDark,
    marginEnd: 5,
  },
});
