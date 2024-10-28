import React from 'react';
import { SignerStorage, SignerType } from 'src/services/wallets/enums';

import COLDCARDICON from 'src/assets/images/coldcard_icon.svg';
import COLDCARDICONLIGHT from 'src/assets/images/coldcard_light.svg';
import COLDCARDLOGO from 'src/assets/images/coldcard_logo.svg';
import JADEICON from 'src/assets/images/jade_icon.svg';
import JADEICONLIGHT from 'src/assets/images/jade_icon_light.svg';
import JADELOGO from 'src/assets/images/jade_logo.svg';
import KEEPERAPP from 'src/assets/images/KeeperIcon.svg';
import KEEPERAPPLIGHT from 'src/assets/images/KeeperIconLight.svg';
import KEYSTONEICON from 'src/assets/images/keystone_icon.svg';
import KEYSTONEICONLIGHT from 'src/assets/images/keystone_icon_light.svg';
import KEYSTONELOGO from 'src/assets/images/keystone_logo.svg';
import LEDGERICON from 'src/assets/images/ledger_icon.svg';
import LEDGERICONLIGHT from 'src/assets/images/ledger_light.svg';
import LEDGERLOGO from 'src/assets/images/ledger_logo.svg';
import MOBILEKEY from 'src/assets/images/mobile_key.svg';
import MOBILEKEYLIGHT from 'src/assets/images/mobile_key_light.svg';
import PASSPORTICON from 'src/assets/images/passport_icon.svg';
import PASSPORTICONLIGHT from 'src/assets/images/passport_light.svg';
import PASSPORTLOGO from 'src/assets/images/passport_logo.svg';
import SEEDSIGNERICON from 'src/assets/images/seedsigner_icon.svg';
import SEEDSIGNERICONLIGHT from 'src/assets/images/seedsigner_light.svg';
import SEEDSIGNERLOGO from 'src/assets/images/seedsignerlogo.svg';
import SPECTERICON from 'src/assets/images/specter_icon.svg';
import SPECTERICONLIGHT from 'src/assets/images/specter_icon_light.svg';
import SPECTERLOGO from 'src/assets/images/specter_logo.svg';
import SEEDWORDS from 'src/assets/images/seedwords.svg';
import SEEDWORDSLIGHT from 'src/assets/images/seedwordsLight.svg';
import SERVER from 'src/assets/images/server.svg';
import SERVERLIGHT from 'src/assets/images/server_light.svg';
import TAPSIGNERICON from 'src/assets/images/tapsigner_icon.svg';
import TAPSIGNERICONLIGHT from 'src/assets/images/tapsigner_light.svg';
import TAPSIGNERLOGO from 'src/assets/images/tapsigner_logo.svg';
import TREZORICON from 'src/assets/images/trezor_icon.svg';
import TREZORICONLIGHT from 'src/assets/images/trezor_light.svg';
import TREZORLOGO from 'src/assets/images/trezor_logo.svg';
import BITBOXICON from 'src/assets/images/BitBox.svg';
import BITBOXICONLIGHT from 'src/assets/images/BitBoxLight.svg';
import BITBOXLOGO from 'src/assets/images/bitbox_logo.svg';
import OTHERSDICON from 'src/assets/images/other.svg';
import OTHERSDICONLIGHT from 'src/assets/images/other_light.svg';
import INHERITANCEKEYLIGHT from 'src/assets/images/inheritance_key_light.svg';
import INHERITANCEKEYDARK from 'src/assets/images/inheritance_key_dark.svg';
import PortalLogo from 'src/assets/images/portalLogo.svg';
import PortalIcon from 'src/assets/images/portalIcon.svg';

import Text from 'src/components/KeeperText';
import { StyleSheet } from 'react-native';
import { useColorMode } from 'native-base';

const getColouredIcon = (LightComponent, DarkComponent, isLight, width, height) => {
  const component = isLight ? LightComponent : DarkComponent;
  return React.cloneElement(component, { width, height });
};

