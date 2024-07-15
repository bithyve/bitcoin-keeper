import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert, StyleSheet } from 'react-native';
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
      setForegroundNotifcation(remoteMessage);
      setShowNotifcationModal(true);
    });

    return unsubscribe;
  }, []);

  const declineRequest = async () => {
    try {
      const requestId = foregroundNotifcation?.data?.reqId;
      if (requestId) {
        setShowLoader(true);
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
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        buttonTextColor={`${colorMode}.white`}
        buttonText={'Decline'}
        buttonCallback={() => declineRequest()}
        Content={() => (
          <Text style={styles.contentText}>{foregroundNotifcation?.notification?.body}</Text>
        )}
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
