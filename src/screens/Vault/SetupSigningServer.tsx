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
import { addSigningDevice } from 'src/store/sagaActions/vaults';
import { authenticator } from 'otplib';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useDispatch } from 'react-redux';
import useToastMessage from 'src/hooks/useToastMessage';
import { generateSignerFromMetaData } from 'src/hardware';
import SigningServer from 'src/core/services/operations/SigningServer';
import useVault from 'src/hooks/useVault';
import { setTempShellId } from 'src/store/reducers/vaults';
import { generateKey } from 'src/core/services/operations/encryption';
import { useAppSelector } from 'src/store/hooks';

function SetupSigningServer({ route }: { route }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const [validationModal, showValidationModal] = useState(false);
  const { useQuery } = useContext(RealmWrapperContext);
  const { activeVault } = useVault();
  const { tempShellId } = useAppSelector((state) => state.vault);
  const keeper: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const [setupData, setSetupData] = useState(null);
  const [validationKey, setValidationKey] = useState('');
  const [isSetupValidated, setIsSetupValidated] = useState(false);

  const getShellId = () => {
    if (activeVault) {
      return activeVault.shellId;
    } if (!tempShellId) {
      const vaultShellId = generateKey(12);
      dispatch(setTempShellId(vaultShellId));
      return vaultShellId;
    }
    return tempShellId;

  };

  const fetchSetupData = async () => {
    const { policy } = route.params;
    const vaultId = getShellId();
    const appId = keeper.id;
    try {
      const { setupData } = await SigningServer.register(vaultId, appId, policy);
      setSetupData(setupData);
      setValidationKey(setupData.verification.verifier);
    } catch (err) {
      showToast('Something went wrong. Please try again!');
    }
  };

  const validateSetup = async () => {
    const verificationToken = Number(otp);
    const vaultId = getShellId();
    const appId = keeper.id;
    try {
      const { valid } = await SigningServer.validate(vaultId, appId, verificationToken);
      if (valid) setIsSetupValidated(valid);
      else showToast('Invalid OTP. Please try again!');
    } catch (err) {
      showToast('Validation failed. Please try again!');
    }
  };

  const setupSigningServerKey = async () => {
    const { policy } = route.params;
    const { bhXpub: xpub, derivationPath, masterFingerprint } = setupData;
    const signingServerKey = generateSignerFromMetaData({
      xpub,
      derivationPath,
      xfp: masterFingerprint,
      signerType: SignerType.POLICY_SERVER,
      storageType: SignerStorage.WARM,
      isMultisig: true,
      signerPolicy: policy,
    });
    dispatch(addSigningDevice(signingServerKey));
    navigation.dispatch(CommonActions.navigate('AddSigningDevice'));
    showToast(`${signingServerKey.signerName} added successfully`, <TickIcon />);
  };

  useEffect(() => {
    fetchSetupData();
  }, []);

  useEffect(() => {
    if (setupData && isSetupValidated) setupSigningServerKey();
  }, [setupData, isSetupValidated]);

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
          <TouchableOpacity
            onPress={async () => {
              const clipBoardData = await Clipboard.getString();
              if (clipBoardData.match(/^\d{6}$/)) {
                setOtp(clipBoardData);
              } else {
                showToast('Invalid OTP');
              }
            }}
          >
            <CVVInputsView passCode={otp} passcodeFlag={false} backgroundColor textColor />
          </TouchableOpacity>
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
              <CustomGreenButton onPress={validateSetup} value="Confirm" />
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
        {validationKey === '' ? (
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
              value={authenticator.keyuri('bitcoin-keeper.io', 'Keeper', validationKey)}
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
                  {validationKey}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.4}
                  onPress={() => {
                    Clipboard.setString(validationKey);
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
