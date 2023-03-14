import { View } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { Box } from 'native-base';
import VaultSetupIcon from 'src/assets/images/vault_setup.svg';
import { hp } from 'src/common/data/responsiveness/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';

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
  return (
    <KeeperModal
      visible={introModal}
      close={() => {
        dispatch(setIntroModal(false));
      }}
      title="Bip-85 Wallets"
      subTitle="Create as many (hot) wallets as you want, and backup with a single Recovery Phrase"
      modalBackground={['light.gradientStart', 'light.gradientEnd']}
      textColor="light.white"
      Content={LinkedWalletContent}
      DarkCloseIcon
      learnMore
      learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
    />
  );
}

export default LearnMoreModal;
