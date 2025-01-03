import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useState, useMemo, useContext } from 'react';
import { StyleSheet } from 'react-native';
import ConciergeHeader from './components/ConciergeHeader';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from '../../components/ContentWrapper';
import { hp, wp } from 'src/constants/responsive';
import ExpertCard from './components/ExpertCard';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Text from 'src/components/KeeperText';
import DisabledOverlay from 'src/components/DisabledOverlay';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import usePlan from 'src/hooks/usePlan';
import DisabledExpertGuidance from './components/DisabledExpertGuidance';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const ExpertGuidance = () => {
  const { colorMode } = useColorMode();
  const { plan } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;
  const [search, setSearch] = useState('');
  const isPleb = plan === SubscriptionTier.L1.toUpperCase();

  const advisorsData = [
    {
      name: 'John Doe',
      location: 'Lahore',
      expertise: ['Inheritance Key', 'Cold Storage', 'Inheritance Key', 'Cold Storage'],
      details: {
        timeZone: 'European Time',
        experience: '5 years',
        language: 'English, Spanish',
        sessionDuration: '30 mins',
      },
      history: {
        totalSession: 10,
        lastSessionRequest: '2 days ago',
      },
    },
    {
      name: 'Jane Smith',
      location: 'New York',
      expertise: ['Cold Storage', 'Investment Planning'],
      details: {
        timeZone: 'Eastern Time',
        experience: '3 years',
        language: 'English, French',
      },
    },
    {
      name: 'Alice Brown',
      location: 'London',
      expertise: ['Inheritance Key', 'Financial Planning'],
      details: {
        timeZone: 'GMT',
        experience: '7 years',
        language: 'English',
      },
      history: {
        totalSession: 10,
        lastSessionRequest: '2 days ago',
      },
    },
  ];

  const filteredAdvisors = useMemo(() => {
    return advisorsData.filter((advisor) => {
      const lowerSearch = search.toLowerCase();

      const matchesName = advisor.name.toLowerCase().includes(lowerSearch);
      const matchesExpertise = advisor.expertise.some((exp) =>
        exp.toLowerCase().includes(lowerSearch)
      );
      const matchesLanguage = advisor.details.language.toLowerCase().includes(lowerSearch);
      const matchesTimeZone = advisor.details.timeZone.toLowerCase().includes(lowerSearch);
      const matchesExperience = advisor.details.experience.toLowerCase().includes(lowerSearch);
      const matchesLocation = advisor.location.toLowerCase().includes(lowerSearch);

      return (
        matchesName ||
        matchesExpertise ||
        matchesLanguage ||
        matchesTimeZone ||
        matchesExperience ||
        matchesLocation
      );
    });
  }, [search, advisorsData]);

  return (
    <ConciergeScreenWrapper backgroundcolor={`${colorMode}.pantoneGreen`} barStyle="light-content">
      <ConciergeHeader title={concierge.expertGuidanceTitle} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <DisabledOverlay visible={isPleb} bottomComponent={<DisabledExpertGuidance />} />
        <Box style={styles.searchBox}>
          <KeeperTextInput
            placeholder={` ${concierge.searchForAnExpert}`}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={`${colorMode}.placeHolderTextColor`}
          />
          <Box style={styles.titleContainer}>
            <Text color={`${colorMode}.pitchBlackText`} fontSize={16}>
              {concierge.meetOurExperts}
            </Text>
          </Box>
        </Box>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredAdvisors.length > 0 ? (
            filteredAdvisors.map((advisorData, index) => (
              <ExpertCard key={index} advisorData={advisorData} />
            ))
          ) : (
            <Box style={styles.noResults}>
              <Text color={`${colorMode}.pitchBlackText`} fontSize={16}>
                {concierge.noExpertsMatch}
              </Text>
            </Box>
          )}
        </ScrollView>
      </ContentWrapper>
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: wp(20),
    paddingVertical: hp(25),
    gap: hp(20),
  },
  searchBox: {
    paddingHorizontal: wp(20),
    paddingTop: hp(15),
  },
  titleContainer: {
    paddingVertical: hp(10),
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(20),
  },
});

export default ExpertGuidance;
