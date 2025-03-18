import { View, StyleSheet } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import Illustration7 from 'src/assets/images/illustration_7.svg';
import { hp } from 'src/constants/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';
import DotView from 'src/components/DotView';
import { modalParams } from 'src/models/interfaces/UTXOs';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';

function PremixContent() {
  const { colorMode } = useColorMode();
  return (
    <View style={styles.container}>
      <Box style={styles.iconWrapper}>
        <Illustration7 />
      </Box>
      <Box style={styles.paraViewWrapper}>
        <Box style={styles.dotWrapper}>
          <DotView height={1.5} width={1.5} color={`${colorMode}.headerWhite`} />
        </Box>
        <Box style={styles.textWrapper}>
          <Text style={styles.paraText}>Once Tx0 is created, it goes into a Premix Wallet.</Text>
        </Box>
      </Box>
      <Box style={styles.paraViewWrapper}>
        <Box style={styles.dotWrapper}>
          <DotView height={1.5} width={1.5} color={`${colorMode}.headerWhite`} />
        </Box>
        <Box style={styles.textWrapper}>
          <Text style={styles.paraText}>
            Change that remains from the creation of Tx0 goes to the Bad Bank.
          </Text>
        </Box>
      </Box>
      <Box style={styles.paraViewWrapper}>
        <Box style={styles.dotWrapper}>
          <DotView height={1.5} width={1.5} color={`${colorMode}.headerWhite`} />
        </Box>
        <Box style={styles.textWrapper}>
          <Text style={styles.paraText}>
            Sats after being Whirlpooled land in the Post Mix wallet
          </Text>
        </Box>
      </Box>
    </View>
  );
}
function LearnMoreModal({ visible, closeModal }: modalParams) {
  const { colorMode } = useColorMode();
  return (
    <KeeperModal
      visible={visible}
      close={() => {
        closeModal();
      }}
      title="Setting up Premix"
      subTitle="You are about to start your first mix. In the next few steps, you’ll be guided to create your Tx0. Tx0 gets created based on the pool you select ahead."
      modalBackground={`${colorMode}.modalGreenBackground`}
      textColor={`${colorMode}.headerWhite`}
      Content={PremixContent}
      DarkCloseIcon
      learnMore
      learnMoreCallback={() => openLink(`${KEEPER_KNOWLEDGEBASE}sections/17237989295773-Whirlpool`)}
      buttonText="Proceed"
      buttonTextColor={`${colorMode}.modalWhiteButtonText`}
      buttonBackground={`${colorMode}.modalWhiteButton`}
      buttonCallback={() => closeModal()}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  iconWrapper: {
    alignSelf: 'center',
  },
  paraViewWrapper: {
    marginTop: hp(20),
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  dotWrapper: {
    height: '100%',
    width: '5%',
    paddingTop: '3%',
  },
  textWrapper: {
    width: '95%',
  },
  paraText: {
    color: 'white',
    fontSize: 14,
    letterSpacing: 0.65,
    padding: 1,
  },
});
export default LearnMoreModal;
