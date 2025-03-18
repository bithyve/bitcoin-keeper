import { View, StyleSheet } from 'react-native';
import React from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import { hp } from 'src/constants/responsive';
import openLink from 'src/utils/OpenLink';
import Text from 'src/components/KeeperText';
import SomeDefinationIcon from 'src/assets/images/SomeDefination.svg';
import { modalParams } from 'src/models/interfaces/UTXOs';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';

function MixContent() {
  const { colorMode } = useColorMode();
  return (
    <View style={styles.container}>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.headerWhite`}>
        Pool
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.headerWhite`}>
        The denonination of the pool you have selected for this mix.
      </Text>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.headerWhite`}>
        Anonset
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.headerWhite`}>
        This is a measure of how well hidden you are
      </Text>
      <Box style={styles.iconWrapper}>
        <SomeDefinationIcon />
      </Box>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.headerWhite`}>
        Pool Fee
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.headerWhite`}>
        The fixed fee required to enter the pool
      </Text>
      <Text style={[styles.paraText, styles.italianText]} color={`${colorMode}.headerWhite`}>
        Premix Outputs
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.headerWhite`}>
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
      modalBackground={`${colorMode}.pantoneGreen`}
      textColor={`${colorMode}.headerWhite`}
      Content={MixContent}
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
