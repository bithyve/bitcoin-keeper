import { Box, Image, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import ConciergeHeader from './components/ConciergeHeader';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from '../../components/ContentWrapper';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import MapPinLight from 'src/assets/images/map-pin-light.svg';
import MapPinDark from 'src/assets/images/map-pin-dark.svg';
import CardPill from 'src/components/CardPill';
import DetailsCard from './components/DetailsCard';
import Buttons from 'src/components/Buttons';
import CalendarLight from 'src/assets/images/calendar-light.svg';
import CalendarDark from 'src/assets/images/calendar-dark.svg';
import ShareArrowlight from 'src/assets/images/share-arrow-cream.svg';
import ShareArrowDark from 'src/assets/images/share-arrow-white.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import Share from 'react-native-share';
import { sha256 } from 'bitcoinjs-lib/src/crypto';

const ProfileHeader = ({ advisorData }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  function getTagColor(tag) {
    const tagHash = sha256(tag).toString('hex');
    const num = parseInt(tagHash.slice(0, 8), 16);
    const labelColorsCount = 10;
    const colorIndex = (num % labelColorsCount) + 1;
    return `${colorMode}.tagColor${colorIndex}`;
  }

  return (
    <Box>
      <Box style={styles.separator} backgroundColor={`${colorMode}.pantoneGreen`} />
      <Box style={styles.profileImageContainer}>
        <Image
          source={require('src/assets/images/person-placeholder-1.jpeg')}
          style={styles.profileImage}
          borderWidth={1}
          borderColor={`${colorMode}.pantoneGreen`}
        />
        <Text color={`${colorMode}.pitchBlackText`} fontSize={20} medium>
          {advisorData?.name}
        </Text>
        <Box style={styles.locationContainer}>
          {isDarkMode ? <MapPinDark /> : <MapPinLight />}
          <Text color={`${colorMode}.GreyText`} fontSize={13}>
            {advisorData?.location}
          </Text>
        </Box>
        <Box style={styles.expertiseContainer}>
          {advisorData?.expertise?.map((item, index) => (
            <CardPill
              key={index}
              heading={item}
              backgroundColor={getTagColor(item)}
              headingColor={`${colorMode}.seashellWhiteText`}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const ExpertProfile = ({ route }) => {
  const { advisorData } = route.params;
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

  const shareAdvisorDetails = () => {
    const shareOptions = {
      title: 'Share Advisor Details',
      message: `Check out this expert advisor: ${advisorData?.name}\n\nLocation: ${
        advisorData?.location
      }\nExpertise: ${advisorData?.expertise?.join(', ')}\n\nLearn more and book a consultation.`,
    };

    Share.open(shareOptions)
      .then((res) => console.log('Share response:', res))
      .catch((err) => console.log('Error sharing:', err));
  };

  return (
    <ConciergeScreenWrapper backgroundcolor={`${colorMode}.pantoneGreen`} barStyle="light-content">
      <ConciergeHeader
        title={'Expert Profile'}
        rightComponent={
          <Pressable onPress={shareAdvisorDetails}>
            <Box style={styles.shareButton}>
              {isDarkMode ? <ShareArrowDark /> : <ShareArrowlight />}
            </Box>
          </Pressable>
        }
      />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.profileHeaderContainer}>
          <ProfileHeader advisorData={advisorData} />
        </Box>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {advisorData?.details && (
            <DetailsCard title={'Expert Details'} advisorDetails={advisorData?.details} />
          )}
          {advisorData?.history && (
            <DetailsCard title={'User History'} advisorDetails={advisorData?.history} />
          )}
        </ScrollView>
        <Box style={styles.buttonContainer}>
          <Buttons
            primaryText="Schedule Session"
            primaryCallback={() => {
              navigation.dispatch(
                CommonActions.navigate({
                  name: 'ScheduleConsultation',
                  params: { screenName: '', tags: [] },
                })
              );
            }}
            RightIcon={isDarkMode ? CalendarDark : CalendarLight}
            fullWidth
            primaryFontWeight="500"
          />
        </Box>
      </ContentWrapper>
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingLeft: wp(30),
    paddingRight: wp(27),
    paddingBottom: hp(35),
    gap: hp(20),
  },
  profileHeaderContainer: {
    marginBottom: hp(-30),
  },
  separator: {
    paddingBottom: '15%',
  },
  profileImageContainer: {
    top: -wp(55),
    bottom: 0,
    left: '7.25%',
  },
  profileImage: {
    width: wp(105),
    height: wp(105),
    borderRadius: wp(105) / 2,
    marginBottom: hp(10),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  expertiseContainer: {
    width: '85%',
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: wp(5),
    marginTop: hp(10),
  },
  buttonContainer: {
    alignItems: 'center',
    paddingHorizontal: wp(32),
    paddingVertical: hp(20),
  },
  shareButton: {
    marginRight: wp(15),
    height: wp(40),
    width: wp(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ExpertProfile;
