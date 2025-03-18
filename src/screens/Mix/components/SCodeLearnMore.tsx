import React from 'react';
import { StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import openLink from 'src/utils/OpenLink';
import { modalParams } from 'src/models/interfaces/UTXOs';
import ScodeIllustration from 'src/assets/images/SomeDefination.svg';
import { KEEPER_KNOWLEDGEBASE } from 'src/utils/service-utilities/config';

function SCodeContent() {
  const { colorMode } = useColorMode();
  return (
    <Box style={styles.container}>
      <Text style={styles.titleText} italic color={`${colorMode}.headerWhite`}>
        SCODES
      </Text>
      <Text style={styles.paraText} color={`${colorMode}.headerWhite`}>
        SCODES are discount codes periodically released by Samurai on their social media platforms.
        Keep an eye out for them and use them to get attractive discounts on your whirlpool fees.
      </Text>
      <Box style={styles.iconWrapper}>
        <ScodeIllustration />
      </Box>
      <Text style={styles.titleText} color={`${colorMode}.headerWhite`}>
        Priority
      </Text>
      <Text style={styles.paraText} italic color={`${colorMode}.headerWhite`}>
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
      textColor={`${colorMode}.headerWhite`}
      Content={SCodeContent}
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
