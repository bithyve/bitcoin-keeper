import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch, useSelector } from 'react-redux';
import { Box, useColorMode } from 'native-base';
import VaultSetupIcon from 'src/assets/images/pull-down-wallet.svg';
import { hp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import PrivateVaultIllustration from 'src/assets/privateImages/refreshModalIcon.svg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';

function LinkedWalletContent({ privateTheme }) {
  return (
    <View style={styles.contentContainer}>
      <Box alignSelf="center">
        {privateTheme ? <PrivateVaultIllustration /> : <VaultSetupIcon />}
      </Box>
      <Text style={styles.contentText}>
        When a transaction (send or receive) is submitted to the bitcoin network from a wallet, it
        may take a little while before it is propagated and visible to all nodes and wallets. Its
        confirmation status also changes as new blocks are mined.{' '}
      </Text>
    </View>
  );
}
function LearnMoreModal({ introModal, setIntroModal }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const green_modal_background = ThemedColor({ name: 'green_modal_background' });

  return (
    <KeeperModal
      visible={introModal}
      close={() => {
        dispatch(setIntroModal(false));
      }}
      title="Pull Down to Refresh"
      subTitle="If you want to check the latest status of a transaction, simply pull down the transaction list and it will fetch the latest status and wallet balance."
      modalBackground={green_modal_background}
      textColor={`${colorMode}.headerWhite`}
      Content={() => <LinkedWalletContent privateTheme={privateTheme} />}
      DarkCloseIcon
      buttonText={common.Okay}
      secondaryButtonText={common.needHelp}
      buttonTextColor={`${colorMode}.pantoneGreen`}
      buttonBackground={`${colorMode}.whiteSecButtonText`}
      secButtonTextColor={`${colorMode}.whiteSecButtonText`}
      secondaryIcon={<ConciergeNeedHelp />}
      secondaryCallback={() => {
        dispatch(setIntroModal(false));
        navigation.dispatch(
          CommonActions.navigate({
            name: 'CreateTicket',
            params: {
              tags: [ConciergeTag.WALLET],
              screenName: 'wallet-details',
            },
          })
        );
      }}
      buttonCallback={() => dispatch(setIntroModal(false))}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    marginVertical: 5,
  },
  contentText: {
    marginTop: hp(20),
    color: 'white',
    fontSize: 14,
    letterSpacing: 0.65,
    padding: 1,
  },
});

export default LearnMoreModal;
