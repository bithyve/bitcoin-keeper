import { Image, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import ConciergeHeader from './components/ConciergeHeader';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from '../../components/ContentWrapper';
import HelpCard from './components/HelpCard';
import SendLight from 'src/assets/images/send-light.svg';
import SendDark from 'src/assets/images/send-dark.svg';
import KBOutlineLight from 'src/assets/images/kb-outline-light.svg';
import KBOutlineDark from 'src/assets/images/kb-outline-dark.svg';
import TechnicalSupportLight from 'src/assets/images/technical-support-light.svg';
import TechnicalSupportDark from 'src/assets/images/technical-support-dark.svg';
import AdvisorLight from 'src/assets/images/calendar-light.svg';
import AdvisorDark from 'src/assets/images/calendar-dark.svg';
import { hp, wp } from 'src/constants/responsive';
import TicketCount from './components/TicketCount';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import StackedCirclesList from '../Vault/components/StackedCircleList';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ConciergeTag, goToConcierge, loadConciergeUser } from 'src/store/sagaActions/concierge';
import { useDispatch } from 'react-redux';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import useToastMessage from 'src/hooks/useToastMessage';
import { setConciergeUserFailed, setConciergeUserSuccess } from 'src/store/reducers/concierge';
import usePlan from 'src/hooks/usePlan';
import { useAppSelector } from 'src/store/hooks';
import { showOnboarding } from 'src/store/reducers/concierge';
import KbCtaLight from 'src/assets/images/kb-cta-light.svg';
import KbCtaDark from 'src/assets/images/kb-cta-dark.svg';

const KeeperConcierge = () => {
  const { dontShowConceirgeOnboarding } = useAppSelector((state) => state.storage);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { params } = useRoute();
  const { translations } = useContext(LocalizationContext);
  const { concierge } = translations;
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { showToast } = useToastMessage();
  const { conciergeUser, conciergeLoading, conciergeUserSuccess, conciergeUserFailed } =
    useAppSelector((store) => store.concierge);
  const { isOnL1 } = usePlan();

  useEffect(() => {
    if (!dontShowConceirgeOnboarding) dispatch(showOnboarding());
  }, []);

  useEffect(() => {
    if (conciergeUserSuccess == true) {
      navigation.dispatch(CommonActions.navigate({ name: 'TechnicalSupport' }));
      dispatch(setConciergeUserSuccess(false));
    }
  }, [conciergeUserSuccess]);

  useEffect(() => {
    if (conciergeUserFailed == true) {
      dispatch(setConciergeUserFailed(false));
      showToast('Something went wrong');
    }
  }, [conciergeUserFailed]);

  const placeHolders = [
    {
      Icon: (
        <Image
          source={require('src/assets/images/person-placeholder-1.jpeg')}
          style={{ width: wp(29), height: wp(29) }}
        />
      ),
      backgroundColor: `${colorMode}.greyBackground`,
    },
    {
      Icon: (
        <Image
          source={require('src/assets/images/person-placeholder-2.jpeg')}
          style={{ width: wp(29), height: wp(29) }}
        />
      ),
      backgroundColor: `${colorMode}.greyBackground`,
    },
  ];

  const cardsData = [
    {
      title: concierge.smartHelpTitle,
      description: concierge.smartHelpDescription,
      LeftComponent: (
        <CircleIconWrapper
          icon={isDarkMode ? <KBOutlineDark /> : <KBOutlineLight />}
          width={wp(35)}
          backgroundColor={`${colorMode}.greyBackground`}
        />
      ),
      buttonText: concierge.smartHelpButtonText,
      buttonIcon: isDarkMode ? KbCtaDark : KbCtaLight,
      titleComponent: null,
      buttonCallback: () => {
        dispatch(goToConcierge([], ConciergeTag.KEEPER_CONCIERGE));
      },
    },
    {
      title: concierge.technicalSupportTitle,
      description: concierge.technicalSupportDescription,
      LeftComponent: (
        <CircleIconWrapper
          icon={isDarkMode ? <TechnicalSupportLight /> : <TechnicalSupportDark />}
          width={wp(35)}
          backgroundColor={`${colorMode}.greyBackground`}
        />
      ),
      buttonText: concierge.technicalSupportButtonText,
      buttonIcon: isDarkMode ? SendDark : SendLight,
      titleComponent: isOnL1 ? <TicketCount count={1} /> : null,
      titleComonentStyle: { justifyContent: 'space-between' },
      buttonCallback: () => {
        checkConciergeUser();
      },
    },
    {
      title: concierge.expertGuidanceTitle,
      description: concierge.expertGuidanceDescription,
      LeftComponent: (
        <StackedCirclesList
          reverse
          width={wp(29)}
          height={wp(29)}
          itemDistance={wp(-15)}
          borderColor={`${colorMode}.pantoneGreen`}
          items={placeHolders}
        />
      ),
      buttonText: concierge.expertGuidanceButtonText,
      buttonIcon: isDarkMode ? AdvisorDark : AdvisorLight,
      buttonCallback: () => {
        navigation.dispatch(CommonActions.navigate({ name: 'ExpertGuidance' }));
      },
    },
  ];

  const checkConciergeUser = () => {
    if (conciergeUser !== null) {
      navigation.dispatch(CommonActions.navigate({ name: 'TechnicalSupport', params }));
      return;
    }
    dispatch(loadConciergeUser());
  };

  return (
    <ConciergeScreenWrapper
      backgroundcolor={`${colorMode}.pantoneGreen`}
      barStyle="light-content"
      loading={conciergeLoading}
    >
      <ConciergeHeader title={concierge.conciergeTitle} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cardsData.map((card, index) => (
            <HelpCard key={index} {...card} />
          ))}
        </ScrollView>
      </ContentWrapper>
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: wp(25),
    paddingVertical: hp(25),
    gap: hp(20),
  },
});

export default KeeperConcierge;
