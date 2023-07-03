import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  BackHandler,
} from 'react-native';
import Text from 'src/components/KeeperText';
import { Box } from 'native-base';

import LinearGradient from 'src/components/KeeperGradient';

import openLink from 'src/utils/OpenLink';
import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration1 from 'src/assets/images/illustration_1.svg';
import Illustration2 from 'src/assets/images/illustration_2.svg';
import Illustration7 from 'src/assets/images/illustration_7.svg';
import Skip from 'src/assets/images/skip.svg';
import OnboardingBackImage from 'src/assets/images/onboardingBackImage.png';
import { windowHeight, hp, wp } from 'src/common/data/responsiveness/responsive';

import OnboardingSlideComponent from 'src/components/onBoarding/OnboardingSlideComponent';

const { width } = Dimensions.get('window');

function OnBoardingSlides({ navigation }) {
  const onboardingSlideRef = useRef(null);
  const { translations } = useContext(LocalizationContext);
  const { onboarding } = translations;
  const { common } = translations;
  const [currentPosition, setCurrentPosition] = useState(0);
  // console.log('currentPosition', currentPosition)
  const [items] = useState([
    {
      id: 1,
      title: (
        <>
          <Text italic style={styles.info}>{`${onboarding.Comprehensive} `}</Text>
          {onboarding.security}
          {` ${onboarding.slide01Title}`}
        </>
      ),
      paragraph: onboarding.slide01Paragraph,
      illustration: <Illustration1 />,
    },
    {
      id: 2,
      title: (
        <>
          {`${onboarding.slide02Title} `}
          <Text italic style={styles.info}>
            {onboarding.privacy}
          </Text>
        </>
      ),
      paragraph: onboarding.slide02Paragraph,
      illustration: <Illustration2 />,
    },
    {
      id: 3,
      title: (
        <>
          {`${onboarding.slide07Title} `}
          <Text italic style={styles.info}>{onboarding.whirlpool}</Text>
        </>
      ),
      paragraph: onboarding.slide07Paragraph,
      illustration: <Illustration7 />,
    },
  ]);

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
    <LinearGradient colors={['light.gradientStart', 'light.gradientEnd']} style={styles.container}>
      <ImageBackground resizeMode="cover" style={styles.container} source={OnboardingBackImage}>
        <SafeAreaView style={styles.safeAreaViewWrapper}>
          <Box justifyContent="center" mr={4} mt={windowHeight > 715 ? 10 : 2} height={10}>
            {currentPosition !== 2 && (
              <TouchableOpacity
                onPress={() => navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })}
                style={styles.skipTextWrapper}
              >
                <Text color="light.white" bold style={styles.skipText}>
                  Skip&nbsp;&nbsp;
                </Text>
                <Skip />
              </TouchableOpacity>
            )}
          </Box>
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
              keyExtractor={item => item.id}
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
          <Box style={styles.bottomBtnWrapper}>
            <Box width="70%">
              <TouchableOpacity onPress={() => openLink('https://bitcoinkeeper.app/')}>
                <Box borderColor="light.lightAccent" style={styles.seeFAQWrapper}>
                  <Text color="light.lightAccent" bold style={styles.seeFAQText}>
                    {common.seeFAQs}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
            <Box flexDirection="row" height={5}>
              {currentPosition < items.length - 1 ? (
                items.map((item, index) => (
                  <Box
                    key={index}
                    style={currentPosition === index ? styles.selectedDot : styles.unSelectedDot}
                  />
                ))
              ) : (
                <Box alignSelf="center" backgroundColor="transparent">
                  <TouchableOpacity
                    onPress={() => {
                      if (currentPosition < items.length - 1) {
                        onboardingSlideRef.current.scrollToIndex({ animated: true, index: currentPosition + 1 });
                      } else {
                        navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })
                      }
                    }
                    }
                  >
                    <Box style={styles.cta} backgroundColor='light.white'>
                      <Text bold color="light.greenText" style={styles.startAppText}>
                        Start App
                      </Text>
                    </Box>
                  </TouchableOpacity>
                </Box>
              )}
            </Box>
          </Box>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient >
  );
}

export default OnBoardingSlides;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  cta: {
    borderRadius: 10,
    width: wp(110),
    height: hp(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    fontWeight: '900',
  },
  bottomBtnWrapper: {
    position: 'absolute',
    flex: 0.2,
    flexDirection: 'row',
    margin: 5,
    alignItems: 'center',
    bottom: hp(20),
    justifyContent: 'space-between',
    width: wp(350),
    paddingHorizontal: wp(20),
  },
  skipTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  startAppText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  seeFAQWrapper: {
    borderWidth: 0.7,
    borderRadius: 30,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(40),
  },
  seeFAQText: {
    fontSize: 14,
  },
});
