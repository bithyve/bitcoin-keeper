import { Box, useColorMode } from 'native-base';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  TextInput,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import Contacts from 'react-native-contacts';
import ScreenWrapper from 'src/components/ScreenWrapper';
import ImagePlaceHolder from 'src/assets/images/contact-image-placeholder.svg';
import SearchIcon from 'src/assets/images/search-icon.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import Colors from 'src/theme/Colors';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import { StackActions, useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import { Signer } from 'src/services/wallets/interfaces/vault';
import { useDispatch } from 'react-redux';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { persistDocument } from 'src/services/documents';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import TickIcon from 'src/assets/images/tick_icon.svg';
import useToastMessage from 'src/hooks/useToastMessage';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'AssociateContact'>;

const AssociateContact = ({ route }: ScreenProps) => {
  const { signer }: { signer: Signer } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
        title: 'Contacts',
        message: 'Keeper would like to access your contacts.',
        buttonPositive: 'Accept',
      }).then((value) => {
        if (value === 'granted') {
          Contacts.getAll().then(setContacts);
        }
      });
    } else {
      Contacts.getAll().then(setContacts);
    }
  }, []);

  const filteredContacts = contacts.filter((contact) =>
    contact.givenName.toLowerCase().includes(search.toLowerCase())
  );

  const handleContactPress = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleContactPress(item)}>
      <Box style={styles.contactItem}>
        {item.thumbnailPath !== '' ? (
          <Image source={{ uri: item.thumbnailPath || '' }} style={styles.avatar} />
        ) : (
          <ImagePlaceHolder style={styles.avatar} />
        )}
        <Text medium style={styles.contactName}>
          {item.givenName} {item.familyName}
        </Text>
      </Box>
    </TouchableOpacity>
  );

  const renderSeparator = () => (
    <View
      style={{
        height: 1,
        backgroundColor: Colors.SilverMist,
        marginLeft: 55,
      }}
    />
  );

  const onAddAssociateContact = async () => {
    try {
      const persistedImage = await persistDocument(selectedContact.thumbnailPath);
      const extraData = {
        ...signer.extraData,
        givenName: selectedContact.givenName,
        familyName: selectedContact.familyName,
        recordID: selectedContact.recordID,
        thumbnailPath: persistedImage,
      };
      dispatch(updateSignerDetails(signer, 'extraData', extraData));
      setShowModal(false);
      showToast('Details Updated Successfully', <TickIcon />);
      navigation.dispatch(StackActions.pop(2));
    } catch (error) {
      console.log('🚀 ~ onAddAssociateContact ~ error:', error);
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Associate Contact" titleColor={`${colorMode}.primaryText`} />
      <Box style={styles.container}>
        <Box
          style={[
            styles.searchSection,
            {
              borderColor: Colors.SilverMist,
              backgroundColor: colorMode === 'dark' ? Colors.SeashellDark : Colors.Seashell,
            },
          ]}
        >
          <SearchIcon />
          <TextInput
            style={styles.input}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            underlineColorAndroid="transparent"
          />
        </Box>
        <Text medium style={styles.sectionTitle}>
          Your Phonebook
        </Text>
        <FlatList
          data={filteredContacts}
          renderItem={renderItem}
          keyExtractor={(item) => item.recordID}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={renderSeparator}
        />
      </Box>
      {selectedContact && (
        <KeeperModal
          visible={showModal}
          close={() => setShowModal(false)}
          showCloseIcon={false}
          title="Associated Contact"
          subTitle="The contact you associated with the Key will be displayed here"
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.modalWhiteContent`}
          buttonTextColor={`${colorMode}.white`}
          buttonBackground={`${colorMode}.greenButtonBackground`}
          buttonText="Continue"
          buttonCallback={onAddAssociateContact}
          Content={() => (
            <Box
              style={styles.contactInfoCard}
              backgroundColor={`${colorMode}.seashellWhite`}
              borderColor={`${colorMode}.greyBorder`}
            >
              <Box style={styles.iconContainer}>
                {selectedContact.thumbnailPath !== '' ? (
                  <Image
                    source={{ uri: selectedContact.thumbnailPath || 'default-avatar-url' }}
                    style={styles.modalAvatar}
                  />
                ) : (
                  <ImagePlaceHolder style={styles.modalAvatar} />
                )}
              </Box>
              <Text medium style={styles.buttonText}>
                {selectedContact.givenName} {selectedContact.familyName}
              </Text>
            </Box>
          )}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    paddingTop: hp(10),
    marginBottom: hp(15),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 15,
  },
  contactName: {
    flex: 1,
    fontSize: 16,
  },
  addButton: {
    padding: 10,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: hp(24),
  },
  input: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: hp(75),
    borderWidth: 1,
    borderRadius: 10,
    paddingTop: hp(16),
    paddingBottom: hp(15),
    paddingHorizontal: wp(17),
    marginTop: hp(10),
    marginBottom: hp(10),
  },
  iconContainer: {
    marginRight: 10,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
  },
  arrowIcon: {
    paddingRight: wp(20),
  },
  modalContent: {
    alignItems: 'center',
    padding: 20,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  modalContactName: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalPhoneNumber: {
    fontSize: 16,
  },
  contactInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: hp(85),
    borderWidth: 1,
    borderRadius: 10,
    paddingTop: hp(23),
    paddingBottom: hp(22),
    paddingHorizontal: wp(18),
    marginBottom: hp(10),
  },
  modalContainer: {
    marginTop: hp(20),
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: hp(5),
  },
  modalText: {
    width: wp(300),
    fontSize: 14,
  },
});

export default AssociateContact;
