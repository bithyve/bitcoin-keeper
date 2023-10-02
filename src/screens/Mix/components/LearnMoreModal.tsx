import { View, StyleSheet } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import { hp } from 'src/constants/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';
import SomeDefinationIcon from 'src/assets/images/SomeDefination.svg';
import { modalParams } from 'src/models/interfaces/UTXOs';
import { KEEPERWEBSITE } from 'src/core/config';

function MixContent() {
  const { colorMode } = useColorMode();
  return (
    <View style={styles.container}>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.modalGreenContent`}>
        Pool
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.modalGreenContent`}>
        The denonination of the pool you have selected for this mix.
      </Text>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.modalGreenContent`}>
        Anonset
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.modalGreenContent`}>
        This is a measure of how well hidden you are
      </Text>
      <Box style={styles.iconWrapper}>
        <SomeDefinationIcon />
      </Box>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.modalGreenContent`}>
        Pool Fee
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.modalGreenContent`}>
        The fixed fee required to enter the pool
      </Text>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.modalGreenContent`}>
        Premix Outputs
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.modalGreenContent`}>
        Number of UTXOs that come out of the Premix
      </Text>
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
      title="Some Definitions:"
      subTitle=""
      modalBackground={`${colorMode}.modalGreenBackground`}
      textColor={`${colorMode}.modalGreenContent`}
      Content={MixContent}
      DarkCloseIcon
      learnMore
      learnMoreCallback={() => openLink(`${KEEPERWEBSITE}knowledge-base/what-is-whirlpool/`)}
      buttonText="Proceed"
      buttonTextColor={colorMode === 'light' ? `${colorMode}.greenText2` : `${colorMode}.white`}
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
    marginVertical: hp(20),
  },
  paraText: {
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
  },
  italianText: {
    fontStyle: 'italic',
    fontWeight: '700',
  },
});
export default LearnMoreModal;
