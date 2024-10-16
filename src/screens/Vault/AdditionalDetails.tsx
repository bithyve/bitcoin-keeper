import { Image, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, useColorMode, VStack } from 'native-base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import { hp, wp } from 'src/constants/responsive';
import useSignerMap from 'src/hooks/useSignerMap';
import OptionTile from 'src/components/OptionTile';
import PhoneBookIcon from 'src/assets/images/phone-book-circle.svg';
import ImagePlaceHolder from 'src/assets/images/contact-image-placeholder.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import KeeperModal from 'src/components/KeeperModal';
import Text from 'src/components/KeeperText';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'AdditionalDetails'>;

function AdditionalDetails({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { signer: signerFromParam } = route.params;
  const { signerMap } = useSignerMap();
  const signer = signerMap[signerFromParam?.masterFingerprint];
  const [editContactModal, setEditContactModal] = useState(false);
  const { thumbnailPath, givenName, familyName } = signer.extraData;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Additional Details"
        subtitle="Optionally you can add description and associate a contact to key"
      />
      <VStack style={styles.descriptionContainer}>
        <OptionTile
          title="Associate a Contact"
          callback={() => {
            signer.extraData.givenName
              ? setEditContactModal(true)
              : navigation.dispatch(
                  CommonActions.navigate({
                    name: 'EditContact',
                    params: {
                      signer,
                    },
                  })
                );
          }}
          icon={<PhoneBookIcon />}
          image={signer?.extraData?.thumbnailPath}
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
        buttonTextColor={`${colorMode}.white`}
        buttonBackground={`${colorMode}.greenButtonBackground`}
        secButtonTextColor={`${colorMode}.greenButtonBackground`}
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
                  source={{ uri: thumbnailPath || 'default-avatar-url' }}
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
  descriptionContainer: {
    marginTop: hp(20),
    gap: hp(5),
    marginHorizontal: '2.5%',
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
});
