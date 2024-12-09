import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, SafeAreaView, FlatList, Dimensions, BackHandler } from 'react-native';
import { Box, useColorMode } from 'native-base';
import AssistedKeysContentSlider from './components/AssistedKeysSliderContent';
import { wp } from 'src/constants/responsive';

const { width } = Dimensions.get('window');

function AssistedKeysSlider({ items }) {
  const onboardingSlideRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const { colorMode } = useColorMode();
  const showSliderIndicator = false;

  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const maxOffsetX = (items.length - 1) * width;

    if (offsetX > maxOffsetX) {
      onboardingSlideRef.current.scrollToOffset({ offset: maxOffsetX, animated: true });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentPosition(viewableItems[0].index);
    }
  });

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.pantoneGreen`}>
      <SafeAreaView style={styles.safeAreaViewWrapper}>
        <Box style={styles.marginLeft}>
          <FlatList
            ref={onboardingSlideRef}
            data={items}
            horizontal
            pagingEnabled
            snapToInterval={width}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexWrap: 'wrap' }}
            disableIntervalMomentum
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
            keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
            onMomentumScrollEnd={handleScrollEnd}
            renderItem={({ item }) => (
              <AssistedKeysContentSlider
                title={item.title}
                description={item.description}
                icon={item.icon}
                paragraph={item.paragraph}
                paragraph2={item.paragraph2}
                callback={item.callback}
                note={item.note}
                buttonTitle={item.buttonTitle}
                buttonDescription={item.buttonDescription}
                buttonIcon={item.buttonIcon}
              />
            )}
          />
        </Box>
        {showSliderIndicator && (
          <Box alignItems="center" flexDirection="row" height={5}>
            {items.map((item, index) => (
              <Box
                key={item.id}
                style={currentPosition === index ? styles.selectedDot : styles.unSelectedDot}
              />
            ))}
          </Box>
        )}
      </SafeAreaView>
    </Box>
  );
}

export default AssistedKeysSlider;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  marginLeft: {
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
