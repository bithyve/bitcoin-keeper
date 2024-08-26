import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import SuccessCircleIllustration from 'src/assets/images/illustration.svg';
import Text from './KeeperText';

const KeyAddedModal = ({ visible, close, signer }) => {
  const navigtaion = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslations } = translations;

  return (
    <KeeperModal
      visible={visible}
      title="Key added successfully!"
      subTitle="Access key details from Manage Keys and sign transactions from within wallets."
      close={close}
      showCloseIcon
      DarkCloseIcon={colorMode === 'dark'}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.modalWhiteContent`}
      buttonTextColor={`${colorMode}.buttonText`}
      buttonBackground={`${colorMode}.greenButtonBackground`}
      buttonText="Add Contact"
      secondaryButtonText="Skip"
      secondaryCallback={close}
      Content={() => (
        <Box style={styles.externalKeyModal}>
          <SuccessCircleIllustration style={styles.externalKeyIllustration} />
          <Text color={`${colorMode}.primaryText`} style={styles.externalKeyText}>
            You can associate a contact with this key if you wish to.
          </Text>
        </Box>
      )}
    />
  );
};

const styles = StyleSheet.create({
  externalKeyModal: {
    alignItems: 'center',
  },
  externalKeyIllustration: {
    marginBottom: hp(20),
    marginRight: wp(15),
  },
  externalKeyText: {
    marginBottom: hp(20),
  },
});

export default KeyAddedModal;
