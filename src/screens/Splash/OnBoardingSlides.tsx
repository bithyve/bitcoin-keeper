import React, { useContext, useState, useEffect } from 'react';
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
import { Box, StatusBar } from 'native-base';

import LinearGradient from 'src/components/KeeperGradient';

import openLink from 'src/utils/OpenLink';
import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration_1 from 'src/assets/images/illustration_1.svg';
import Illustration_2 from 'src/assets/images/illustration_2.svg';
import Skip from 'src/assets/images/skip.svg';
import OnboardingBackImage from 'src/assets/images/onboardingBackImage.png';
import { windowHeight } from 'src/common/data/responsiveness/responsive';

import OnboardingSlideComponent from 'src/components/onBoarding/OnboardingSlideComponent';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

const { width } = Dimensions.get('window');

function OnBoardingSlides({ navigation }) {
  const { translations } = useContext(LocalizationContext);
  const { onboarding } = translations;
  const { common } = translations;
  const [currentPosition, setCurrentPosition] = useState(0);
  const [items] = useState([
    {
      id: '1',
      title: (
        <>
          {`${onboarding.Comprehensive} `}
          <Text style={styles.info}>{onboarding.security}</Text>
          {` ${onboarding.slide01Title}`}
        </>
      ),
      paragraph: onboarding.slide01Paragraph,
      illustration: <Illustration_1 />,
    },
    {
      id: '2',
      title: (
        <>
          {`${onboarding.slide02Title} `}
          <Text style={styles.info}>{onboarding.privacy}</Text>
        </>
      ),
      paragraph: onboarding.slide02Paragraph,
      illustration: <Illustration_2 />,
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
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });
  return (
    <LinearGradient colors={['light.gradientStart', 'light.gradientEnd']} style={styles.container}>
      <ImageBackground resizeMode="contain" style={styles.container} source={OnboardingBackImage}>
        <SafeAreaView style={styles.safeAreaViewWrapper}>
          <Box justifyContent="center" mr={4} mt={windowHeight > 715 ? 10 : 2} height={10}>
            {currentPosition !== 1 && (
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
              data={items}
              horizontal
              snapToInterval={width}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="center"
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
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
              <TouchableOpacity onPress={() => openLink('https://hexawallet.io/faq/')}>
                <Box borderColor="light.lightAccent" style={styles.seeFAQWrapper}>
                  <Text color="light.lightAccent" bold style={styles.seeFAQText}>
                    {common.seeFAQs}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
            <Box flexDirection="row" height={5}>
              {currentPosition < items.length - 1 ? (
                items.map((item, index) => {
                  console.log(index);
                  return (
                    <Box
                      key={index}
                      style={currentPosition === index ? styles.selectedDot : styles.unSelectedDot}
                    />
                  );
                })
              ) : (
                <Box alignSelf="center" backgroundColor="transparent">
                  <TouchableOpacity
                    onPress={() =>
                      navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })
                    }
                  >
                    <LinearGradient
                      start={[0, 0]}
                      end={[1, 1]}
                      colors={['#FFFFFF', '#80A8A1']}
                      style={styles.cta}
                    >
                      <Text bold color="light.greenText" style={styles.startAppText}>
                        Start App
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Box>
              )}
            </Box>
          </Box>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
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
    fontStyle: 'italic',
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
    textAlign: 'right',
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