export const SDIcons = (type: SignerType, light = false, width = 20, height = 20) => {
  const { colorMode } = useColorMode();
  switch (type) {
    case SignerType.COLDCARD:
      return {
        Icon: getColouredIcon(<COLDCARDICONLIGHT />, <COLDCARDICON />, light, width, height),
        Logo: <COLDCARDLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.JADE:
      return {
        Icon: getColouredIcon(<JADEICONLIGHT />, <JADEICON />, light, width, height),
        Logo: <JADELOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.MY_KEEPER:
      return {
        Icon: getColouredIcon(<MOBILEKEYLIGHT />, <MOBILEKEY />, light, width, height),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            Mobile Key
          </Text>
        ),
      };
    case SignerType.KEEPER:
      return {
        Icon: getColouredIcon(<KEEPERAPPLIGHT />, <KEEPERAPP />, light, width, height),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            External Key
          </Text>
        ),
      };
    case SignerType.KEYSTONE:
      return {
        Icon: getColouredIcon(<KEYSTONEICONLIGHT />, <KEYSTONEICON />, light, width, height),
        Logo: <KEYSTONELOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.LEDGER:
      return {
        Icon: getColouredIcon(<LEDGERICONLIGHT />, <LEDGERICON />, light, width, height),
        Logo: <LEDGERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.MOBILE_KEY:
      return {
        Icon: getColouredIcon(<MOBILEKEYLIGHT />, <MOBILEKEY />, light, width, height),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            Mobile Key
          </Text>
        ),
        type: SignerStorage.HOT,
      };
    case SignerType.PASSPORT:
      return {
        Icon: getColouredIcon(<PASSPORTICONLIGHT />, <PASSPORTICON />, light, width, height),
        Logo: <PASSPORTLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.POLICY_SERVER:
      return {
        Icon: getColouredIcon(<SERVERLIGHT />, <SERVER />, light, width, height),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            Signing Server +
          </Text>
        ),
        type: SignerStorage.HOT,
      };
    case SignerType.TAPSIGNER:
      return {
        Icon: getColouredIcon(<TAPSIGNERICONLIGHT />, <TAPSIGNERICON />, light, width, height),
        Logo: <TAPSIGNERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.TREZOR:
      return {
        Icon: getColouredIcon(<TREZORICONLIGHT />, <TREZORICON />, light, width, height),
        Logo: <TREZORLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.SEEDSIGNER:
      return {
        Icon: getColouredIcon(<SEEDSIGNERICONLIGHT />, <SEEDSIGNERICON />, light, width, height),
        Logo: <SEEDSIGNERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.SPECTER:
      return {
        Icon: getColouredIcon(<SPECTERICONLIGHT />, <SPECTERICON />, light, width, height),
        Logo: <SPECTERLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.BITBOX02:
      return {
        Icon: getColouredIcon(<BITBOXICONLIGHT />, <BITBOXICON />, light, width, height),
        Logo: <BITBOXLOGO />,
        type: SignerStorage.COLD,
      };
    case SignerType.PORTAL:
      return {
        Icon: getColouredIcon(<PortalIcon />, <PortalIcon />, light, width, height),
        Logo: <PortalLogo />,
        type: SignerStorage.COLD,
      };
    case SignerType.OTHER_SD:
      return {
        Icon: getColouredIcon(<OTHERSDICONLIGHT />, <OTHERSDICON />, light, width, height),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            Other signer
          </Text>
        ),
        type: SignerStorage.COLD,
      };
    case SignerType.UNKOWN_SIGNER:
      return {
        Icon: getColouredIcon(<OTHERSDICONLIGHT />, <OTHERSDICON />, light, width, height),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            Unknown Signer
          </Text>
        ),
        type: SignerStorage.COLD,
      };
    case SignerType.SEED_WORDS:
      return {
        Icon: getColouredIcon(<SEEDWORDSLIGHT />, <SEEDWORDS />, light, width, height),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            Seed Key
          </Text>
        ),
        type: SignerStorage.WARM,
      };
    case SignerType.INHERITANCEKEY:
      return {
        Icon: getColouredIcon(
          <INHERITANCEKEYLIGHT />,
          <INHERITANCEKEYDARK />,
          light,
          width,
          height
        ),
        Logo: (
          <Text style={styles.text} color={`${colorMode}.secondaryText`}>
            Inheritance Key +
          </Text>
        ),
        type: SignerStorage.WARM,
      };
    default:
      return {
        Icon: null,
        Logo: null,
        type: SignerStorage.COLD,
      };
  }
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    letterSpacing: 0.14,
  },
});
