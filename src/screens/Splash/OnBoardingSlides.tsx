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
import { Box, useColorMode } from 'native-base';

import openLink from 'src/utils/OpenLink';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Illustration1 from 'src/assets/images/create-wallet-illustration.svg';
import Illustration2 from 'src/assets/images/manage-keys-illustration.svg';
import Illustration8 from 'src/assets/images/inheritance-illustration.svg';
import Skip from 'src/assets/images/skip.svg';
import OnboardingBackImage from 'src/assets/images/onboardingBackImage.png';
import { windowHeight, hp, wp } from 'src/constants/responsive';

import OnboardingSlideComponent from 'src/components/onBoarding/OnboardingSlideComponent';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';
import useIsSmallDevices from 'src/hooks/useSmallDevices';

const { width } = Dimensions.get('window');

function OnBoardingSlides({ navigation }) {
  const { colorMode } = useColorMode();
  const isSmallDevice = useIsSmallDevices();
  const onboardingSlideRef = useRef(null);
  const { translations } = useContext(LocalizationContext);
  const { onboarding, common } = translations;
  const [currentPosition, setCurrentPosition] = useState(0);
  const [items] = useState([
    {
      id: 1,
      title: onboarding.slide01Title,
      paragraph: onboarding.slide01Paragraph,
      illustration: <Illustration1 />,
    },
    {
      id: 2,
      title: common.manageKeys,
      paragraph: onboarding.slide02Paragraph,
      illustration: <Illustration2 width={wp(255)} height={hp(250)} />,
    },
    {
      id: 3,
      title: onboarding.slide03Title,
      paragraph: onboarding.slide03Paragraph,
      illustration: <Illustration8 />,
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
    <Box style={styles.container} backgroundColor={`${colorMode}.primaryGreenBackground`}>
      {/* <ImageBackground resizeMode="cover" style={styles.container} source={OnboardingBackImage}> */}
      <SafeAreaView style={styles.safeAreaViewWrapper}>
        <Box justifyContent="center" mr={4} mt={windowHeight > 715 ? 5 : 2} height={10}>
          {currentPosition !== 2 && (
            <TouchableOpacity
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] })}
              style={styles.skipTextWrapper}
              testID="btn_skip"
            >
              <Text color={`${colorMode}.white`} bold style={styles.skipText}>
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
        <Box style={styles.bottomBtnWrapper} bottom={isSmallDevice ? hp(25) : hp(37)}>
          <TouchableOpacity testID="btn_FAQ" onPress={() => openLink(`${KEEPER_KNOWLEDGEBASE}`)}>
            <Box
              style={styles.seeFAQWrapper}
              backgroundColor={`${colorMode}.modalGreenLearnMore`}
              borderColor={`${colorMode}.modalBackground`}
            >
              <Text color={`${colorMode}.white`} bold style={styles.seeFAQText}>
                {common.seeFAQs}
              </Text>
            </Box>
          </TouchableOpacity>
          <Box style={styles.dotsWrapper}>
            {currentPosition < items.length - 1 ? (
              items.map((item, index) => (
                <Box
                  key={item.id.toString()}
                  backgroundColor={
                    currentPosition === index ? `${colorMode}.white` : `${colorMode}.sliderStep`
                  }
                  style={currentPosition === index ? styles.selectedDot : styles.unSelectedDot}
                />
              ))
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (currentPosition < items.length - 1) {
                    onboardingSlideRef.current.scrollToIndex({
                      animated: true,
                      index: currentPosition + 1,
                    });
                  } else {
                    navigation.reset({ index: 0, routes: [{ name: 'NewKeeperApp' }] });
                  }
                }}
                testID="btn_startApp"
              >
                <Box style={styles.cta} backgroundColor={`${colorMode}.white`}>
                  <Text color={`${colorMode}.greenText`} style={styles.startAppText}>
                    {common.getStarted}
                  </Text>
                </Box>
              </TouchableOpacity>
            )}
          </Box>
        </Box>
      </SafeAreaView>
      {/* </ImageBackground> */}
    </Box>
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
    width: 26,
    height: 5,
    borderRadius: 5,
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    marginEnd: 5,
  },
  cta: {
    borderRadius: 10,
    width: wp(126),
    height: hp(42),
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    fontWeight: '900',
  },
  bottomBtnWrapper: {
    alignSelf: 'center',
    position: 'absolute',
    flexDirection: 'row',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingLeft: wp(28),
    paddingRight: wp(22),
  },
  skipTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    letterSpacing: 0.42,
    textAlign: 'center',
    opacity: 0.7,
  },
  startAppText: {
    fontSize: 13,
    letterSpacing: 0.78,
  },
  seeFAQWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(36),
    width: wp(110),
    borderRadius: wp(30),
    borderWidth: 0.5,
  },
  seeFAQText: {
    fontSize: 13,
    letterSpacing: 0.26,
  },
  dotsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hp(20),
  },
});
