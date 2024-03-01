import { View } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { Box, useColorMode } from 'native-base';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { hp } from 'src/constants/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';
import { KEEPER_KNOWLEDGEBASE } from 'src/core/config';

function LinkedWalletContent() {
  return (
    <View marginY={5}>
      <Box alignSelf="center">
        <VaultSetupIcon />
      </Box>
      <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
        You can use the individual wallet’s Recovery Phrases to connect other bitcoin apps to Keeper
      </Text>
      <Text color="white" fontSize={13} letterSpacing={0.65} padding={1}>
        When the funds in a wallet cross a threshold, a transfer to the vault is triggered. This
        ensures you don’t have more sats in hot wallets than you need.
      </Text>
    </View>
  );
}
function LearnMoreModal({ introModal, setIntroModal }) {
  const dispatch = useDispatch();
  const { colorMode } = useColorMode();
  return (
    <KeeperModal
      visible={introModal}
      close={() => {
        dispatch(setIntroModal(false));
      }}
      title="Bip-85 Wallets"
      subTitle="Create as many (hot) wallets as you want, and backup with a single Recovery Phrase"
      modalBackground={`${colorMode}.modalGreenBackground`}
      textColor={`${colorMode}.modalGreenContent`}
      Content={LinkedWalletContent}
      DarkCloseIcon
      learnMore
      learnMoreCallback={() => openLink(`${KEEPER_KNOWLEDGEBASE}knowledge-base/backup/`)}
      buttonText="Continue"
      buttonTextColor={`${colorMode}.modalWhiteButtonText`}
      buttonBackground={`${colorMode}.modalWhiteButton`}
      buttonTextColor={`${colorMode}.headerText`}
      buttonCallback={() => dispatch(setIntroModal(false))}
    />
  );
}

export default LearnMoreModal;
