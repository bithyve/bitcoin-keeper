import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import KeeperHeader from 'src/components/KeeperHeader';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import QRCommsLight from 'src/assets/images/qr_comms.svg';
import NFCLight from 'src/assets/images/nfc-no-bg-light.svg';
import ShareContactLight from 'src/assets/images/share-contact-light.svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import MenuOption from 'src/components/MenuOption';
import { Signer } from 'src/services/wallets/interfaces/vault';

function ContactDetails({ route }) {
  const { signerData }: { signerData: Signer } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { vault: vaultText } = translations;
  const shareOptions = [
    {
      icon: <QRCommsLight />,
      title: vaultText.shareQR,
      callback: () => {
        navigation.dispatch(
          CommonActions.navigate({
            name: 'ShareQR',
            params: { signerData },
          })
        );
      },
    },
    {
      icon: <NFCLight />,
      title: vaultText.nfcOnTap,
      callback: () => {},
    },
    {
      icon: <ShareContactLight />,
      title: vaultText.shareContactUsingFile,
      callback: () => {},
    },
  ];

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={`Contact Details`}
        subtitle={'Quickly exchange contact details with ease'}
      />
      <Box style={styles.container}>
        <Box style={styles.contentContainer}>
          {shareOptions.map((option, index) => (
            <MenuOption
              key={index}
              Icon={option.icon}
              title={option.title}
              showArrow={false}
              callback={option.callback}
            />
          ))}
        </Box>
      </Box>
    </ScreenWrapper>
  );
}

export default ContactDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: hp(30),
    paddingHorizontal: wp(10),
    justifyContent: 'space-between',
  },

  contentContainer: {
    gap: hp(7),
  },
});
