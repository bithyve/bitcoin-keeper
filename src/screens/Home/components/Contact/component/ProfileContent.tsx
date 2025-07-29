import { Box, Image, useColorMode } from 'native-base';
import { StyleSheet, TouchableOpacity } from 'react-native';
import KeeperTextInput from 'src/components/KeeperTextInput';
import { wp } from 'src/constants/responsive';
import PlaceHolderImage from 'src/assets/images/profile-placeHolder.png';
import PlaceholderWhiteImage from 'src/assets/images/placeholder-image-dark.png';
import { useContext, useEffect, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import Buttons from 'src/components/Buttons';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { RealmSchema } from 'src/storage/realm/enum';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import dbManager from 'src/storage/realm/dbManager';

const ProfileContent = ({
  setUserProfileImage,
  setUserProfileName,
  setCreateProfile,
  userProfileImage,
  userProfileName,
}) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const [profileImage, setProfileImage] = useState(null);
  const [profileName, setProfileName] = useState('');
  const { translations } = useContext(LocalizationContext);
  const { contactText, common } = translations;
  const app: KeeperApp = dbManager.getObjectByIndex(RealmSchema.KeeperApp);

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

  const handleConfirm = async () => {
    try {
      dbManager.updateObjectById(RealmSchema.KeeperApp, app.id, {
        appName: profileName,
      });
      setUserProfileImage(profileImage);
      setUserProfileName(profileName);
      setCreateProfile(false);
    } catch (error) {
      console.log('Error in handleConfirm', error);
    }
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
            <Image
              source={isDarkMode ? PlaceholderWhiteImage : PlaceHolderImage}
              style={styles.profile_image}
              alt="placeHolder"
            />
          )}
          <TouchableOpacity style={styles.addImageIcon} onPress={pickImage}>
            {profileImage ? (
              <ThemedSvg name={'edit_profile_icons'} width={wp(35)} height={wp(35)} />
            ) : (
              <ThemedSvg name={'add_profile_icons'} width={wp(35)} height={wp(35)} />
            )}
          </TouchableOpacity>
        </Box>
      </Box>
      <Box style={styles.input_container}>
        <KeeperTextInput
          placeholder={contactText.enterName}
          value={profileName}
          onChangeText={(text) => setProfileName(text)}
          backgroundColor={`${colorMode}.primaryBackground`}
        />
      </Box>
      <Buttons
        primaryText={common.confirm}
        primaryBackgroundColor={`${colorMode}.pantoneGreen`}
        primaryTextColor={`${colorMode}.headerWhite`}
        fullWidth
        primaryCallback={() => handleConfirm()}
        primaryDisable={!profileName}
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
