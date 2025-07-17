import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useState } from 'react';
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

const Contact = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [createProfile, setCreateProfile] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [userProfileName, setUserProfileName] = useState('');
  const navigation = useNavigation();
  const [contactmodalVisible, setContactModalVisible] = useState(false);
  const [shareContact, setShareContact] = useState(false);

  return (
    <Box style={styles.container}>
      <ContactHeader
        userProfileImage={userProfileImage}
        userProfileName={userProfileName}
        setCreateProfile={setCreateProfile}
        setContactModalVisible={setContactModalVisible}
        setShareContact={setShareContact}
      />
      <Box style={styles.chat_heading}>
        <Text color={`${colorMode}.modalSubtitleBlack`} medium fontSize={16}>
          Recent Chats
        </Text>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.concierge_container} borderColor={`${colorMode}.separator`}>
          <TouchableOpacity
            style={styles.concierge}
            onPress={() => {
              navigation.navigate('keeperSupport');
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
                  Keeper Support
                </Text>
                <Text fontSize={13} color={isDarkMode ? Colors.bodyText : Colors.primaryBrown}>
                  We're here to help.
                </Text>
              </Box>
            </Box>
            <Box style={styles.pinContainer}>
              <Text fontSize={13} color={isDarkMode ? Colors.bodyText : Colors.primaryBrown}>
                10:45 AM
              </Text>
              <PinIcon />
            </Box>
          </TouchableOpacity>
        </Box>
        <ChatList userProfileImage={userProfileImage} />
      </ScrollView>
      <Box style={styles.bottomButton}>
        <Buttons
          primaryText="Add Contact"
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
        title="Edit Your Profile"
        subTitle="Add a name/nym and an optional photo."
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
        title={shareContact ? 'Share Contact Info' : 'Add a New Contact'}
        subTitle="Choose how to add the contact"
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <ContactModalData
            isShareContact={shareContact}
            setContactModalVisible={setContactModalVisible}
            navigation={navigation}
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
