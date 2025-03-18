import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';

import Illustration7 from 'src/assets/images/illustration_7.svg';
import { hp } from 'src/constants/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import { modalParams } from 'src/models/interfaces/UTXOs';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';

function InitiateContent() {
  return (
    <Box style={styles.contentWrapper}>
      <Box style={styles.iconWrapper}>
        <Illustration7 />
      </Box>
      <Text style={styles.paragraphText}>
        When you initiate a Whirlpool, Keeper creates 3 wallets: Premix, Post mix and Bad Bank.
        Premix houses sats readied for whirlpool. Sats after mixing go to Post mix, while Bad Bank
        retains sats with PIIs.
      </Text>
    </Box>
  );
}
function InitiateWhirlpoolModal({ visible, closeModal }: modalParams) {
  const { colorMode } = useColorMode();
  return (
    <KeeperModal
      visible={visible}
      close={() => closeModal()}
      title="Whirlpool"
      subTitle="Dissociate your Personal Identifyable Information (PII) from your bitcoin."
      modalBackground={`${colorMode}.pantoneGreen`}
      textColor={`${colorMode}.headerWhite`}
      Content={InitiateContent}
      DarkCloseIcon
      learnMore
      learnMoreCallback={() => openLink(`${KEEPER_KNOWLEDGEBASE}sections/17237989295773-Whirlpool`)}
      buttonText="Proceed"
      buttonTextColor={`${colorMode}.textGreen`}
      buttonBackground={`${colorMode}.modalWhiteButton`}
      buttonCallback={() => closeModal()}
    />
  );
}
const styles = StyleSheet.create({
  contentWrapper: {
    marginVertical: 5,
  },
  iconWrapper: {
    alignSelf: 'center',
  },
  paragraphText: {
    marginTop: hp(20),
    color: 'white',
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
  },
});

export default InitiateWhirlpoolModal;
