import { Box, useColorMode } from 'native-base';
import React, { useCallback, useEffect, useState } from 'react';
import ConciergeScreenWrapper from './components/ConciergeScreenWrapper';
import ConciergeHeader from './components/ConciergeHeader';
import ContentWrapper from 'src/components/ContentWrapper';
import { StyleSheet } from 'react-native';
import { hp, wp } from 'src/constants/responsive';
import TicketHistory from './components/TicketHistory';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadConciergeTickets } from 'src/store/reducers/concierge';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import SuccessCircleIllustration from 'src/assets/images/illustration.svg';
import { AppStackParams } from 'src/navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Zendesk from 'src/services/backend/Zendesk';
import useToastMessage from 'src/hooks/useToastMessage';
import { CreateTicketCTA } from './components/CreateTicketCTA';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'TechnicalSupport'>;
const TechnicalSupport = ({ route }: ScreenProps) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { conciergeUser } = useSelector((state) => state?.concierge);

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

  useEffect(() => {
    getTickets();
  }, []);

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

  const getTickets = async () => {
    setLoading(true);
    try {
      const res = await Zendesk.fetchZendeskTickets(conciergeUser.id);
      if (res.status === 200) {
        dispatch(loadConciergeTickets(res.data.tickets));
      }
    } catch (error) {
      console.log('🚀 ~ getTickets ~ error:', error);
      showToast('Something went wrong, Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalTicketId('');
  };

  return (
    <ConciergeScreenWrapper
      backgroundcolor={`${colorMode}.pantoneGreen`}
      barStyle="light-content"
      loading={loading}
    >
      <ConciergeHeader title={'Keeper Concierge'} />
      <ContentWrapper backgroundColor={`${colorMode}.primaryBackground`}>
        <TicketHistory />
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
        subTitle={`Your reference number is #${modalTicketId}`}
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
              Our team will get in touch with you within 48 to 72 hours. If you require any quick
              help, please refer to Keeper AI chatbot
            </Text>
          </Box>
        )}
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
  },
});

export default TechnicalSupport;
