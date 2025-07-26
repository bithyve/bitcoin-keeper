import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import ContactHeader from './ContactHeader';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import ConciergeIcon from 'src/assets/images/faqWhiteIcon.svg';
import Colors from 'src/theme/Colors';
import PinIcon from 'src/assets/images/Pin.svg';
import ChatList from './ChatList';
import Buttons from 'src/components/Buttons';
import ContactAddicon from 'src/assets/images/contact-add-icon.svg';
import KeeperModal from 'src/components/KeeperModal';
import ProfileContent from './ProfileContent';
import { useNavigation } from '@react-navigation/native';
import ContactModalData from './ContactModalData';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useChatPeer } from 'src/hooks/useChatPeer';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { RealmSchema } from 'src/storage/realm/enum';
import dbManager from 'src/storage/realm/dbManager';
import { CommunityType, MessageType, Message } from 'src/services/p2p/interface';
import { hash256 } from 'src/utils/service-utilities/encryption';
import Relay from 'src/services/backend/Relay';
import { ChatEncryptionManager } from 'src/utils/service-utilities/ChatEncryptionManager';
import { v4 as uuidv4 } from 'uuid';
import { useQuery } from '@realm/react';
import ChatPeerManager from 'src/services/p2p/ChatPeerManager';

const Contact = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [createProfile, setCreateProfile] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [userProfileName, setUserProfileName] = useState('');
  const navigation = useNavigation();
  const [contactmodalVisible, setContactModalVisible] = useState(false);
  const [shareContact, setShareContact] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { contactText } = translations;
  const app: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);
  const lastBlock = useQuery<Message>(RealmSchema.Message).sorted('block', true)[0]?.block;
  const communities = useQuery(RealmSchema.Community);
  const { showToast } = useToastMessage();
  const chatPeer = useChatPeer();

  const initializeChat = async () => {
    try {
      const chatPeerInitialized = await chatPeer.initChatPeer();
      if (!chatPeerInitialized) {
        throw new Error();
      }
    } catch (error) {
      console.error('Error initializing chat peer:', error);
      showToast('Chat Peer initialization failed', <ToastErrorIcon />);
      return;
    }
  };

  useEffect(() => {
    if (!chatPeer.isInitialized) initializeChat();
    else chatPeer.loadPendingMessages(lastBlock);
  }, [chatPeer.isInitialized]);

  const onQrScan = (data) => {
    if (data.startsWith('keeper://')) {
      const urlParts = data.split('/');
      const path = urlParts[2];
      if (path === 'contact') {
        const publicKey = urlParts[3];
        initChat(publicKey);
      }
    } else {
      showToast('Invalid QR code', <ToastErrorIcon />);
    }
  };

  const initChat = async (publicKey: string) => {
    try {
      const profiles = await Relay.getAppProfiles([publicKey]);
      if (profiles.length > 0) {
        dbManager.createObject(RealmSchema.Contact, profiles[0]);
      }
      const communityId = hash256([app.contactsKey.publicKey, publicKey].sort().join('-'));
      const sessionKeys = ChatEncryptionManager.generateSessionKeys();
      const encryptedKeys = ChatEncryptionManager.encryptKeys(
        sessionKeys.aesKey,
        ChatEncryptionManager.performKeyExchange(app.contactsKey, publicKey)
      );
      const community = dbManager.getObjectByPrimaryId(RealmSchema.Community, 'id', communityId);
      if (!community) {
        dbManager.createObject(RealmSchema.Community, {
          id: communityId,
          communityId: communityId,
          name: profiles[0].name,
          createdAt: Date.now(),
          type: CommunityType.Peer,
          with: publicKey,
          key: sessionKeys.aesKey,
        });
        const message = {
          id: uuidv4(),
          communityId: communityId,
          type: MessageType.Alert,
          text: `Start of conversation`,
          createdAt: Date.now(),
          sender: app.contactsKey.publicKey,
          unread: false,
          encryptedKeys: encryptedKeys,
        };
        chatPeer.sendMessage(publicKey, JSON.stringify(message));
        dbManager.createObject(RealmSchema.Message, message);
        showToast('New Tribe Contact created', false);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  return (
    <Box style={styles.container}>
      <ContactHeader
        userProfileImage={userProfileImage}
        userProfileName={app.appName}
        setCreateProfile={setCreateProfile}
        setContactModalVisible={setContactModalVisible}
        setShareContact={setShareContact}
      />
      <Box style={styles.chat_heading}>
        <Text color={`${colorMode}.modalSubtitleBlack`} medium fontSize={16}>
          {contactText.recentChats}
        </Text>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.concierge_container} borderColor={`${colorMode}.separator`}>
          <TouchableOpacity
            style={styles.concierge}
            onPress={() => {
              navigation.navigate('ChatRoomScreen');
            }}
          >
            <Box style={styles.concierge_icon}>
              <CircleIconWrapper
                width={wp(45)}
                icon={<ConciergeIcon width={wp(22)} height={wp(22)} />}
                backgroundColor={`${colorMode}.pantoneGreen`}
              />
              <Box style={styles.concierge_text}>
                <Text color={`${colorMode}.modalSubtitleBlack`} semiBold fontSize={14}>
                  {contactText.keeperSupport}
                </Text>
                <Text fontSize={13} color={isDarkMode ? Colors.bodyText : Colors.primaryBrown}>
                  {contactText.hereToHelp}
                </Text>
              </Box>
            </Box>
            <Box style={styles.pinContainer}>
              {/* place a time here */}
              <Text fontSize={13} color={isDarkMode ? Colors.bodyText : Colors.primaryBrown}>
                10:45 AM
              </Text>
              <PinIcon />
            </Box>
          </TouchableOpacity>
        </Box>
        <ChatList userProfileImage={userProfileImage} communities={communities} />
      </ScrollView>
      <Box style={styles.bottomButton}>
        <Buttons
          primaryText={contactText.addContact}
          primaryCallback={() => {
            setContactModalVisible(true);
            setShareContact(false);
          }}
          fullWidth
          LeftIcon={ContactAddicon}
        />
      </Box>
      <KeeperModal
        visible={createProfile}
        close={() => setCreateProfile(false)}
        title={contactText.editProfile}
        subTitle={contactText.editProfileDesc}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <ProfileContent
            setUserProfileImage={setUserProfileImage}
            setUserProfileName={setUserProfileName}
            setCreateProfile={setCreateProfile}
            userProfileImage={userProfileImage}
            userProfileName={userProfileName}
          />
        )}
      />
      <KeeperModal
        visible={contactmodalVisible}
        close={() => setContactModalVisible(false)}
        title={shareContact ? contactText.shareContact : contactText.addNewContact}
        subTitle={contactText.chooseHowToAdd}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <ContactModalData
            isShareContact={shareContact}
            setContactModalVisible={setContactModalVisible}
            navigation={navigation}
            data={`keeper://contact/${app.contactsKey.publicKey}/`}
            onQrScan={onQrScan}
          />
        )}
      />
    </Box>
  );
};

export default Contact;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(20),
  },

  chat_heading: {
    marginBottom: wp(20),
  },
  concierge_container: {
    marginBottom: wp(20),
    borderBottomWidth: 1,
    paddingBottom: wp(20),
  },
  concierge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  concierge_icon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(10),
  },
  concierge_text: {
    gap: wp(6),
  },
  pinContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(6),
  },
  bottomButton: {
    marginTop: wp(10),
    marginBottom: wp(15),
  },
});
