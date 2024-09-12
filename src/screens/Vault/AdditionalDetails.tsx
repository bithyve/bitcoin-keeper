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
import { useNavigation } from '@react-navigation/native';

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
});
