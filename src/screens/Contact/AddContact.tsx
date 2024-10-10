import React, { useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import TickIcon from 'src/assets/images/tick_icon.svg';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import { persistDocument } from 'src/services/documents';

const AddContact = ({ route }) => {
  const { signer } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [disableSave, setDisableSave] = useState(true);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();

  const saveContactDetails = () => {
    if (validateData()) {
      const fullNameSplit = name.split(' ');
      const extraData = {
        ...signer.extraData,
        givenName: fullNameSplit[0],
        familyName: fullNameSplit[1],
        thumbnailPath: selectedImage,
      };
      dispatch(updateSignerDetails(signer, 'extraData', extraData));
      showToast('Contact Updated Successfully', <TickIcon />);
      navigation.goBack();
    }
  };

  const validateData = () => {
    if (selectedImage || name.trim()) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    setDisableSave(!validateData());
  }, [name, selectedImage]);

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

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader simple title="Add Contact" titleColor={`${colorMode}.primaryText`} />

      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <Box style={styles.iconContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <ContactImagePlaceholder width={wp(161)} height={hp(161)} />
            )}
            <TouchableOpacity style={styles.plusIconContainer} onPress={openImagePicker}>
              <PlusIcon width={wp(36)} height={hp(33)} />
            </TouchableOpacity>
          </Box>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
          />
        </Box>

        <Box style={styles.saveButtonContainer}>
          <Buttons
            primaryText="Save Contact"
            paddingHorizontal={wp(105)}
            primaryDisable={disableSave}
            primaryCallback={saveContactDetails}
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
};

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
    borderColor: Colors.SilverMist,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.Seashell,
    marginBottom: hp(30),
  },
  saveButtonContainer: {
    width: '100%',
  },
});

export default AddContact;
