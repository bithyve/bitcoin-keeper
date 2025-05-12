import { Box, Image, useColorMode } from 'native-base';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp } from 'src/constants/responsive';
import PlaceHolderImage from 'src/assets/images/profile-placeHolder.png';
import EditIcon from 'src/assets/images/edit-pencil-icon.svg';
import PlusSageIcon from 'src/assets/images/sage-plus-icon.svg';
import ChatList from './components/ChatList';
import KeeperModal from 'src/components/KeeperModal';
import NewContactModalContent from './components/NewContactModalContent';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = ({ userProfileName, userProfileImage, setCreateProfile }) => {
  const { colorMode } = useColorMode();
  const [addNewContact, setAddNewContact] = useState(false);
  const navigation = useNavigation();

  return (
    <Box style={styles.container}>
      {/* Profile section  */}
      <Box
        style={styles.profile_container}
        borderColor={`${colorMode}.separator`}
        backgroundColor={`${colorMode}.primaryBackground`}
      >
        <Box style={styles.profile_image_container}>
          {userProfileImage ? (
            <Image
              source={{ uri: userProfileImage }}
              alt="profileImage"
              style={styles.profile_image}
              resizeMode="cover"
            />
          ) : (
            <Image source={PlaceHolderImage} style={styles.profile_image} alt="placeHolder" />
          )}
          <Box>
            <Text style={styles.text} color={`${colorMode}.modalSubtitleBlack`} semiBold>
              {userProfileName}
            </Text>
            <Text style={styles.text} color={`${colorMode}.GreenishGrey`}>
              View Your Profile
            </Text>
          </Box>
        </Box>
        <TouchableOpacity onPress={() => setCreateProfile(true)} style={styles.edit_icon}>
          <EditIcon />
        </TouchableOpacity>
      </Box>
      {/* Chat section */}
      <Box>
        <Box style={styles.chat_heading}>
          <Text color={`${colorMode}.modalSubtitleBlack`} semiBold fontSize={16}>
            Recent Chats
          </Text>
          <TouchableOpacity style={styles.edit_icon} onPress={() => setAddNewContact(true)}>
            <PlusSageIcon />
            <Text color={`${colorMode}.DarkSlateGray`} fontSize={12} semiBold>
              Add New Contacts
            </Text>
          </TouchableOpacity>
        </Box>
        <Box>
          <ChatList />
        </Box>
      </Box>
      <KeeperModal
        visible={addNewContact}
        close={() => setAddNewContact(false)}
        title="Add New Contacts"
        subTitle="Choose a medium to add the contact"
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <NewContactModalContent setAddNewContact={setAddNewContact} navigation={navigation} />
        )}
      />
    </Box>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(20),
    paddingTop: wp(10),
    paddingBottom: wp(20),
  },
  profile_container: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: wp(10),
    padding: wp(18),
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: wp(20),
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
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
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: wp(5),
  },
  chat_heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(20),
  },
});
