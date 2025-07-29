import React, { useContext, useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Image, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import ChatPlaceHolderIcon from 'src/assets/images/contact-placeholder-image.png';
import { useNavigation } from '@react-navigation/native';
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { CommunityType } from 'src/services/p2p/interface';
import { useChatPeer } from 'src/hooks/useChatPeer';

interface ChatItemData {
  id: string;
  name: string;
  lastMessage: string;
  image: string;
  date: string;
  message_count: number;
  communityId: string;
  contactKey?: string;
}

const PlaceHolderChat = () => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { contactText } = translations;
  return (
    <Box style={styles.placeHolderContainer} backgroundColor={`${colorMode}.primaryBackground`}>
      <Text style={styles.placeHolderText} medium>
        {contactText.noContactYet}
      </Text>
      <Text style={styles.placeholderDescription} color={`${colorMode}.secondaryText`}>
        {contactText.noContactDesc}
      </Text>
    </Box>
  );
};

const ChatItem = ({ item, userProfileImage }: { item: ChatItemData; userProfileImage: any }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePress = () => {
    navigation.navigate('ChatRoomScreen', { communityId: item.communityId });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Box
        style={styles.profile_container}
        borderColor={`${colorMode}.separator`}
        backgroundColor={`${colorMode}.primaryBackground`}
      >
        <Box style={styles.profile_image_container}>
          <Image
            source={
              item.image && item.image.trim() !== '' ? { uri: item.image } : ChatPlaceHolderIcon
            }
            style={styles.profile_image}
            alt="profile"
          />
          <Box>
            <Text style={styles.nameText} semiBold color={`${colorMode}.primaryText`}>
              {item.name}
            </Text>
            <Text style={styles.messageText} color={`${colorMode}.subchatText`}>
              {item.lastMessage}
            </Text>
          </Box>
        </Box>
        <Box style={styles.edit_icon}>
          <Text color={`${colorMode}.subchatText`}>{formatTime(item.date)}</Text>
          {item.message_count > 0 && (
            <Box style={styles.message_count} backgroundColor={`${colorMode}.SeaweedGreen`}>
              <Text color={`${colorMode}.buttonText`} medium fontSize={8}>
                {item.message_count}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

const ChatList = ({
  userProfileImage,
  communities,
}: {
  userProfileImage: any;
  communities: any;
}) => {
  const { colorMode } = useColorMode();
  const { getAllMessages, getMessagesByCommunity, getUnreadCount, getContactByKey } = useChatPeer();

  // Transform communities into chat list data
  const chatData = useMemo(() => {
    const chatItems: ChatItemData[] = [];

    communities.forEach((community) => {
      // Get messages for this community
      const messages = getMessagesByCommunity(community.id);

      if (messages.length === 0) {
        // No messages yet, show community anyway for Peer communities
        if (community.type === CommunityType.Peer && community.with) {
          const contact = getContactByKey(community.with);
          chatItems.push({
            id: community.id,
            name: contact?.name || community.name,
            lastMessage: 'No messages yet',
            image: contact?.imageUrl || '',
            date: new Date(community.createdAt).toISOString(),
            message_count: 0,
            communityId: community.id,
            contactKey: community.with,
          });
        } else if (community.type !== CommunityType.Peer) {
          // Group or Broadcast communities
          chatItems.push({
            id: community.id,
            name: community.name,
            lastMessage: 'No messages yet',
            image: '',
            date: new Date(community.createdAt).toISOString(),
            message_count: 0,
            communityId: community.id,
          });
        }
        return;
      }

      // Get the latest message
      const latestMessage = messages.reduce((latest, current) =>
        current.createdAt > latest.createdAt ? current : latest
      );

      // Get unread count for this community
      const unreadCount = getUnreadCount(community.id);

      // Determine display name and image based on community type
      let displayName = community.name;
      let displayImage = '';
      let contactKey: string | undefined;

      if (community.type === CommunityType.Peer && community.with) {
        const contact = getContactByKey(community.with);
        displayName = contact?.name || community.name;
        displayImage = contact?.imageUrl || '';
        contactKey = community.with;
      }

      chatItems.push({
        id: community.id,
        name: displayName,
        lastMessage: latestMessage.text,
        image: displayImage,
        date: new Date(latestMessage.createdAt).toISOString(),
        message_count: unreadCount,
        communityId: community.id,
        contactKey,
      });
    });

    // Sort by latest message date
    return chatItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [communities, getAllMessages, getMessagesByCommunity, getUnreadCount, getContactByKey]);

  const renderItem = ({ item }: { item: ChatItemData }) => (
    <ChatItem item={item} userProfileImage={userProfileImage} />
  );

  return (
    <Box backgroundColor={`${colorMode}.primaryBackground`}>
      <FlatList
        data={chatData}
        keyExtractor={(item) => item?.id}
        renderItem={renderItem}
        ListEmptyComponent={<PlaceHolderChat />}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

export default ChatList;

const styles = StyleSheet.create({
  profile_container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderRadius: wp(10),
    paddingBottom: wp(18),
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: wp(20),
  },
  profile_image_container: {
    flexDirection: 'row',
    gap: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile_image: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(75),
  },
  edit_icon: {
    alignItems: 'flex-end',
    gap: wp(10),
  },
  nameText: {
    fontSize: wp(15),
    marginBottom: wp(8),
  },
  messageText: {
    fontSize: wp(12),
  },
  message_count: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeHolderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: wp(20),
  },
  placeHolderText: {
    fontSize: wp(18),
    marginBottom: wp(10),
    fontFamily: Fonts.LoraMedium,
  },
  placeholderDescription: {
    fontSize: wp(13),
    textAlign: 'center',
    paddingHorizontal: wp(20),
  },
});
