import { Box, Image, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { wp } from 'src/constants/responsive';
import PlaceHolderImage from 'src/assets/images/profile-placeHolder.png';
import { useEffect, useState } from 'react';
import AddImageIcon from 'src/assets/images/add-image-icon.svg';
import { launchImageLibrary } from 'react-native-image-picker';
import Buttons from 'src/components/Buttons';

const ProfileContent = ({
  setIsProfileAvailable,
  setUserProfileImage,
  setUserProfileName,
  setCreateProfile,
  userProfileImage,
  userProfileName,
}) => {
  const { colorMode } = useColorMode();
  const [profileImage, setProfileImage] = useState(null);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    if (userProfileImage) {
      setProfileImage(userProfileImage);
    }
    if (userProfileName) {
      setProfileName(userProfileName);
    }
  }, [userProfileImage, userProfileName]);

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setProfileImage(response.assets[0].uri);
        }
      }
    );
  };
  const handleConfirm = () => {
    setUserProfileImage(profileImage);
    setUserProfileName(profileName);
    setIsProfileAvailable(true);
    setCreateProfile(false);
  };

  return (
    <>
      <Box style={styles.content_container}>
        <Box
          style={styles.profile_container}
          borderColor={`${colorMode}.stoneGrey`}
          backgroundColor={`${colorMode}.stoneGrey`}
        >
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              alt="profileImage"
              style={styles.profile_image}
              resizeMode="cover"
            />
          ) : (
            <Image source={PlaceHolderImage} style={styles.profile_image} alt="placeHolder" />
          )}
          <TouchableOpacity style={styles.addImageIcon} onPress={pickImage}>
            <AddImageIcon width={wp(35)} height={wp(35)} />
          </TouchableOpacity>
        </Box>
      </Box>
      <Box style={styles.input_container}>
        <KeeperTextInput
          placeholder="Enter your name"
          value={profileName}
          onChangeText={(text) => setProfileName(text)}
        />
      </Box>
      <Buttons
        primaryText="Confirm"
        primaryBackgroundColor={`${colorMode}.pantoneGreen`}
        primaryTextColor={`${colorMode}.headerWhite`}
        fullWidth
        primaryCallback={() => handleConfirm()}
        primaryDisable={!profileImage || !profileName}
      />
    </>
  );
};

export default ProfileContent;

const styles = StyleSheet.create({
  content_container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(20),
  },
  profile_container: {
    width: wp(150),
    height: wp(150),
    borderRadius: wp(75),
    borderWidth: wp(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile_image: {
    width: wp(130),
    height: wp(130),
    borderRadius: wp(75),
  },
  input_container: {
    marginBottom: wp(20),
  },
  addImageIcon: {
    position: 'absolute',
    bottom: wp(-10),
    right: wp(0),
  },
});
