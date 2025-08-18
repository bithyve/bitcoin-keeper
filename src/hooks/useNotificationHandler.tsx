import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { useColorMode } from 'native-base';
import { notificationType } from 'src/models/enums/Notifications';
import { useDispatch } from 'react-redux';
import { addTicketStatusUAI } from 'src/store/sagaActions/concierge';
import { uaiType } from 'src/models/interfaces/Uai';
import { addToUaiStack, uaiChecks } from 'src/store/sagaActions/uai';

const NotificationHandler = () => {
  const [showRemoteNotificationModel, setShowRemoteNotificationModel] = useState(false);
  const [foregroundNotifcation, setForegroundNotifcation] = useState<any>({});
  const { colorMode } = useColorMode();
  const dispatch = useDispatch();
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      if (remoteMessage.data?.notificationType === notificationType.CONTACTS) {
        dispatch(addToUaiStack({ uaiType: uaiType.CONTACTS }));
        dispatch(uaiChecks([uaiType.CONTACTS]));
      } else if (remoteMessage.data?.notificationType === notificationType.REMOTE_KEY_SHARE) {
        setForegroundNotifcation(remoteMessage);
        setShowRemoteNotificationModel(true);
      } else if (remoteMessage.data?.notificationType === notificationType.ZENDESK_TICKET) {
        const { ticketId = null, ticketStatus = null } = remoteMessage.data;
        if (ticketId && ticketStatus) {
          dispatch(addTicketStatusUAI(ticketId, ticketStatus, remoteMessage.notification.body));
          dispatch(uaiChecks([uaiType.ZENDESK_TICKET]));
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
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
    </>
  );
};

const styles = StyleSheet.create({});

export default NotificationHandler;
