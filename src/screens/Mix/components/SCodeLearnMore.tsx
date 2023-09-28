import React from 'react';
import { StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import { modalParams } from 'src/models/interfaces/UTXOs';
import ScodeIllustration from 'src/assets/images/SomeDefination.svg';

function SCodeContent() {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container}>
      <Text style={styles.titleText} italic color={`${colorMode}.modalGreenContent`}>
        SCODES
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.modalGreenContent`}>
        SCODES are discount codes periodically released by Samurai on their social media platforms.
        Keep an eye out for them and use them to get attractive discounts on your whirlpool fees.
      </Text>
      <Box style={styles.iconWrapper}>
        <ScodeIllustration />
      </Box>
      <Text style={styles.titleText} color={`${colorMode}.modalGreenContent`}>
        Priority
      </Text>
      <Text style={styles.paraText} italic color={`${colorMode}.modalGreenContent`}>
        As in any bitcoin sending transaction, Priority determines how fast your transaction gets
        confirmed on the bitcoin blockchain.
      </Text>
    </Box>
  );
}

function SCodeLearnMore({ visible, closeModal }: modalParams) {
  const { colorMode } = useColorMode();
  return (
    <KeeperModal
      visible={visible}
      close={() => {
        closeModal();
      }}
      title="Some Definitions:"
      subTitle=""
      DarkCloseIcon
      modalBackground={`${colorMode}.modalGreenBackground`}
      textColor={`${colorMode}.modalGreenContent`}
      Content={SCodeContent}
      learnMore
      learnMoreCallback={() => openLink('https://help.bitcoinkeeper.app/knowledge-base/what-is-whirlpool/')}
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
  titleText: {
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
    fontWeight: 'bold',
  },
  paraText: {
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
  },
  iconWrapper: {
    alignSelf: 'center',
  },
});

export default SCodeLearnMore;
