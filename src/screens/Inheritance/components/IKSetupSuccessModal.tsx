import { StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';

import Assert from 'src/assets/images/illustration.svg';
import { hp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import { modalParams } from 'src/models/interfaces/UTXOs';

function InitiateContent() {
  return (
    <Box style={styles.contentWrapper}>
      <Box style={styles.iconWrapper}>
        <Assert />
      </Box>
      <Text style={styles.paragraphText}>
        When a signer is changed and a new vault is created, some aspects of Inheritance documents
        may change
      </Text>
    </Box>
  );
}
function IKSetupSuccessModal({ visible, closeModal }: modalParams) {
  const { colorMode } = useColorMode();
  return (
    <KeeperModal
      visible={visible}
      close={() => closeModal()}
      title="Inheritance Support Setup Successful"
      subTitle="You have visited all sections of the Inheritance Support feature"
      modalBackground="#F7F2EC"
      buttonBackground={`${colorMode}.primaryGreen`}
      buttonText="View Inhetitance"
      buttonTextColor="#FAFAFA"
      buttonCallback={() => closeModal()}
      Content={InitiateContent}
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
    fontSize: 13,
    letterSpacing: 0.65,
    padding: 1,
  },
});

export default IKSetupSuccessModal;
