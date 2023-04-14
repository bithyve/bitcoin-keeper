import { View, StyleSheet } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box } from 'native-base';
import { hp } from 'src/common/data/responsiveness/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';
import SomeDefinationIcon from 'src/assets/images/SomeDefination.svg';
import { modalParams } from 'src/common/data/models/interfaces/UTXOs';

function mixContent() {
  return (
    <View style={styles.container}>

      <Text style={[styles.paraText, styles.italianText]}>Pool</Text>
      <Text style={styles.paraText}>
        The denonination of the pool you have selected for this mix.
      </Text>
      <Text style={[styles.paraText, styles.italianText]}>Anonset</Text>
      <Text style={styles.paraText}>
        This is a measure of how well hidden you are
      </Text>
      <Box style={styles.iconWrapper}>
        <SomeDefinationIcon />
      </Box>
      <Text style={[styles.paraText, styles.italianText]}>Pool Fee</Text>
      <Text style={styles.paraText}>
        The fixed fee required to enter the pool
      </Text>
      <Text style={[styles.paraText, styles.italianText]}>Premix Outputs</Text>
      <Text style={styles.paraText}>
        Number of UTXOs that come out of the Premix
      </Text>
    </View>
  );
}
function LearnMoreModal({ visible, closeModal }: modalParams) {
  return (
    <KeeperModal
      visible={visible}
      close={() => {
        closeModal()
      }}
      title="Some Definitions:"
      subTitle=""
      modalBackground={['light.gradientStart', 'light.gradientEnd']}
      textColor="light.white"
      Content={mixContent}
      DarkCloseIcon
      learnMore
      learnMoreCallback={() => openLink('https://www.bitcoinkeeper.app/')}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 5
  },
  iconWrapper: {
    alignSelf: "center",
    marginVertical: hp(20)
  },
  paraText: {
    color: "white",
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1
  },
  italianText: {
    fontStyle: 'italic',
    fontWeight: '700'
  }
})
export default LearnMoreModal;