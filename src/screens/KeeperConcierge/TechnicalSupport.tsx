import { Box, useColorMode } from 'native-base';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ConciergeHeader from './components/ConciergeHeader';
import ContentWrapper from 'src/components/ContentWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import TicketHistory from './components/TicketHistory';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import {
  loadConciergeTickets,
  setConciergeUserFailed,
  setOnboardCallFailed,
  setOnboardCallSuccess,
} from 'src/store/reducers/concierge';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import SuccessCircleIllustration from 'src/assets/images/illustration.svg';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Zendesk from 'src/services/backend/Zendesk';
import useToastMessage from 'src/hooks/useToastMessage';
import { CreateTicketCTA } from './components/CreateTicketCTA';
import { showOnboarding } from 'src/store/reducers/concierge';
import { useAppSelector } from 'src/store/hooks';
import { loadConciergeUser, scheduleOnboardingCall } from 'src/store/sagaActions/concierge';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import Buttons from 'src/components/Buttons';
import OnboardingCall from 'src/assets/images/onboardingCall.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { emailCheck } from 'src/utils/utilities';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'TechnicalSupport'>;
const TechnicalSupport = ({ route }: ScreenProps) => {
  const { dontShowConceirgeOnboarding } = useAppSelector((state) => state.storage);
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const {
    conciergeUser,
    conciergeLoading,
    conciergeUserFailed,
    onboardCallSuccess,
    onboardCallFailed,
  } = useAppSelector((state) => state?.concierge);

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const {
    newTicketId = '',
    ticketCreated = false,
    screenName = '',
    tags = [],
  } = route.params || {};
  const { showToast } = useToastMessage();
  const [modalTicketId, setModalTicketId] = useState('');
  const [onboardCall, setOnboardCall] = useState(false);

  useEffect(() => {
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

  useFocusEffect(
    useCallback(() => {
      if (ticketCreated && newTicketId) {
        setShowModal(true);
        getTickets();
        setModalTicketId(newTicketId);
        // @ts-ignore
        navigation.setParams({ ticketCreated: false, newTicketId: '' });
      }
    }, [route.params])
  );

  useEffect(() => {
    if (onboardCallSuccess) {
      dispatch(setOnboardCallSuccess(false));
      showToast(
        'Your onboarding call scheduled successfully. Please check your email for confirmation'
      );
    }
  }, [onboardCallSuccess]);

  useEffect(() => {
    if (onboardCallFailed) {
      dispatch(setOnboardCallFailed(false));
      showToast('Something went wrong. Please try again!.', <ToastErrorIcon />);
    }
  }, [onboardCallFailed]);

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

  const closeModal = () => {
    setShowModal(false);
    setModalTicketId('');
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
      backgroundcolor={`${colorMode}.pantoneGreen`}
      barStyle="light-content"
      loading={loading || conciergeLoading}
    >
      <ConciergeHeader title={'Keeper Concierge'} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <TicketHistory onPressCTA={() => setOnboardCall(true)} />
        <CreateTicketCTA
          onPress={() =>
            navigation.dispatch(
              CommonActions.navigate({
                name: 'CreateTicket',
                params: {
                  screenName,
                  tags,
                },
              })
            )
          }
        />
      </ContentWrapper>
      <KeeperModal
        visible={showModal}
        title="Support Ticket Raised"
        subTitle={`Your ticket reference number is #${modalTicketId}`}
        close={closeModal}
        showCloseIcon
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        buttonText={'Okay'}
        buttonCallback={closeModal}
        Content={() => (
          <Box style={styles.modal}>
            <SuccessCircleIllustration style={styles.illustration} />
            <Text color={`${colorMode}.secondaryText`} style={styles.modalDesc}>
              Hi! Acknowledging your message. Someone from the team will get back to you shortly.
            </Text>
          </Box>
        )}
      />
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
  modal: {
    alignItems: 'center',
  },
  modalDesc: {
    width: '95%',
  },
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
  },
});

const OnboardCallContent = ({ submitOnboardEmail }) => {
  const { colorMode } = useColorMode();
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
      <OnboardingCall style={styles.illustration} />
      <Text color={`${colorMode}.secondaryText`} style={styles.onboardCallModalTitle}>
        {conciergeText.onboardingCallTitle}
      </Text>
      <Text
        color={`${colorMode}.secondaryText`}
        style={styles.onboardCallModalSubTitle}
        fontSize={12}
      >
        {conciergeText.onboardingCallSubTitle}
      </Text>
      <KeeperTextInput
        placeholder={'Enter your email address'}
        value={onboardEmail}
        onChangeText={setOnboardEmail}
        keyboardType="email-address"
        isError={emailError}
        autoCapitalize={'none'}
        autoCorrect={false}
      />
      <Buttons
        primaryText={conciergeText.onboardingCallCTA}
        primaryCallback={validateEmail}
        fullWidth
      />
    </>
  );
};

export default TechnicalSupport;
