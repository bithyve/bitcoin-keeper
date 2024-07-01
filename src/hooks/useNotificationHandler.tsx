import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { Text, useColorMode } from 'native-base';
import InheritanceKeyServer from 'src/services/backend/InheritanceKey';
import useToastMessage from './useToastMessage';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';

const NotificationHandler = () => {
  const [showNotifcationModal, setShowNotifcationModal] = useState(false);
  const [foregroundNotifcation, setForegroundNotifcation] = useState<any>({});
  const [showLoader, setShowLoader] = useState(false);
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      setForegroundNotifcation(remoteMessage);
    });

    return unsubscribe;
  }, []);

  const declineRequest = async () => {
    try {
      setShowLoader(true);
      if (foregroundNotifcation?.notification?.data?.reqId) {
        const res = await InheritanceKeyServer.declineInheritanceKeyRequest(
          foregroundNotifcation.notification.data.reqId
        );
        if (res?.declined) {
          setShowLoader(false);
          showToast('IKS request declined');
          setShowNotifcationModal(false);
        } else {
          setShowLoader(false);
          Alert.alert('Something went Wrong!');
        }
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
        showCloseIcon={false}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        title={'Inheritance Key request'}
        subTitle={foregroundNotifcation.notification.title}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonText={'Decline'}
        buttonCallback={() => declineRequest()}
        Content={() => <Text>{foregroundNotifcation.notification.body}</Text>}
      />
      <ActivityIndicatorView visible={showLoader} showLoader />
    </>
  );
};

export default NotificationHandler;
