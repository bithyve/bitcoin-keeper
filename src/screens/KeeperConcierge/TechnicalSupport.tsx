import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ContentWrapper from 'src/components/ContentWrapper';
import { Image, StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import TicketHistory from './components/TicketHistory';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  loadConciergeTickets,
  setAccountManagerDetails,
  setConciergeUserFailed,
  setOnboardCallFailed,
  setOnboardCallSuccess,
} from 'src/store/reducers/concierge';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Zendesk from 'src/services/backend/Zendesk';
import useToastMessage from 'src/hooks/useToastMessage';
import { showOnboarding } from 'src/store/reducers/concierge';
import { useAppSelector } from 'src/store/hooks';
import { loadConciergeUser, scheduleOnboardingCall } from 'src/store/sagaActions/concierge';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { emailCheck } from 'src/utils/utilities';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { AccountManagerCard } from './components/AccountManagerCard';
import Relay from 'src/services/backend/Relay';
import useSubscriptionLevel from 'src/hooks/useSubscriptionLevel';
import { AppSubscriptionLevel } from 'src/models/enums/SubscriptionTier';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'CreateTicket'>;
const TechnicalSupport = ({ route }: ScreenProps) => {
  const { dontShowConceirgeOnboarding, appId } = useAppSelector((state) => state.storage);
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const {
    accountManagerDetails,
    conciergeUser,
    conciergeLoading,
    conciergeUserFailed,
    onboardCallSuccess,
    onboardCallFailed,
  } = useAppSelector((state) => state?.concierge);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { screenName = '', tags = [] } = route.params || {};
  const { showToast } = useToastMessage();
  const [onboardCall, setOnboardCall] = useState(false);
  const [isKeeperPrivate, setIsKeeperPrivate] = useState(
    useSubscriptionLevel().level === AppSubscriptionLevel.L4
  );

  useEffect(() => {
    if (isKeeperPrivate) {
      if (!accountManagerDetails) {
        getAccountManagerDetails();
        return;
      }
    }
  }, []);

  useEffect(() => {
    if (isKeeperPrivate) return;
    if (!dontShowConceirgeOnboarding) dispatch(showOnboarding());
    if (conciergeUser !== null) getTickets();
    else dispatch(loadConciergeUser());
  }, [conciergeUser]);

  useEffect(() => {
    if (conciergeUserFailed == true) {
      dispatch(setConciergeUserFailed(false));
      showToast('Something went wrong. Please try again!.', <ToastErrorIcon />);
      navigation.dispatch(CommonActions.goBack());
    }
  }, [conciergeUserFailed]);

  useEffect(() => {
    if (onboardCallSuccess) {
      dispatch(setOnboardCallSuccess(false));
      showToast('Please check your email to schedule the time for your call.', <TickIcon />);
    }
  }, [onboardCallSuccess]);

  useEffect(() => {
    if (onboardCallFailed) {
      dispatch(setOnboardCallFailed(false));
      showToast('Something went wrong. Please try again!.', <ToastErrorIcon />);
    }
  }, [onboardCallFailed]);

  const getAccountManagerDetails = async () => {
    setLoading(true);
    try {
      const res = await Relay.getAccountManagerDetails(appId);
      if (res) {
        dispatch(setAccountManagerDetails(res));
      } else {
        showToast('Account manager is unavailable. Please contact concierge', <ToastErrorIcon />);
        setIsKeeperPrivate(false);
        dispatch(setAccountManagerDetails(null));
      }
    } catch (error) {
      console.log('🚀 ~ getAccountManagerDetails ~ error:', error);
      showToast('Something went wrong, Please try again!', <ToastErrorIcon />);
    } finally {
      setLoading(false);
    }
  };

  const getTickets = async () => {
    setLoading(true);
    try {
      const res = await Zendesk.fetchZendeskTickets(conciergeUser.id);
      if (res.status === 200) {
        dispatch(loadConciergeTickets(res.data.tickets));
      }
    } catch (error) {
      console.log('🚀 ~ getTickets ~ error:', error);
      showToast('Something went wrong, Please try again!', <ToastErrorIcon />);
    } finally {
      setLoading(false);
    }
  };

  const closeOnboardCall = () => {
    setOnboardCall(false);
  };

  const submitOnboardEmail = async (onboardEmail: string) => {
    setOnboardCall(false);
    dispatch(scheduleOnboardingCall(onboardEmail));
  };

  return (
    <ConciergeScreenWrapper
      barStyle="light-content"
      loading={loading || conciergeLoading}
      wrapperStyle={{ paddingTop: hp(0) }}
    >
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        {isKeeperPrivate ? (
          accountManagerDetails ? (
            <AccountManagerCard data={accountManagerDetails} />
          ) : (
            <></>
          )
        ) : (
          <TicketHistory
            onPressCTA={() => setOnboardCall(true)}
            screenName={screenName}
            tags={tags}
            navigation={navigation}
          />
        )}
      </ContentWrapper>
      <KeeperModal
        visible={onboardCall}
        close={closeOnboardCall}
        showCloseIcon
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        Content={() => OnboardCallContent({ submitOnboardEmail })}
      />
    </ConciergeScreenWrapper>
  );
};

const styles = StyleSheet.create({
  illustration: {
    marginBottom: hp(20),
    marginRight: wp(15),
    alignSelf: 'center',
  },
  onboardCallModalTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: wp(30),
    marginBottom: hp(18),
  },
  onboardCallModalSubTitle: {
    textAlign: 'center',
    marginHorizontal: wp(18),
    marginBottom: hp(18),
  },
  onboardCallModalIllustration: {
    width: wp(170),
    height: hp(173),
    alignSelf: 'center',
    marginBottom: hp(20),
  },
});

const OnboardCallContent = ({ submitOnboardEmail }) => {
  const { colorMode } = useColorMode();
  const illustration =
    colorMode === 'dark'
      ? require('src/assets/images/onboardingCallDark.png')
      : require('src/assets/images/onboardingCall.png');
  const { concierge: conciergeText } = useContext(LocalizationContext).translations;
  const [onboardEmail, setOnboardEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  const validateEmail = () => {
    if (!emailCheck(onboardEmail)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    submitOnboardEmail(onboardEmail.toLowerCase());
  };

  return (
    <>
      <Image
        source={illustration}
        style={styles.onboardCallModalIllustration}
        resizeMode="contain"
      />
      <Text color={`${colorMode}.secondaryText`} style={styles.onboardCallModalTitle}>
        {conciergeText.onboardingCallTitle}
      </Text>
      <Text
        color={`${colorMode}.secondaryText`}
        style={styles.onboardCallModalSubTitle}
        fontSize={13}
      >
        {conciergeText.onboardingCallSubTitle}
      </Text>
      <KeeperTextInput
        placeholder={conciergeText.enterYourEmailAddress}
        value={onboardEmail}
        onChangeText={setOnboardEmail}
        keyboardType="email-address"
        isError={emailError}
        autoCapitalize={'none'}
        autoCorrect={false}
      />
      <Box marginTop={hp(10)}>
        <Buttons
          primaryText={conciergeText.onboardingCallCTA}
          primaryCallback={validateEmail}
          fullWidth
        />
      </Box>
    </>
  );
};

export default TechnicalSupport;
