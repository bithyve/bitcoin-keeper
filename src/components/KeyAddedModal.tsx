import React from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import { getAccountFromSigner } from 'src/utils/utilities';
import ThemedSvg from './ThemedSvg.tsx/ThemedSvg';

function KeyAddedModal({ visible, close, signer }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();

  const defaultConfig = {
    buttonText: 'Add Description',
    buttonCallback: () => {
      close();
      signer &&
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

  const { buttonText, buttonCallback, secondaryButtonText, content } = defaultConfig;

  return (
    signer && (
      <KeeperModal
        visible={visible}
        title="Key Added Successfully!"
        subTitle={`${
          getAccountFromSigner(signer) !== 0
            ? `Account #${getAccountFromSigner(signer)} of the key was successfully added. `
            : ''
        }Access key details from Manage Keys and sign transactions from within wallets.`}
        close={close}
        showCloseIcon
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        buttonText={buttonText}
        buttonCallback={buttonCallback}
        secondaryButtonText={secondaryButtonText}
        secondaryCallback={close}
        Content={() => (
          <Box style={styles.externalKeyModal}>
            <ThemedSvg
              name={'success_illustration'}
              width={wp(200)}
              height={hp(200)}
              style={styles.externalKeyIllustration}
            />

            {content}
          </Box>
        )}
      />
    )
  );
}

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
