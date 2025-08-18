import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import ChatRoomHeader from './component/ChatRoomHeader';
import ChatRoom from './component/ChatRoom';
import ProfileContent from './component/ProfileContent';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import { useObject, useQuery } from '@realm/react';
import { Community, Message } from 'src/services/p2p/interface';
import { useChatPeer } from 'src/hooks/useChatPeer';

type ChatRoomParams = {
  ChatRoomScreen: {
    communityId: string;
  };
};

const ChatRoomScreen = () => {
  const { colorMode } = useColorMode();
  const route = useRoute<RouteProp<ChatRoomParams, 'ChatRoomScreen'>>();
  const { communityId } = route.params;
  const [openEditModal, setOpenEditModal] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { contactText } = translations;
  const app: KeeperApp = useQuery(RealmSchema.KeeperApp)[0];
  const community = useObject<Community>(RealmSchema.Community, communityId);
  const messages = useQuery<Message>(RealmSchema.Message)
    .filtered('communityId = $0', communityId)
    .sorted('createdAt', true);
  const { markCommunityAsRead } = useChatPeer();

  const [editUserProfileImage, setEditUserProfileImage] = useState('');
  const [editReceiverProfileName, setEditReceiverProfileName] = useState(community.name);

  useEffect(() => {
    // mark messages are read
    const unreadMsgId = messages.filter((msg) => msg.unread).map((msg) => msg.id);
    if (unreadMsgId.length) markCommunityAsRead(communityId);
  }, []);

  return (
    <Box style={styles.container} backgroundColor={`${colorMode}.primaryBackground`}>
      <ChatRoomHeader
        receiverProfileImage={''}
        receiverProfileName={editReceiverProfileName}
        setOpenEditModal={setOpenEditModal}
      />
      <ChatRoom
        userProfileImage={''}
        receiverProfileImage={''}
        messages={messages}
        community={community}
      />
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
