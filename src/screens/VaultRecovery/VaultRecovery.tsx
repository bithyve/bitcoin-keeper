import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack } from 'native-base';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import AddIcon from 'src/assets/images/green_add.svg';
import AddSignerIcon from 'src/assets/images/addSigner.svg';
import Buttons from 'src/components/Buttons';
import KeeperHeader from 'src/components/KeeperHeader';
import IconArrowBlack from 'src/assets/images/icon_arrow_black.svg';
import Note from 'src/components/Note/Note';
import ScreenWrapper from 'src/components/ScreenWrapper';
import SuccessSvg from 'src/assets/images/successSvg.svg';
import { hp, windowHeight, wp } from 'src/constants/responsive';
import {
  removeSigningDeviceBhr,
  setRelayVaultRecoveryShellId,
  setSigningDevices,
} from 'src/store/reducers/bhr';
import { useAppSelector } from 'src/store/hooks';
import { useDispatch } from 'react-redux';
import { setupKeeperApp } from 'src/store/sagaActions/storage';
import { NewVaultInfo } from 'src/store/sagas/wallets';
import { captureError } from 'src/services/sentry';
import { addNewVault } from 'src/store/sagaActions/vaults';
import { SignerStorage, SignerType, VaultType } from 'src/core/wallets/enums';
import Relay from 'src/services/operations/Relay';
import { generateCosignerMapXfps, generateVaultId } from 'src/core/wallets/factories/VaultFactory';
import config from 'src/core/config';
import { hash256 } from 'src/services/operations/encryption';
import TickIcon from 'src/assets/images/icon_tick.svg';
// import { updateSignerForScheme } from 'src/hooks/useSignerIntel';
import KeeperModal from 'src/components/KeeperModal';
import { setTempShellId } from 'src/store/reducers/vaults';
import useToastMessage from 'src/hooks/useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import InheritanceIcon from 'src/assets/images/inheritanceBrown.svg';
import TimeIcon from 'src/assets/images/time.svg';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';
import { generateSignerFromMetaData } from 'src/hardware';
import moment from 'moment';
import { setInheritanceRequestId, setRecoveryCreatedApp } from 'src/store/reducers/storage';
import useConfigRecovery from 'src/hooks/useConfigReocvery';
import ActivityIndicatorView from 'src/components/AppActivityIndicator/ActivityIndicatorView';
import { SDIcons } from '../Vault/SigningDeviceIcons';

export function formatDuration(ms) {
  const duration = moment.duration(ms);
  return Math.floor(duration.asHours()) + moment.utc(duration.asMilliseconds()).format(':mm:ss');
}

function AddSigningDevice(props) {
  return (
    <Pressable onPress={props.onPress}>
      <Box flexDir="row" alignItems="center" marginBottom="5" mx="3" marginTop={5}>
        <HStack style={styles.signerItem}>
          <HStack alignItems="center">
            <Box style={{ width: '10%', alignItems: 'center' }}>{props.icon}</Box>
            <VStack style={{ width: '75%', marginLeft: wp(10) }}>
              <Text
                color="light.primaryText"
                fontSize={15}
                numberOfLines={2}
                alignItems="center"
                letterSpacing={1.12}
              >
                {props.title}
              </Text>
              <Text color="light.GreyText" fontSize={13} letterSpacing={0.6}>
                {props.subTitle}
              </Text>
            </VStack>
          </HStack>
          <Box width="10%" alignItems="center">
            {props.arrowIcon}
          </Box>
        </HStack>
      </Box>
    </Pressable>
  );
}

