import { StyleSheet, View } from 'react-native';
import React, { useContext } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { Box, useColorMode } from 'native-base';
import { hp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import { ConciergeTag } from 'src/models/enums/ConciergeTag';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { CommonActions, useNavigation } from '@react-navigation/native';
import ConciergeNeedHelp from 'src/assets/images/conciergeNeedHelp.svg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';

function LinkedWalletContent() {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;
  return (
    <View style={styles.contentContainer}>
      <Box alignSelf="center">
        <ThemedSvg name={'VaultSetupIcon'} />
      </Box>
      <Text style={styles.contentText}>{walletTranslation.transactionStatus}</Text>
    </View>
  );
}
function LearnMoreModal({ introModal, setIntroModal }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletTranslation } = translations;

  const green_modal_background = ThemedColor({ name: 'green_modal_background' });

  return (
    <KeeperModal
      visible={introModal}
      close={() => {
        dispatch(setIntroModal(false));
      }}
      title={walletTranslation.pullDownToRefresh}
      subTitle={walletTranslation.pullDownSubtitle}
      modalBackground={green_modal_background}
      textColor={`${colorMode}.headerWhite`}
      Content={() => <LinkedWalletContent />}
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
