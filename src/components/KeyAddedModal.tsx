import React, { useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Box, Text, useColorMode } from 'native-base';
import moment from 'moment';
import KeeperModal from 'src/components/KeeperModal';
import { hp, wp } from 'src/constants/responsive';
import { StyleSheet } from 'react-native';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { SDIcons } from 'src/screens/Vault/SigningDeviceIcons';

function ModalCard({ title, subTitle, icon = null }) {
  const { colorMode } = useColorMode();
  return (
    <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.cardContainer}>
      <Box style={styles.iconContainer}>
        <HexagonIcon
          width={wp(42.5)}
          height={hp(38)}
          icon={icon}
          backgroundColor={colorMode == 'dark' ? Colors.ForestGreenDark : Colors.pantoneGreen}
        />
      </Box>
      <Box style={styles.textContainer}>
        <Text style={styles.titleText} color={`${colorMode}.headerText`}>
          {title}
        </Text>
        <Text style={styles.subTitleText} color={`${colorMode}.GreyText`}>
          {subTitle}
        </Text>
      </Box>
    </Box>
  );
}

const KeyAddedModal = ({ visible, close, signer }) => {
  const navigtaion = useNavigation();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { signer: signerTranslations } = translations;

  return (
    <KeeperModal
      visible={visible}
      close={close}
      title={signerTranslations.signerAddedSuccessMessage}
      subTitle={signerTranslations.signerAvailableMessage}
      showCloseIcon={false}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.modalWhiteContent`}
      Content={() => (
        <Box style={{ gap: 20 }}>
          <ModalCard
            title={signer?.signerName}
            icon={SDIcons(signer?.type, colorMode !== 'dark').Icon}
            subTitle={`Added ${moment(signer?.addedOn).calendar().toLowerCase()}`}
          />
          <Text style={styles.descText}>{signerTranslations.signerAddedDesc}</Text>
        </Box>
      )}
      buttonText={signerTranslations.signerDeatils}
      buttonTextColor={`${colorMode}.buttonText`}
      buttonBackground={`${colorMode}.greenButtonBackground`}
      buttonCallback={() => {
        close();
        navigtaion.navigate('SigningDeviceDetails', {
          signerId: signer?.masterFingerprint,
        });
      }}
    />
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    minHeight: hp(70),
    marginBottom: hp(35),
    marginTop: hp(20),
  },
  titleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subTitleText: {
    fontSize: 12,
    fontWeight: '400',
  },
  iconContainer: {
    marginHorizontal: 10,
  },
  textContainer: {},
  descText: {
    fontSize: 13,
    letterSpacing: 0.13,
    fontWeight: '400',
    marginBottom: hp(20),
  },
});

export default KeyAddedModal;
