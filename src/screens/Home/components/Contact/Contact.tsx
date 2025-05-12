import { Box, useColorMode } from 'native-base';
import React, { useState } from 'react';
import Text from 'src/components/KeeperText';
import ContactIllustration from 'src/assets/images/contact-illustration.svg';
import Buttons from 'src/components/Buttons';
import { StyleSheet } from 'react-native';
import { wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';
import HexagonIcon from 'src/assets/images/hexagon-plus-icon.svg';
import KeeperModal from 'src/components/KeeperModal';
import ProfileContent from './components/ProfileContent';
import ChatScreen from './ChatScreen';

const Contact = () => {
  const { colorMode } = useColorMode();
  const [isProfileAvailable, setIsProfileAvailable] = useState(false);
  const [createProfile, setCreateProfile] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [userProfileName, setUserProfileName] = useState('');

  return (
    <Box>
      {isProfileAvailable ? (
        <ChatScreen
          userProfileImage={userProfileImage}
          userProfileName={userProfileName}
          setCreateProfile={setCreateProfile}
        />
      ) : (
        <Box style={styles.container}>
          <ContactIllustration style={styles.illustration} />
          <Box style={styles.text_container}>
            <Text style={styles.text_heading}>Create your </Text>
            <Text style={styles.text_heading}> profile for Contact anyone</Text>
          </Box>
          <Text style={styles.text_description}>
            Share your profile with your contacts for seamless chats and transactions.
          </Text>
          <Buttons
            primaryText="Create your profile"
            primaryBackgroundColor={`${colorMode}.pantoneGreen`}
            primaryTextColor={`${colorMode}.headerWhite`}
            fullWidth
            LeftIcon={HexagonIcon}
            primaryCallback={() => setCreateProfile(true)}
          />
        </Box>
      )}
      <KeeperModal
        visible={createProfile}
        close={() => setCreateProfile(false)}
        title="Create your profile"
        subTitle="Edit your profile details "
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        Content={() => (
          <ProfileContent
            setIsProfileAvailable={setIsProfileAvailable}
            setUserProfileImage={setUserProfileImage}
            setUserProfileName={setUserProfileName}
            setCreateProfile={setCreateProfile}
            userProfileImage={userProfileImage}
            userProfileName={userProfileName}
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
    alignItems: 'center',
    padding: wp(22),
    marginTop: wp(40),
  },
  illustration: {
    marginBottom: wp(20),
  },
  text_container: {
    marginBottom: wp(18),
  },
  text_heading: {
    fontFamily: Fonts.LoraMedium,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  text_description: {
    fontSize: 13,
    marginBottom: wp(22),
    width: wp(280),
    textAlign: 'center',
  },
});
