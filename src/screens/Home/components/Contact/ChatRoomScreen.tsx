import React, { useState } from 'react';
import ChatRoomHeader from './components/ChatRoomHeader';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import EditModalContent from './components/EditModalContent';

type ChatRoomParams = {
  ChatRoomScreen: {
    receiverProfileImage: string;
    receiverProfileName: string;
  };
};

const ChatRoomScreen = () => {
  const { colorMode } = useColorMode();
  const route = useRoute<RouteProp<ChatRoomParams, 'ChatRoomScreen'>>();
  const { receiverProfileImage, receiverProfileName } = route.params;
  const [editReceiverProfileName, setEditReceiverProfileName] = useState(receiverProfileName);
  const [openEditModal, setOpenEditModal] = useState(false);

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
      <ChatRoomHeader
        receiverProfileImage={receiverProfileImage}
        receiverProfileName={editReceiverProfileName}
        setOpenEditModal={setOpenEditModal}
      />
      {/* <Text>Chat Room Screen</Text> */}
      <KeeperModal
        visible={openEditModal}
        close={() => setOpenEditModal(false)}
        title="Edit Contact Name"
        textColor={`${colorMode}.textGreen`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <EditModalContent
            setEditReceiverProfileName={setEditReceiverProfileName}
            editReceiverProfileName={editReceiverProfileName}
            setOpenEditModal={setOpenEditModal}
          />
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
