import React, { useContext } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Image, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import ChatPlaceHolderIcon from 'src/assets/images/contact-placeholder-image.png';
import { useNavigation } from '@react-navigation/native';
import Fonts from 'src/constants/Fonts';
import { LocalizationContext } from 'src/context/Localization/LocContext';

// dummy chat data
const chatData = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hey! Are you available tomorrow?',
    image:
      'file:///Users/mac/Library/Developer/CoreSimulator/Devices/2C667219-79A1-4604-9AC8-183891E43BA9/data/Containers/Data/Application/FBE5364F-9652-4CBB-A5A0-649007152F46/tmp/A3814890-5695-4D50-A53B-420A052A904C.jpg',
    date: '2025-07-17T12:00:00',
    message_count: 2,
  },
  {
    id: '2',
    name: 'Jane Smith',
    lastMessage: 'Let’s catch up soon!',
    image: '',
    date: '2023-10-01T12:45:00',
    message_count: 6,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    lastMessage: 'I sent the documents.',
    image: '',
    date: '2025-07-16T12:00:00',
    message_count: 0,
  },
];

const chatDatas = [];

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

const ChatItem = ({ item, userProfileImage }) => {
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
      userProfileImage,
    });
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

const ChatList = ({ userProfileImage }) => {
  const { colorMode } = useColorMode();

  const renderItem = ({ item }) => <ChatItem item={item} userProfileImage={userProfileImage} />;

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
