import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import ConciergeHeader from './components/ConciergeHeader';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from '../../components/ContentWrapper';
import { hp, wp } from 'src/constants/responsive';
import ExpertCard, { ExpertExpertise } from './components/ExpertCard';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Text from 'src/components/KeeperText';
import DisabledOverlay from 'src/components/DisabledOverlay';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import usePlan from 'src/hooks/usePlan';
import DisabledExpertGuidance from './components/DisabledExpertGuidance';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import Relay from 'src/services/backend/Relay';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { useNavigation } from '@react-navigation/native';

const ExpertGuidance = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { plan } = usePlan();
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;
  const [search, setSearch] = useState('');
  const isPleb = plan === SubscriptionTier.L1.toUpperCase();
  const [advisors, setAdvisors] = useState(null);
  const allAdvisors = useRef(null);
  const { showToast } = useToastMessage();

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    try {
      const response = await Relay.fetchAdvisorsList();
      allAdvisors.current = response;
      setAdvisors(response);
    } catch (error) {
      showToast('Something went wrong. Please try again later.', <ToastErrorIcon />);
      navigation.goBack();
    }
  };

  const filteredAdvisors = useMemo(() => {
    if (!search.length) return allAdvisors?.current;
    return allAdvisors?.current?.filter((advisor) => {
      const lowerSearch = search.toLowerCase();

      const matchesName = advisor.name.toLowerCase().includes(lowerSearch);
      const matchesExpertise = advisor.expertise.some((exp: ExpertExpertise) =>
        exp.expertise.toLowerCase().includes(lowerSearch)
      );
      const matchesLanguage = advisor.details.language.some((lang: string) =>
        lang.toLowerCase().includes(lowerSearch)
      );
      const matchesTimeZone = advisor.details.timezone.toLowerCase().includes(lowerSearch);
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
  }, [search]);

  useEffect(() => {
    if (allAdvisors.current) {
      setAdvisors(filteredAdvisors);
    }
  }, [search]);

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
          {!advisors ? (
            <ActivityIndicator size="large" animating color="#00836A" />
          ) : advisors?.length > 0 ? (
            advisors.map((advisorData, index: number) => (
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
