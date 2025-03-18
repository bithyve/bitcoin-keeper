import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert, StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { Text, useColorMode } from 'native-base';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import useToastMessage from './useToastMessage';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { notificationType } from 'src/models/enums/Notifications';
import { useDispatch } from 'react-redux';
import { addTicketStatusUAI } from 'src/store/sagaActions/concierge';
import { uaiType } from 'src/models/interfaces/Uai';
import { uaiChecks } from 'src/store/sagaActions/uai';

const NotificationHandler = () => {
  const [showNotifcationModal, setShowNotifcationModal] = useState(false);
  const [showRemoteNotificationModel, setShowRemoteNotificationModel] = useState(false);
  const [foregroundNotifcation, setForegroundNotifcation] = useState<any>({});
  const [showLoader, setShowLoader] = useState(false);
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.data?.notificationType === notificationType.REMOTE_KEY_SHARE) {
        setForegroundNotifcation(remoteMessage);
        setShowRemoteNotificationModel(true);
      } else if (remoteMessage.data?.notificationType === notificationType.ZENDESK_TICKET) {
        const { ticketId = null, ticketStatus = null } = remoteMessage.data;
        if (ticketId && ticketStatus) {
          dispatch(addTicketStatusUAI(ticketId, ticketStatus, remoteMessage.notification.body));
          dispatch(uaiChecks([uaiType.ZENDESK_TICKET]));
        }
      } else {
        setForegroundNotifcation(remoteMessage);
        setShowNotifcationModal(true);
      }
    });

    return unsubscribe;
  }, []);

  const declineRequest = async () => {
    try {
      const requestId = foregroundNotifcation?.data?.reqId;
      if (requestId) {
        setShowLoader(true);
        const res = await InheritanceKeyServer.declineInheritanceKeyRequest(requestId);
        if (res?.declined) {
          setShowLoader(false);
          showToast('IKS request declined');
          setShowNotifcationModal(false);
        } else {
          setShowLoader(false);
          Alert.alert('Something went Wrong!');
        }
      } else {
        Alert.alert('Something went Wrong: Request ID missing');
      }
    } catch (err) {
      setShowLoader(false);
      Alert.alert('Something went Wrong!');
      console.log('Error in declining request');
    }
  };

  return (
    <>
      <KeeperModal
        visible={showNotifcationModal}
        close={() => {
          setShowNotifcationModal(false);
        }}
        showCloseIcon={true}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        title={'Inheritance Key request'}
        subTitle={foregroundNotifcation?.notification?.title}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonText={'Decline'}
        buttonCallback={() => declineRequest()}
        Content={() => (
          <Text style={styles.contentText}>{foregroundNotifcation?.notification?.body}</Text>
        )}
      />
      <KeeperModal
        visible={showRemoteNotificationModel}
        close={() => {
          setShowRemoteNotificationModel(false);
        }}
        showCloseIcon={true}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        title={foregroundNotifcation?.notification?.title}
        subTitle={foregroundNotifcation?.notification?.body}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonText={'Ok'}
        buttonCallback={() => setShowRemoteNotificationModel(false)}
      />
      <ActivityIndicatorView visible={showLoader} showLoader />
    </>
  );
};

const styles = StyleSheet.create({
  contentText: {
    color: 'black',
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
  },
});

export default NotificationHandler;
