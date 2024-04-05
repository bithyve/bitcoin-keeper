import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { wp } from 'src/constants/responsive';
import CreateTribeWalletIllustration from 'src/assets/images/createTribeWalletIllustration.svg';
import KeeperModal from '../KeeperModal';
import Text from '../KeeperText';
import { LocalizationContext } from 'src/context/Localization/LocContext';

function CreateTribeWalletModalContent() {
  const { colorMode } = useColorMode();
  return (
    <Box>
      <Box style={styles.illustartionWrapper}>
        <CreateTribeWalletIllustration />
      </Box>
      <Box>
        <Text color={`${colorMode}.secondaryText`} style={styles.descText}>
          If you have backed-up Keeper Recovery Key, you don’t need to backup Tribe separately.
        </Text>
      </Box>
    </Box>
  );
}
function CreateTribeWalletModal(props) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, home } = translations;

  return (
    <KeeperModal
      dismissible
      close={() => {}}
      visible={props.visible}
      title={home.createTribeWalletTitle}
      subTitle={home.createTribeWalletSubTitle}
      Content={CreateTribeWalletModalContent}
      buttonText={common.accept}
      secondaryButtonText={common.deny}
      secondaryCallback={() => {
        props.secondaryCallback();
      }}
      buttonCallback={() => {
        props.buttonCallback();
      }}
      showButtons
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.primaryText`}
      subTitleColor={`${colorMode}.secondaryText`}
      subTitleWidth={wp(280)}
      showCloseIcon={false}
    />
  );
}
const styles = StyleSheet.create({
  descText: {
    fontSize: 13,
    width: wp(300),
  },
  illustartionWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
export default CreateTribeWalletModal;
