import React, { useEffect, useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { TextInput, StyleSheet, TouchableOpacity, Image, Pressable } from 'react-native';
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
import useToastMessage from 'src/hooks/useToastMessage';
import TickIcon from 'src/assets/images/tick_icon.svg';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { persistDocument } from 'src/services/documents';
import KeeperTextInput from 'src/components/KeeperTextInput';
import Fonts from 'src/constants/Fonts';
import PhoneBookIcon from 'src/assets/images/phoneBookGreen.svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'EditContact'>;

const EditContact = ({ route }: ScreenProps) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signer, isEdit = true } = route.params;
  const fullName = getFullName(signer);
  const [description, setDescription] = useState(signer?.signerDescription || '');
  const [defaultName, setDefaultName] = useState(fullName);
  const [userImage, setUserImage] = useState(signer.extraData?.thumbnailPath);
  const [selectedImage, setSelectedImage] = useState(null);
  const [disableSave, setDisableSave] = useState(true);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

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
    const fullNameSplit = defaultName.trim().length ? defaultName.trim().split(' ') : ['', ''];
    const extraData = {
      ...signer.extraData,
      givenName: fullNameSplit[0],
      familyName: fullNameSplit[1],
      thumbnailPath: selectedImage ?? userImage,
    };
    dispatch(updateSignerDetails(signer, 'signerDescription', description));
    dispatch(updateSignerDetails(signer, 'extraData', extraData));
    showToast('Details Updated Successfully', <TickIcon />);
    navigation.goBack();
  };

  const validateData = () => {
    if (
      (userImage !== selectedImage && selectedImage) ||
      (defaultName.trim() !== fullName && defaultName.trim()) ||
      (description.trim() !== signer?.signerDescription && description.trim())
    ) {
      return true;
    }
    return false;
  };

  const resetDetails = () => {
    setDefaultName('');
    setDescription('');
    setSelectedImage(null);
    setUserImage(null);
    setTimeout(() => {
      setDisableSave(false);
    }, 200);
  };

  useEffect(() => {
    setDisableSave(!validateData());
  }, [defaultName, selectedImage, description]);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={isEdit ? 'Edit Profile' : 'Add Contact'}
        titleColor={`${colorMode}.primaryText`}
        rightComponent={
          <Pressable
            style={styles.contactsCtr}
            onPress={() => navigation.navigate('AssociateContact', { signer })}
          >
            <PhoneBookIcon />
            <Text color={`${colorMode}.greenButtonBackground`} bold fontSize={14}>
              Contacts
            </Text>
          </Pressable>
        }
      />

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

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={defaultName}
            onChangeText={setDefaultName}
            editable={true}
          />
          <Box style={styles.inputWrapper}>
            <KeeperTextInput
              autoCapitalize="sentences"
              onChangeText={(text) => setDescription(text)}
              style={styles.descriptionEdit}
              placeholder="Add a Description (Optional)"
              placeholderTextColor={Colors.Graphite}
              value={description}
              maxLength={20}
              onSubmitEditing={() => {}}
            />
          </Box>
        </Box>

        <Box style={styles.saveButtonContainer}>
          <Buttons
            primaryDisable={disableSave}
            primaryText="Save"
            paddingHorizontal={wp(50)}
            primaryCallback={saveContactDetails}
            secondaryText="Reset"
            secondaryCallback={resetDetails}
          />
        </Box>
      </Box>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  contactsCtr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingBottom: hp(15),
  },
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
  inputWrapper: {
    width: '100%',
  },
  descriptionEdit: {
    paddingLeft: wp(20),
    borderRadius: 10,
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.5,
  },
});

const getFullName = (signer) => {
  const { givenName = '', familyName = '' } = signer.extraData || {};
  const fullName = `${givenName} ${familyName}`.trim();
  return fullName;
};

export default EditContact;
