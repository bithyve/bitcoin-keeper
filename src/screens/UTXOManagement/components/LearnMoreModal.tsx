import { View, StyleSheet } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box } from 'native-base';
import Illustration7 from 'src/assets/images/illustration_7.svg'
import { hp } from 'src/common/data/responsiveness/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';

function premixContent() {
  return (
    <View style={styles.container}>
      <Box style={styles.iconWrapper}>
        <Illustration7 />
      </Box>
      <Text style={styles.paraText01}>
        Once Tx0 is created, it goes into a Premix Wallet.
      </Text>
      <Text style={styles.paraText02}>
        Change that remains from the creation of Tx0 goes to the Bad Bank.
      </Text>
      <Text style={styles.paraText02}>
        Sats after being Whirlpooled land in the Post Mix wallet
      </Text>
    </View>
  );
}
function LearnMoreModal({ visible, closeModal }) {
  return (
    <KeeperModal
      visible={visible}
      close={() => {
        closeModal()
      }}
      title="Setting up Premix"
      subTitle="You are about to start your first mix. In the next few steps, you’ll be guided to create your Tx0. Tx0 gets created based on the pool you select ahead."
      modalBackground={['light.gradientStart', 'light.gradientEnd']}
      textColor="light.white"
      Content={premixContent}
      DarkCloseIcon
      learnMore
      learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
      buttonText='Continue'
      buttonBackground={['#FFFFFF', '#80A8A1']}
      buttonTextColor='#073E39'
      buttonCallback={() => closeModal()}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 5
  },
  iconWrapper: {
    alignSelf: "center"
  },
  paraText01: {
    marginTop: hp(20),
    color: "white",
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1
  },
  paraText02: {
    color: "white",
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1
  }
})
export default LearnMoreModal;
