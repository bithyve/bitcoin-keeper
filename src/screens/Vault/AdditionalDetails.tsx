import { Image, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, useColorMode, VStack } from 'native-base';
import useToastMessage from 'src/hooks/useToastMessage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import useSignerMap from 'src/hooks/useSignerMap';
import TickIcon from 'src/assets/images/tick_icon.svg';
import KeeperTextInput from 'src/components/KeeperTextInput';
import OptionTile from 'src/components/OptionTile';
import PhoneBookIcon from 'src/assets/images/phone-book-circle.svg';
import ImagePlaceHolder from 'src/assets/images/contact-image-placeholder.svg';
import { useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';
import { getPersistedDocument } from 'src/services/documents';
import { useAppSelector } from 'src/store/hooks';
import { resetSignersUpdateState } from 'src/store/reducers/bhr';
import { getKeyUID } from 'src/utils/utilities';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'AdditionalDetails'>;

function AdditionalDetails({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { signer: signerFromParam } = route.params;
  const { signerMap } = useSignerMap();
  const signer = signerMap[getKeyUID(signerFromParam)];
  const [description, setDescription] = useState(signer?.signerDescription || '');
  const [editContactModal, setEditContactModal] = useState(false);
  const [hasUpdatedDescription, setHasUpdatedDescription] = useState(false);
  const { thumbnailPath, givenName, familyName } = signer.extraData ?? {};
  const { relaySignersUpdate } = useAppSelector((state) => state.bhr);

  useEffect(() => {
    if (relaySignersUpdate && hasUpdatedDescription) {
      showToast('Details updated successfully', <TickIcon />);
      setHasUpdatedDescription(false);
    }
    return () => {
      dispatch(resetSignersUpdateState());
    };
  }, [relaySignersUpdate, hasUpdatedDescription]);

  const handleDescriptionUpdate = () => {
    if (description !== signer?.signerDescription) {
      setHasUpdatedDescription(true);
      dispatch(updateSignerDetails(signer, 'signerDescription', description));
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Additional Details"
        subtitle="Optionally you can add description and associate a contact with the key"
      />
      <VStack style={styles.descriptionContainer}>
        <Box style={styles.inputWrapper}>
          <KeeperTextInput
            autoCapitalize="sentences"
            onChangeText={(text) => setDescription(text)}
            style={styles.descriptionEdit}
            placeholder="Add a description (Optional)" // TODO: Use translations
            placeholderTextColor={Colors.secondaryDarkGrey}
            value={description}
            maxLength={20}
            onSubmitEditing={handleDescriptionUpdate}
          />
        </Box>
        <OptionTile
          title="Associate a Contact"
          callback={() => {
            signer?.extraData?.givenName
              ? setEditContactModal(true)
              : navigation.navigate('AssociateContact', {
                  signer,
                });
          }}
          icon={<PhoneBookIcon />}
          image={getPersistedDocument(signer?.extraData?.thumbnailPath)}
        />
      </VStack>
      <KeeperModal
        visible={editContactModal}
        close={() => setEditContactModal(false)}
        showCloseIcon={false}
        title="Associated Contact"
        subTitle="The contact you associated with the Key will be displayed here"
        buttonText="Edit Details"
        secondaryButtonText="Cancel"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.modalWhiteContent`}
        buttonTextColor={`${colorMode}.buttonText`}
        buttonBackground={`${colorMode}.pantoneGreen`}
        secondaryCallback={() => setEditContactModal(false)}
        buttonCallback={() => {
          setEditContactModal(false);
          navigation.navigate('EditContact', {
            signer,
          });
        }}
        Content={() => (
          <Box
            style={styles.contactInfoCard}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderColor={`${colorMode}.greyBorder`}
          >
            <Box style={styles.iconContainer}>
              {thumbnailPath ? (
                <Image
                  source={{ uri: getPersistedDocument(thumbnailPath) || 'default-avatar-url' }}
                  style={styles.modalAvatar}
                />
              ) : (
                <ImagePlaceHolder style={styles.modalAvatar} />
              )}
            </Box>
            <Text medium style={styles.buttonText}>
              {givenName} {familyName}
            </Text>
          </Box>
        )}
      />
    </ScreenWrapper>
  );
}

export default AdditionalDetails;

const styles = StyleSheet.create({
  descriptionEdit: {
    paddingLeft: wp(20),
    borderRadius: 10,
    fontFamily: Fonts.InterRegular,
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    marginTop: hp(20),
    gap: hp(5),
    marginHorizontal: '2.5%',
  },
  inputWrapper: {
    width: '100%',
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
  iconContainer: {
    marginRight: 10,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
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