function SignerItem({ signer, index }: { signer: any | undefined; index: number }) {
  const dispatch = useDispatch();
  const removeSigningDevice = () => {
    dispatch(removeSigningDeviceBhr(signer));
  };
  return (
    <Box flexDir="row" alignItems="center" marginX="3" marginBottom="12">
      <HStack style={styles.signerItem}>
        <HStack>
          <Box
            width="8"
            height="8"
            borderRadius={30}
            backgroundColor="#725436"
            justifyContent="center"
            alignItems="center"
            alignSelf="center"
          >
            {SDIcons(signer.type, true).Icon}
          </Box>
          <VStack marginX="4" maxWidth="80%">
            <Text
              color="light.primaryText"
              fontSize={15}
              numberOfLines={2}
              alignItems="center"
              letterSpacing={1.12}
            >
              {signer.type}
            </Text>
          </VStack>
        </HStack>
        <Pressable style={styles.remove} onPress={removeSigningDevice}>
          <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
            Remove
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}

function SuccessModalContent() {
  return (
    <View>
      <Box alignSelf="center">
        <SuccessSvg />
      </Box>
      <Text color="light.greenText" fontSize={13} padding={2}>
        The BIP-85 wallets in the app are new as they can’t be recovered using this method
      </Text>
    </View>
  );
}

function VaultRecovery({ navigation }) {
  const { showToast } = useToastMessage();
  const { initateRecovery, recoveryLoading: configRecoveryLoading } = useConfigRecovery();
  const dispatch = useDispatch();
  const {
    signingDevices,
    relayVaultError,
    relayVaultUpdate,
    relayVaultReoveryShellId,
    vaultRecoveryDetails,
  } = useAppSelector((state) => state.bhr);

  const [scheme, setScheme] = useState();
  const { appId } = useAppSelector((state) => state.storage);
  const [signersList, setsignersList] = useState<VaultSigner[]>(signingDevices);
  const [error, setError] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const { inheritanceRequestId } = useAppSelector((state) => state.storage);
  const [isIKS, setIsIKS] = useState(false);

  async function createNewApp() {
    try {
      const fcmToken = await messaging().getToken();
      dispatch(setRecoveryCreatedApp(true));
      dispatch(setupKeeperApp(fcmToken));
    } catch (error) {
      dispatch(setRecoveryCreatedApp(true));
      dispatch(setupKeeperApp());
    }
  }

  const checkInheritanceKeyRequest = async (signers: VaultSigner[], requestId: string) => {
    try {
      if (signers.length <= 1) throw new Error('Add two other devices first to recover');
      const cosignersMapIds = generateCosignerMapXfps(signers, SignerType.INHERITANCEKEY);
      const thresholdDescriptors = signers.map((signer) => signer.xfp);

      const { requestStatus, setupInfo } = await InheritanceKeyServer.requestInheritanceKey(
        requestId,
        cosignersMapIds[0],
        thresholdDescriptors
      );

      if (requestStatus.isDeclined) {
        showToast('Inheritance request has been declined', <ToastErrorIcon />);
        // dispatch(setInheritanceRequestId('')); // clear existing request
        return;
      }

      if (!requestStatus.isApproved) {
        showToast(
          `Request would approve in ${formatDuration(requestStatus.approvesIn)} if not rejected`,
          <TickIcon />
        );
      }

      if (requestStatus.isApproved && setupInfo) {
        const { signer: inheritanceKey } = generateSignerFromMetaData({
          xpub: setupInfo.inheritanceXpub,
          derivationPath: setupInfo.derivationPath,
          masterFingerprint: setupInfo.masterFingerprint,
          signerType: SignerType.INHERITANCEKEY,
          storageType: SignerStorage.WARM,
          isMultisig: true,
          inheritanceKeyInfo: {
            configuration: setupInfo.configuration,
            policy: setupInfo.policy,
          },
          xfp: setupInfo.id,
        });
        if (setupInfo.configuration.bsms) {
          initateRecovery(setupInfo.configuration.bsms);
        } else {
          showToast(`Cannot recreate Vault as BSMS was not present`, <ToastErrorIcon />);
        }
        dispatch(setSigningDevices(inheritanceKey));
        dispatch(setInheritanceRequestId('')); // clear approved request
        showToast(`${inheritanceKey.signerName} added successfully`, <TickIcon />);
      }
    } catch (err) {
      showToast(`${err}`, <ToastErrorIcon />);
    }
  };

  // useEffect(() => {
  //   setsignersList(
  //     signingDevices.map((signer) => updateSignerForScheme(signer, signingDevices?.length))
  //   );
  // }, [signingDevices]);

  useEffect(() => {
    if (signersList.length === 1) {
      getMetaData();
    }
    const hasIKS = signersList.some((signer) => signer.type === SignerType.INHERITANCEKEY);
    setIsIKS(hasIKS);
  }, [signersList]);

  useEffect(() => {
    if (scheme && !appId) {
      createNewApp();
    }
  }, [scheme]);

  useEffect(() => {
    if (scheme && appId) {
      try {
        const vaultInfo: NewVaultInfo = {
          vaultType: VaultType.DEFAULT,
          vaultScheme: scheme,
          vaultSigners: signersList,
          vaultDetails: {
            name: vaultRecoveryDetails.name,
            description: vaultRecoveryDetails.description,
          },
        };
        dispatch(addNewVault({ newVaultInfo: vaultInfo }));
      } catch (err) {
        captureError(err);
      }
    }
  }, [appId]);

  useEffect(() => {
    if (relayVaultUpdate) {
      setRecoveryLoading(false);
      setSuccessModalVisible(true);
    }
    if (relayVaultError) {
      showToast('Something went wrong!', <ToastErrorIcon />);
    }
  }, [relayVaultUpdate, relayVaultError]);

  // try catch API error
  const vaultCheck = async () => {
    const vaultId = generateVaultId(signersList, config.NETWORK_TYPE, vaultRecoveryDetails.scheme);
    const response = await Relay.vaultCheck(vaultId);
    if (response.isVault) {
      setScheme(response.scheme);
    } else {
      setRecoveryLoading(false);
      showToast('Vault does not exist with this signer combination', <ToastErrorIcon />);
    }
  };

  // try catch API error
  const getMetaData = async () => {
    try {
      setError(false);
      const xfpHash = hash256(signersList[0].masterFingerprint);
      const multisigSignerId = updateSignerForScheme(signersList[0], 2).signerId;
      const response = await Relay.getVaultMetaData(xfpHash, multisigSignerId);
      if (response?.vaultShellId) {
        dispatch(setRelayVaultRecoveryShellId(response.vaultShellId));
        dispatch(setTempShellId(response.vaultShellId));
      } else if (!response?.vaultShellId && response?.appId) {
        dispatch(setRelayVaultRecoveryShellId(response.appId));
        dispatch(setTempShellId(response.appId));
      } else if (response.error) {
        setError(true);
        showToast(
          'No vault is assocaited with this signer, try with another signer',
          <ToastErrorIcon />
        );
      }
    } catch (err) {
      console.log(err);
      setError(true);
      showToast('Something Went Wrong!', <ToastErrorIcon />);
    }
  };

  const startRecovery = () => {
    setRecoveryLoading(true);
    vaultCheck();
  };

  const renderSigner = ({ item, index }) => <SignerItem signer={item} index={index} />;
  return (
    <ScreenWrapper>
      <KeeperHeader title="Add signing devices" subtitle="To recover your Vault" />
      <Box style={styles.scrollViewWrapper}>
        {signersList.length > 0 ? (
          <Box>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={signersList}
              keyExtractor={(item, index) => item?.xfp ?? index}
              renderItem={renderSigner}
              style={{
                marginTop: hp(32),
                height: windowHeight > 680 ? '66%' : '51%',
              }}
            />
            {inheritanceRequestId && (
              <AddSigningDevice
                icon={<InheritanceIcon />}
                arrowIcon={<TimeIcon />}
                onPress={() => {
                  checkInheritanceKeyRequest(signingDevices, inheritanceRequestId);
                }}
                title="Inheritance Key Request Sent"
                subTitle="3 weeks remaning"
              />
            )}
            <AddSigningDevice
              icon={<AddIcon />}
              arrowIcon={<IconArrowBlack />}
              onPress={() => {
                if (error) {
                  showToast(
                    'Warning: No Vault is assocaited with this signer, please reomve and try with another signer'
                  );
                } else navigation.navigate('LoginStack', { screen: 'SigningDeviceListRecovery' });
              }}
              title="Add Another"
              subTitle="Select signing device"
            />
          </Box>
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center">
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('LoginStack', { screen: 'SigningDeviceListRecovery' })
              }
            >
              <Box alignItems="center">
                <AddSignerIcon />
              </Box>
            </TouchableOpacity>
            <Text style={{ textAlign: 'center', width: '70%', marginTop: 20 }}>
              You can use any one of the signing devices to start with
            </Text>
          </Box>
        )}
      </Box>
      <Box style={styles.bottomViewWrapper}>
        {signingDevices.length > 0 && (
          <Box width="100%">
            <Buttons
              primaryText={inheritanceRequestId || isIKS ? 'Restore via IKS' : 'Recover Vault'}
              primaryCallback={
                inheritanceRequestId || isIKS
                  ? () => checkInheritanceKeyRequest(signingDevices, inheritanceRequestId)
                  : startRecovery
              }
              secondaryText={isIKS && 'Recreate via BSMS'}
              secondaryCallback={() =>
                navigation.navigate('LoginStack', { screen: 'VaultConfigurationRecovery' })
              }
              primaryLoading={recoveryLoading}
            />
          </Box>
        )}
        <Note
          title="Note"
          subtitle="Signing Server cannot be used as the first signing device while recovering"
        />
      </Box>
      <KeeperModal
        visible={successModalVisible}
        title="Vault Recovered!"
        subTitle="Your Keeper Vault has successfully been recovered."
        buttonText="Ok"
        Content={SuccessModalContent}
        close={() => {}}
        showCloseIcon={false}
        buttonCallback={() => {
          setSuccessModalVisible(false);
          navigation.replace('App');
        }}
      />
      <ActivityIndicatorView visible={configRecoveryLoading} showLoader />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  signerItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  remove: {
    height: 26,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#FAC48B',
    justifyContent: 'center',
  },
  scrollViewWrapper: {
    flex: 0.7,
    justifyContent: 'space-between',
  },
  bottomViewWrapper: {
    position: 'absolute',
    bottom: 5,
    width: '100%',
    marginHorizontal: 20,
  },
});

export default VaultRecovery;
