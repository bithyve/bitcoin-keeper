import { View } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { Box, useColorMode } from 'native-base';
import VaultSetupIcon from 'src/assets/images/pull-down-wallet.svg';
import { hp } from 'src/constants/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';

function LinkedWalletContent() {
  return (
    <View marginY={5}>
      <Box alignSelf="center">
        <VaultSetupIcon />
      </Box>
      <Text marginTop={hp(20)} color="white" fontSize={13} letterSpacing={0.65} padding={1}>
        When a transaction (send or receive) is submitted to the bitcoin network from a wallet, it
        may take a little while before it is propagated and be visible to all nodes and wallets.
        It’s confirmation status also changes as new blocks are mined.{' '}
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
      title="Pull Down to Refresh"
      subTitle="If you want to check the latest status of a transaction, simply pull down the transaction list and it will fetch the latest status and wallet balance."
      modalBackground={`${colorMode}.modalGreenBackground`}
      textColor={`${colorMode}.modalGreenContent`}
      Content={LinkedWalletContent}
      DarkCloseIcon
      learnMore
      showCloseIcon={false}
      learnMoreCallback={() => openLink(`${KEEPER_KNOWLEDGEBASE}categories/16888602602141-Wallet`)}
      buttonText="Back to Wallet"
      buttonTextColor={`${colorMode}.modalWhiteButtonText`}
      buttonBackground={`${colorMode}.modalWhiteButton`}
      buttonCallback={() => dispatch(setIntroModal(false))}
    />
  );
}

export default LearnMoreModal;
