import { Box, Image, ScrollView, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
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
import { CommonActions, useNavigation } from '@react-navigation/native';

const ProfileHeader = ({ advisorData }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';

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
            <CardPill key={index} heading={item} />
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

  return (
    <ConciergeScreenWrapper backgroundcolor={`${colorMode}.pantoneGreen`} barStyle="light-content">
      <ConciergeHeader title={'Expert Profile'} />
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
            primaryText="Request Free Consultation"
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
    paddingVertical: hp(15),
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
  },
});

export default ExpertProfile;
