import React, { useContext } from 'react';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import SuccessCircleIllustration from 'src/assets/images/illustration.svg';
import { getAccountFromSigner } from 'src/utils/utilities';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function KeyAddedModal({ visible, close, signer }) {
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, importWallet, signer: signerText } = translations;

  const defaultConfig = {
    buttonText: importWallet.addDescription,
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
    secondaryButtonText: common.cancel,
    secondaryButtonCallback: close,
    content: null,
  };

  const { buttonText, buttonCallback, secondaryButtonText, content } = defaultConfig;

  return (
    signer && (
      <KeeperModal
        visible={visible}
        title={signerText.keyAddedTitle}
        subTitle={`${
          getAccountFromSigner(signer) !== 0
            ? `${common.Account} #${getAccountFromSigner(signer)} ${signerText.halfSuccessfulText} `
            : ''
        }${signerText.AccessKeyDetails}`}
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
            <SuccessCircleIllustration style={styles.externalKeyIllustration} />
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
