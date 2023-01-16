import { ActivityIndicator, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { Box, View } from 'native-base';
import DeleteIcon from 'src/assets/images/deleteBlack.svg';

import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { SignerStorage, SignerType } from 'src/core/wallets/enums';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';

import Buttons from 'src/components/Buttons';
import CVVInputsView from 'src/components/HealthCheck/CVVInputsView';
import CopyIcon from 'src/assets/images/icon_copy.svg';
import CustomGreenButton from 'src/components/CustomButton/CustomGreenButton';
import HeaderTitle from 'src/components/HeaderTitle';
import { KeeperApp } from 'src/common/data/models/interfaces/KeeperApp';
import KeeperModal from 'src/components/KeeperModal';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Note from 'src/components/Note/Note';
import QRCode from 'react-native-qrcode-svg';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import { ScaledSheet } from 'react-native-size-matters';
import StatusBarComponent from 'src/components/StatusBarComponent';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import WalletUtilities from 'src/core/wallets/operations/utils';
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { authenticator } from 'otplib';
import config from 'src/core/config';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import idx from 'idx';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import { validateSigningServerRegistration } from 'src/store/sagaActions/wallets';

function SetupSigningServer({ route }: { route }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [validationModal, showValidationModal] = useState(false);
  const [twoFAKey, setTwoFAKey] = useState('');
  const { useQuery } = useContext(RealmWrapperContext);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const key = idx(keeper, (_) => _.twoFADetails.twoFAKey);
  const isTwoFAAlreadyVerified = idx(keeper, (_) => _.twoFADetails.twoFAValidated);
  const signingServerVerified = useAppSelector((state) => state.wallet.signingServer.verified);
  const { signingServerXpub, derivationPath, masterFingerprint } =
    idx(keeper, (_) => _.twoFADetails) || {};

  const [settingSigningServerKey, setSettingSigningServerKey] = useState(false);

  useEffect(() => {
    if (key) setTwoFAKey(key);
  }, [key]);

  useEffect(() => {
    if ((signingServerVerified || isTwoFAAlreadyVerified) && !settingSigningServerKey) {
      setSettingSigningServerKey(true);
      setupSigningServerKey();
    }
  }, [signingServerVerified, isTwoFAAlreadyVerified, settingSigningServerKey]);

  const setupSigningServerKey = async () => {
    const networkType = config.NETWORK_TYPE;
    const network = WalletUtilities.getNetworkByType(networkType);

    const { policy } = route.params;
    const signingServerKey: VaultSigner = {
      signerId: WalletUtilities.getFingerprintFromExtendedKey(signingServerXpub, network),
      type: SignerType.POLICY_SERVER,
      signerName: 'Signing Server',
      xpub: signingServerXpub,
      xpubInfo: {
        derivationPath,
        xfp: masterFingerprint,
      },
      lastHealthCheck: new Date(),
      addedOn: new Date(),
      storageType: SignerStorage.WARM,
      signerPolicy: policy,
    };
    dispatch(addSigningDevice(signingServerKey));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    showToast(`${signingServerKey.signerName} added successfully`, <TickIcon />);
  };

  const [otp, setOtp] = useState('');

  const otpContent = useCallback(() => {
    const onPressNumber = (text) => {
      let tmpPasscode = otp;
      if (otp.length < 6) {
        if (text !== 'x') {
          tmpPasscode += text;
          setOtp(tmpPasscode);
        }
      }
      if (otp && text === 'x') {
        setOtp(otp.slice(0, -1));
      }
    };

    const onDeletePressed = () => {
      setOtp(otp.slice(0, otp.length - 1));
    };

    return (
      <Box width={hp(300)}>
        <Box>
          <CVVInputsView passCode={otp} passcodeFlag={false} backgroundColor textColor />
          <Text
            fontSize={13}
            letterSpacing={0.65}
            width={wp(290)}
            color="light.greenText"
            marginTop={2}
          >
            If you lose your authenticator app, use the other Signing Devices to reset the Signing
            Server
          </Text>
          <Box mt={10} alignSelf="flex-end" mr={2}>
            <Box>
              <CustomGreenButton
                onPress={() => {
                  dispatch(validateSigningServerRegistration(Number(otp)));
                }}
                value="Confirm"
              />
            </Box>
          </Box>
        </Box>
        <KeyPadView
          onPressNumber={onPressNumber}
          onDeletePressed={onDeletePressed}
          keyColor="light.primaryText"
          ClearIcon={<DeleteIcon />}
        />
      </Box>
    );
  }, [otp]);

  return (
    <View style={styles.Container} background="light.secondaryBackground">
      <StatusBarComponent padding={50} />
      <Box>
        <HeaderTitle
          title="Set up 2FA for Signing Server"
          subtitle="Scan on any 2FA auth app"
          onPressHandler={() => navigation.goBack()}
          headerTitleColor="light.headerText"
          paddingTop={hp(5)}
        />
      </Box>
      <Box marginTop={hp(50)} alignItems="center" alignSelf="center" width={wp(250)}>
        {twoFAKey === '' ? (
          <Box height={hp(250)} justifyContent="center">
            <ActivityIndicator animating size="small" />
          </Box>
        ) : (
          <Box
            alignItems="center"
            alignSelf="center"
            width={hp(200)}
            style={{
              marginTop: hp(30),
            }}
          >
            <QRCode
              value={authenticator.keyuri('bitcoin-keeper.io', 'Keeper', twoFAKey)}
              logoBackgroundColor="transparent"
              size={hp(200)}
            />
            <Box background="light.QrCode" height={6} width="100%" justifyContent="center">
              <Text
                textAlign="center"
                color="light.recieverAddress"
                bold
                fontSize={12}
                letterSpacing={1.08}
                width="100%"
                numberOfLines={1}
              >
                2FA Signing Server
              </Text>
            </Box>
            <Box alignItems="center" marginTop={hp(30)} width={wp(320)}>
              <Box
                flexDirection="row"
                width="90%"
                alignItems="center"
                justifyContent="space-between"
                backgroundColor="light.textInputBackground"
                borderBottomLeftRadius={10}
                borderTopLeftRadius={10}
              >
                <Text width="80%" marginLeft={4} numberOfLines={1}>
                  {twoFAKey}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.4}
                  onPress={() => {
                    Clipboard.setString(twoFAKey);
                    showToast('Address Copied Successfully', <TickIcon />);
                  }}
                >
                  <Box
                    backgroundColor="light.copyBackground"
                    padding={3}
                    borderTopRightRadius={10}
                    borderBottomRightRadius={10}
                  >
                    <CopyIcon />
                  </Box>
                </TouchableOpacity>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* {Bottom note} */}
      <Box position="absolute" bottom={hp(45)} marginX={5} width="100%">
        <Box marginBottom={hp(30)}>
          <Note
            title="Note"
            subtitle="It is a good idea to have the authenticator app on another device"
            subtitleColor="GreyText"
          />
        </Box>
        <Buttons
          primaryCallback={() => {
            showValidationModal(true);
          }}
          primaryText="Next"
          secondaryText="Cancel"
          secondaryCallback={() => {
            navigation.goBack();
          }}
        />
      </Box>
      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
        }}
        title="Confirm OTP to setup 2FA"
        subTitle="To complete setting up the signing server"
        textColor="light.primaryText"
        Content={otpContent}
      />
    </View>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
  title: {
    fontSize: 12,
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: '0.20@s',
  },
  textBox: {
    width: '80%',
    // backgroundColor: Colors?.textInputBackground,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    padding: 20,
  },
});
export default SetupSigningServer;
