import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
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

type ScreenProps = NativeStackScreenProps<AppStackParams, 'AdditionalDetails'>;

function AdditionalDetails({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { signer: signerFromParam } = route.params;
  const { signerMap } = useSignerMap();
  const signer = signerMap[signerFromParam?.masterFingerprint];
  const [description, setDescription] = useState(signer?.signerDescription || '');
  const [editContactModal, setEditContactModal] = useState(false);

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Additional Details"
        subtitle="Optionally you can add description and associate a contact to key"
      />
      <VStack style={styles.descriptionContainer}>
        <Box style={styles.inputWrapper}>
          <KeeperTextInput
            autoCapitalize="sentences"
            onChangeText={(text) => setDescription(text)}
            style={styles.descriptionEdit}
            placeholder="Add a Description (Optional)"
            placeholderTextColor={Colors.Graphite}
            value={description}
            maxLength={20}
            onSubmitEditing={() => {
              dispatch(updateSignerDetails(signer, 'signerDescription', description));
              showToast('Description updated successfully', <TickIcon />);
            }}
          />
        </Box>
        <OptionTile
          title="Associate a Contact"
          callback={() => {
            navigation.navigate('AssociateContact');
          }}
          icon={<PhoneBookIcon />}
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
        Content={() => (
          <Box
            style={styles.contactInfoCard}
            backgroundColor={`${colorMode}.seashellWhite`}
            borderColor={`${colorMode}.greyBorder`}
          >
            <Box style={styles.iconContainer}>
              <ImagePlaceHolder style={styles.modalAvatar} />
            </Box>
            <Text medium style={styles.buttonText}></Text>
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
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    marginTop: hp(20),
    gap: hp(5),
    marginHorizontal: '5%',
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
});
