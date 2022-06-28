import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { Box, Text } from 'native-base';

import { RFValue } from 'react-native-responsive-fontsize';
import LinearGradient from 'react-native-linear-gradient';

import openLink from 'src/utils/OpenLink';
import { LocalizationContext } from 'src/common/content/LocContext';
import Illustration_1 from 'src/assets/images/svgs/illustration_1.svg';
import Illustration_2 from 'src/assets/images/svgs/illustration_2.svg';
import Illustration_3 from 'src/assets/images/svgs/illustration_3.svg';
import Illustration_4 from 'src/assets/images/svgs/illustration_4.svg';
import Illustration_5 from 'src/assets/images/svgs/illustration_5.svg';
import Illustration_6 from 'src/assets/images/svgs/illustration_6.svg';
import Skip from 'src/assets/images/svgs/skip.svg';
import OnboardingBackImage from 'src/assets/images/onboardingBackImage.png';

import OnboardingSlideComponent from 'src/components/onBoarding/OnboardingSlideComponent';
const { width } = Dimensions.get('window');

const OnBoardingSlides = ({ navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const onboarding = translations['onboarding'];
  const common = translations['common'];
  const [currentPosition, setCurrentPosition] = useState(0);
  const [items, setItems] = useState([
    {
      id: '1',
      title: onboarding.slide01Title,
      paragraph: onboarding.slide01Paragraph,
      illustration: <Illustration_1 />,
    },
    {
      id: '2',
      title: onboarding.slide02Title,
      paragraph: onboarding.slide02Paragraph,
      illustration: <Illustration_2 />,
    },
    {
      id: '3',
      title: onboarding.slide03Title,
      paragraph: onboarding.slide03Paragraph,
      illustration: <Illustration_3 />,
    },
    {
      id: '4',
      title: onboarding.slide04Title,
      paragraph: onboarding.slide04Paragraph,
      illustration: <Illustration_4 />,
    },
    {
      id: '5',
      title: onboarding.slide05Title,
      paragraph: onboarding.slide05Paragraph,
      illustration: <Illustration_6 />,
    },
    {
      id: '6',
      title: onboarding.slide06Title,
      paragraph: onboarding.slide06Paragraph,
      illustration: <Illustration_5 />,
    },
  ]);

  const onViewRef = React.useRef((viewableItems) => {
    setCurrentPosition(viewableItems.changed[0].index);
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <LinearGradient colors={['#00836A', '#073E39']} style={{ flex: 1 }}>
      <ImageBackground resizeMode="contain" style={{ flex: 1 }} source={OnboardingBackImage}>
        <SafeAreaView style={{ flex: 1, margin: 10 }}>
          <Box flex={0.1} justifyContent={'center'} m={4}>
            {currentPosition != 5 && (
              <TouchableOpacity
                onPress={() => navigation.replace('App')}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
              >
                <Text
                  fontSize={RFValue(14)}
                  color={'light.white'}
                  fontFamily={'heading'}
                  fontWeight={300}
                  textAlign={'right'}
                  opacity={0.7}
                >
                  Skip&nbsp;&nbsp;
                </Text>
                <Skip />
              </TouchableOpacity>
            )}
          </Box>
          <Box flex={0.8}>
            <FlatList
              data={items}
              horizontal
              snapToInterval={width}
              showsHorizontalScrollIndicator={false}
              decelerationRate={0}
              snapToAlignment={'center'}
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
          <Box flex={0.1} flexDirection={'row'} m={5} alignItems={'center'}>
            <Box w={'70%'}>
              <TouchableOpacity onPress={() => openLink('https://hexawallet.io/faq/')}>
                <Box
                  borderColor={'light.borderColor2'}
                  borderWidth={0.7}
                  borderRadius={30}
                  w={120}
                  h={30}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Text color={'light.borderColor2'} fontSize={RFValue(14)}>
                    {common.learnMore}
                  </Text>
                </Box>
              </TouchableOpacity>
            </Box>
            {items.map((item, index) => {
              return (
                <Box
                  key={index}
                  style={currentPosition == index ? styles.selectedDot : styles.unSelectedDot}
                />
              );
            })}
          </Box>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );
};

export default OnBoardingSlides;

const styles = StyleSheet.create({
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
