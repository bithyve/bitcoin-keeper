import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Image, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import PlaceHolderChat from './PlaceHolderChat';
import ChatPlaceHolderIcon from 'src/assets/images/chat-image-placeholder-image.png';
import { useNavigation } from '@react-navigation/native';

// dummy chat data
const chatData = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hey! Are you available tomorrow?',
    image:
      'file:///Users/mac/Library/Developer/CoreSimulator/Devices/2C667219-79A1-4604-9AC8-183891E43BA9/data/Containers/Data/Application/AEAC5F0D-0461-4389-8EDF-1521C17FCE9A/tmp/1B0219B7-CD88-4CAD-9216-CBA7B7DF91C2.jpg',
    date: '2023-10-01T1:00:00',
    message_count: 2,
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Let’s catch up soon!',
    image:
      'file:///Users/mac/Library/Developer/CoreSimulator/Devices/2C667219-79A1-4604-9AC8-183891E43BA9/data/Containers/Data/Application/AEAC5F0D-0461-4389-8EDF-1521C17FCE9A/tmp/393696BD-08ED-4568-822A-8713FDFBA6ED.jpg',
    date: '2023-10-01T12:45:00',
    message_count: 6,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    lastMessage: 'I sent the documents.',
    image: '',
    date: '2023-10-01T13:40:00',
    message_count: 0,
  },
];

const ChatItem = ({ item }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePress = () => {
    navigation.navigate('ChatRoomScreen', {
      receiverProfileImage: item.image,
      receiverProfileName: item.name,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Box
        style={styles.profile_container}
        borderColor={`${colorMode}.stoneGrey`}
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

const ChatList = () => {
  const { colorMode } = useColorMode();

  const renderItem = ({ item }) => <ChatItem item={item} />;

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
    width: wp(47),
    height: wp(47),
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
    opacity: 0.6,
  },
  message_count: {
    width: wp(15),
    height: wp(15),
    borderRadius: wp(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
