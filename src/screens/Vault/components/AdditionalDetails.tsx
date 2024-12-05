import { StyleSheet } from 'react-native';
import React, { useState } from 'react';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import { Box, useColorMode, VStack } from 'native-base';
import useToastMessage from 'src/hooks/useToastMessage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParams } from 'src/navigation/types';
import Text from 'src/components/KeeperText';
import Colors from 'src/theme/Colors';
import { hp, wp } from 'src/constants/responsive';
import Fonts from 'src/constants/Fonts';
import { TextInput } from 'react-native-gesture-handler';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { useDispatch } from 'react-redux';
import useSignerMap from 'src/hooks/useSignerMap';
import TickIcon from 'src/assets/images/tick_icon.svg';
import { getKeyUID } from 'src/utils/utilities';

type ScreenProps = NativeStackScreenProps<AppStackParams, 'AdditionalDetails'>;

function AdditionalDetails({ route }: ScreenProps) {
  const { colorMode } = useColorMode();
  const { showToast } = useToastMessage();
  const dispatch = useDispatch();
  const { signer: signerFromParam } = route.params;
  const { signerMap } = useSignerMap();
  const signer = signerMap[getKeyUID(signerFromParam)];
  const [description, setDescription] = useState(signer?.signerDescription || '');

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Additional Details"
        subtitle="Optionally you can add description and associate a contact to key"
      />
      <VStack style={styles.descriptionContainer}>
        <Box style={styles.inputWrapper}>
          <TextInput
            autoCapitalize="sentences"
            onChangeText={(text) => setDescription(text)}
            style={[
              styles.descriptionEdit,
              {
                borderColor: Colors.SilverMist,
                backgroundColor: colorMode === 'dark' ? Colors.SeashellDark : Colors.Seashell,
                color: colorMode === 'dark' ? Colors.GraniteGrayDark : Colors.GraniteGray,
              },
            ]}
            placeholder="Add a Description (Optional)"
            placeholderTextColor={Colors.Graphite}
            value={description}
            maxLength={20}
            onSubmitEditing={() => {
              dispatch(updateSignerDetails(signer, 'signerDescription', description));
              showToast('Description updated successfully', <TickIcon />);
            }}
          />
          <Text color={`${colorMode}.GreyText`} semiBold style={styles.limitText}>
            {description.length}/20
          </Text>
        </Box>
      </VStack>
    </ScreenWrapper>
  );
}

export default AdditionalDetails;

const styles = StyleSheet.create({
  descriptionEdit: {
    height: hp(50),
    borderWidth: 1,
    alignItems: 'center',
    paddingLeft: wp(20),
    marginVertical: hp(10),
    borderRadius: 10,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  descriptionContainer: {
    marginTop: hp(20),
    marginHorizontal: '5%',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  limitText: {
    position: 'absolute',
    right: wp(12),
    bottom: hp(25),
    fontSize: 12,
    letterSpacing: 0.6,
  },
});
