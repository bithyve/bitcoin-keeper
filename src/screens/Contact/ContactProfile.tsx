import React from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Text from 'src/components/KeeperText';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ContactImagePlaceholder from 'src/assets/images/contact-image-placeholder.svg';
import Buttons from 'src/components/Buttons';
import { hp, wp } from 'src/constants/responsive';
import { getPersistedDocument } from 'src/services/documents';

const ContactProfile = ({ route }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { contact } = route.params;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader simple title="Profile" titleColor={`${colorMode}.primaryText`} />

      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          <Box style={styles.iconContainer}>
            {contact.thumbnailPath ? (
              <Image
                source={{ uri: getPersistedDocument(contact.thumbnailPath) }}
                style={styles.selectedImage}
              />
            ) : (
              <ContactImagePlaceholder width={wp(161)} height={hp(161)} />
            )}
          </Box>
          <Text medium style={styles.contactName}>
            {contact.givenName} {contact.familyName}
          </Text>
        </Box>

        <Box style={styles.saveButtonContainer}>
          <Buttons
            primaryText="Edit Profile"
            paddingHorizontal={wp(105)}
            primaryCallback={() => navigation.navigate('EditContact', { contact })}
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
    marginBottom: hp(20),
  },
  contactName: {
    fontSize: 18,
    marginBottom: hp(10),
  },
  saveButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  selectedImage: {
    width: wp(161),
    height: hp(161),
    borderRadius: wp(80.5),
  },
});

export default ContactProfile;
