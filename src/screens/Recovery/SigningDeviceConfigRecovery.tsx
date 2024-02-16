import { Box, ScrollView, View } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { hp, windowHeight, windowWidth, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import ColdCardSetupImage from 'src/assets/images/ColdCardSetup.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { StyleSheet, TouchableOpacity } from 'react-native';
import config, { APP_STAGE } from 'src/core/config';
import KeystoneSetupImage from 'src/assets/images/keystone_illustration.svg';
import NFC from 'src/services/nfc';
import { useAppSelector } from 'src/store/hooks';

import { SDIcons } from '../Vault/SigningDeviceIcons';
import { InteracationMode } from '../Vault/HardwareModalMap';

export const getDeviceStatus = (type: SignerType, isNfcSupported, signingDevices) => {
  switch (type) {
    case SignerType.COLDCARD:
    case SignerType.TAPSIGNER:
      return {
        message: !isNfcSupported ? 'NFC is not supported in your device' : '',
        disabled: config.ENVIRONMENT !== APP_STAGE.DEVELOPMENT && !isNfcSupported,
      };
    case SignerType.POLICY_SERVER:
      if (signingDevices.length < 2) {
        return {
          message: 'Add two other devices first to recover',
          disabled: true,
        };
      }
      return {
        message: '',
        disabled: false,
      };
    case SignerType.SEED_WORDS:
    case SignerType.MOBILE_KEY:
    case SignerType.KEEPER:
    case SignerType.JADE:
    case SignerType.PASSPORT:
    case SignerType.SEEDSIGNER:
    case SignerType.KEYSTONE:
    case SignerType.LEDGER:
    default:
      return {
        message: '',
        disabled: false,
      };
  }
};

function ColdCardSetupContent() {
  return (
    <View justifyContent="flex-start" width={wp(300)}>
      <Box ml={wp(21)}>
        <ColdCardSetupImage />
      </Box>
      <Box marginTop="4" alignItems="flex-start">
        <Text color="light.greenText" fontSize={13} letterSpacing={0.65}>
          {
            'Export the vault config by going to Setting > Multisig > Then select the wallet > Export '
          }
        </Text>
      </Box>
    </View>
  );
}

function PassportSetupContent() {
  return (
    <View>
      <Box ml={wp(21)}>
        <KeystoneSetupImage />
      </Box>
      <Box marginTop="4">
        <Text
          color="light.greenText"
          fontSize={13}
          letterSpacing={0.65}
          style={{
            marginLeft: wp(10),
          }}
        >
          {
            '\u2022 Export the xPub from the Account section > Manage Account > Connect Wallet > Keeper > Multisig > QR Code.\n'
          }
        </Text>
      </Box>
    </View>
  );
}

function SigningDeviceConfigRecovery({ navigation }) {
  type HWProps = {
    disabled: boolean;
    message: string;
    type: SignerType;
    first?: boolean;
    last?: boolean;
  };
  const { signingDevices } = useAppSelector((state) => state.bhr);
  const [isNfcSupported, setNfcSupport] = useState(true);

  const getNfcSupport = async () => {
    const isSupported = await NFC.isNFCSupported();
    setNfcSupport(isSupported);
  };

  useEffect(() => {
    getNfcSupport();
  }, []);

  const { navigate } = useNavigation();

  function HardWareWallet({ disabled, message, type, first = false, last = false }: HWProps) {
    const [visible, setVisible] = useState(false);
    const onPress = () => {
      open();
    };

    const open = () => setVisible(true);
    const close = () => setVisible(false);

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          disabled={disabled}
          style={{
            opacity: disabled ? 0.4 : 1,
          }}
        >
          <Box
            backgroundColor="light.primaryBackground"
            borderTopRadius={first ? 15 : 0}
            borderBottomRadius={last ? 15 : 0}
          >
            <Box style={styles.walletMapContainer}>
              <Box style={styles.walletMapWrapper}>{SDIcons(type).Icon}</Box>
              <Box backgroundColor="light.divider" style={styles.divider} />
              <Box style={styles.walletMapLogoWrapper}>
                {SDIcons(type).Logo}
                <Text color="light.inActiveMsg" style={styles.messageText}>
                  {message}
                </Text>
              </Box>
            </Box>
            <Box backgroundColor="light.divider" style={styles.dividerStyle} />
          </Box>
        </TouchableOpacity>

        <KeeperModal
          visible={visible && type === SignerType.COLDCARD}
          close={close}
          title="Recover using Coldcard"
          subTitle="Keep your Coldcard ready"
          buttonText="Proceed"
          buttonTextColor="light.white"
          buttonCallback={() => {
            navigation.dispatch(
              CommonActions.navigate({
                name: 'AddColdCard',
                params: { mode: InteracationMode.CONFIG_RECOVERY },
              })
            );
            close();
          }}
          textColor="light.primaryText"
          Content={ColdCardSetupContent}
        />

        <KeeperModal
          visible={visible && type === SignerType.PASSPORT}
          close={close}
          title="Recover using Passport (Batch 2)"
          subTitle="Keep your Foundation Passport (Batch 2) ready before proceeding"
          subTitleColor="light.secondaryText"
          buttonText="Continue"
          buttonTextColor="light.white"
          buttonCallback={() => {
            navigate('LoginStack', {
              screen: 'ScanQRFileRecovery',
              params: { allowFileUploads: false },
            });
            close();
          }}
          textColor="light.primaryText"
          Content={PassportSetupContent}
        />
      </>
    );
  }

  return (
    <ScreenWrapper>
      <KeeperHeader
        title="Select signer"
        subtitle="To recover your vault"
        onPressHandler={() => navigation.goBack()}
      />
      <ScrollView style={{ height: hp(520) }} showsVerticalScrollIndicator={false}>
        <Box paddingY="4">
          {[SignerType.COLDCARD].map((type: SignerType, index: number) => {
            const { disabled, message } = getDeviceStatus(type, isNfcSupported, signingDevices);
            return (
              <HardWareWallet
                type={type}
                first={index === 0}
                last={index === 3}
                disabled={disabled}
                message={message}
              />
            );
          })}
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  modalText: {
    letterSpacing: 0.65,
    fontSize: 13,
    marginTop: 5,
    padding: 1,
  },
  scrollViewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollViewWrapper: {
    height: windowHeight > 800 ? '90%' : '85%',
  },
  contactUsText: {
    fontSize: 12,
    letterSpacing: 0.6,
    width: wp(300),
    lineHeight: 20,
    marginTop: hp(20),
  },
  walletMapContainer: {
    alignItems: 'center',
    height: windowHeight * 0.08,
    flexDirection: 'row',
    paddingLeft: wp(40),
  },
  walletMapWrapper: {
    marginRight: wp(20),
    width: wp(15),
  },
  walletMapLogoWrapper: {
    marginLeft: wp(23),
    justifyContent: 'flex-end',
    marginTop: hp(20),
  },
  messageText: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1.3,
    marginTop: hp(5),
  },
  dividerStyle: {
    opacity: 0.1,
    width: windowWidth * 0.8,
    height: 0.5,
  },
  divider: {
    opacity: 0.5,
    height: hp(26),
    width: 1.5,
  },
  italics: {
    fontStyle: 'italic',
  },
});

export default SigningDeviceConfigRecovery;
