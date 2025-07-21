import React, { useContext, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import ChatRoomHeader from './component/ChatRoomHeader';
import ChatRoom from './component/ChatRoom';
import ProfileContent from './component/ProfileContent';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type ChatRoomParams = {
  ChatRoomScreen: {
    receiverProfileImage: string;
    receiverProfileName: string;
    userProfileImage: string;
  };
};

const ChatRoomScreen = () => {
  const { colorMode } = useColorMode();
  const route = useRoute<RouteProp<ChatRoomParams, 'ChatRoomScreen'>>();
  const { receiverProfileImage, receiverProfileName, userProfileImage } = route.params;
  const [editReceiverProfileName, setEditReceiverProfileName] = useState(receiverProfileName);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editUserProfileImage, setEditUserProfileImage] = useState(receiverProfileImage);
  const { translations } = useContext(LocalizationContext);
  const { contactText } = translations;

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
      <ChatRoomHeader
        receiverProfileImage={editUserProfileImage}
        receiverProfileName={editReceiverProfileName}
        setOpenEditModal={setOpenEditModal}
      />
      <ChatRoom userProfileImage={userProfileImage} receiverProfileImage={editUserProfileImage} />
      <KeeperModal
        visible={openEditModal}
        close={() => setOpenEditModal(false)}
        title={contactText?.editContactName}
        textColor={`${colorMode}.textGreen`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <>
            <ProfileContent
              setUserProfileImage={setEditUserProfileImage}
              setUserProfileName={setEditReceiverProfileName}
              setCreateProfile={setOpenEditModal}
              userProfileImage={editUserProfileImage}
              userProfileName={editReceiverProfileName}
            />
          </>
        )}
      />
    </Box>
  );
};

export default ChatRoomScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
