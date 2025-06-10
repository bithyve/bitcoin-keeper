import React, { useContext, useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { TextInput, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

import Colors from 'src/theme/Colors';
import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import { hp, wp } from 'src/constants/responsive';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ContactImagePlaceholder from 'src/assets/images/contact-image-placeholder.svg';
import PlusIcon from 'src/assets/images/add-icon-brown.svg';
import Buttons from 'src/components/Buttons';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { getPersistedDocument, persistDocument } from 'src/services/documents';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import WalletHeader from 'src/components/WalletHeader';

function EditContact({ route }) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signer } = route.params;
  const fullName = generateFullName(signer);
  const [defaultName, setDefaultName] = useState(fullName);
  const [userImage] = useState(getPersistedDocument(signer.extraData.thumbnailPath));
  const [selectedImage, setSelectedImage] = useState(null);
  const [disableSave, setDisableSave] = useState(true);
  const dispatch = useDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(await persistDocument(response.assets[0].uri));
      }
    });
  };

  const saveContactDetails = () => {
    if (validateData()) {
      const fullNameSplit = defaultName.split(' ');
      const extraData = {
        ...signer.extraData,
        givenName: fullNameSplit[0],
        familyName: fullNameSplit.slice(1).join(' '),
        thumbnailPath: selectedImage ?? userImage,
      };
      dispatch(updateSignerDetails(signer, 'extraData', extraData));
      navigation.goBack();
    }
  };

  const validateData = () => {
    if (
      (userImage !== selectedImage && selectedImage) ||
      (defaultName.trim() !== fullName && defaultName.trim())
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    setDisableSave(!validateData());
  }, [defaultName, selectedImage]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title={common.editProfile} titleColor={`${colorMode}.primaryText`} />

      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <Box style={styles.iconContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : userImage ? (
              <Image source={{ uri: userImage }} style={styles.selectedImage} />
            ) : (
              <ContactImagePlaceholder width={wp(161)} height={hp(161)} />
            )}
            <TouchableOpacity style={styles.plusIconContainer} onPress={openImagePicker}>
              <PlusIcon width={wp(36)} height={hp(33)} />
            </TouchableOpacity>
          </Box>

          <Text style={styles.label}>{common.Name}</Text>
          <TextInput
            style={styles.input}
            value={defaultName}
            onChangeText={setDefaultName}
            editable={true}
          />
        </Box>

        <Box style={styles.saveButtonContainer}>
          <Buttons
            primaryDisable={disableSave}
            primaryText={common.saveContact}
            paddingHorizontal={wp(105)}
            primaryCallback={saveContactDetails}
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    position: 'relative',
    marginTop: hp(10),
    marginBottom: hp(30),
  },
  plusIconContainer: {
    position: 'absolute',
    bottom: hp(-10),
    right: wp(10),
    padding: 5,
  },
  selectedImage: {
    width: wp(161),
    height: hp(161),
    borderRadius: wp(80.5),
  },
  label: {
    fontSize: 16,
    marginBottom: hp(5),
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    height: hp(47),
    borderColor: Colors.secondaryLightGrey,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.brightCream,
    marginBottom: hp(30),
    color: Colors.secondaryDarkGrey,
  },
  saveButtonContainer: {
    width: '100%',
  },
});

const generateFullName = (signer) => {
  let fullName = '';
  if (signer.extraData.givenName) fullName += signer.extraData.givenName;
  if (signer.extraData.familyName) fullName += ` ${signer.extraData.familyName}`;
  return fullName;
};
export default EditContact;
