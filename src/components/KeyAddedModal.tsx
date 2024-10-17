import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import SuccessCircleIllustration from 'src/assets/images/illustration.svg';
import Text from './KeeperText';
import { SignerType } from 'src/services/wallets/enums';

const KeyAddedModal = ({ visible, close, signer }) => {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();

  const signerTypeConfig = {
    [SignerType.KEEPER]: {
      buttonText: 'Add Description',
      buttonCallback: () => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'AdditionalDetails',
            params: { signer },
          })
        );
      },
      secondaryButtonText: 'Cancel',
      content: (
        <Text color={`${colorMode}.primaryText`} style={styles.externalKeyText}>
          You can associate a contact with this key if you wish to.
        </Text>
      ),
    },
  };

  const defaultConfig = {
    buttonText: 'Add Description',
    buttonCallback: () => {
      close();
      navigation.dispatch(
        CommonActions.navigate({
          name: 'AdditionalDetails',
          params: { signer },
        })
      );
    },
    secondaryButtonText: 'Cancel',
    secondaryButtonCallback: close,
    content: null,
  };

  const { buttonText, buttonCallback, secondaryButtonText, content } =
    signer?.type && signerTypeConfig[signer?.type] ? signerTypeConfig[signer?.type] : defaultConfig;

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
      buttonText={buttonText}
      buttonCallback={buttonCallback}
      secondaryButtonText={secondaryButtonText}
      secondaryCallback={close}
      Content={() => (
        <Box style={styles.externalKeyModal}>
          <SuccessCircleIllustration style={styles.externalKeyIllustration} />
          {content}
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
