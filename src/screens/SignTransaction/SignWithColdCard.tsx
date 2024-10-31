import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack, useColorMode } from 'native-base';
import { Linking, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { VaultSigner } from 'src/services/wallets/interfaces/vault';
import { hp, wp } from 'src/constants/responsive';
import Arrow from 'src/assets/images/rightarrow.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { receivePSBTFromColdCard, receiveTxHexFromColdCard } from 'src/hardware/coldcard';
import { useDispatch } from 'react-redux';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import useNfcModal from 'src/hooks/useNfcModal';
import { healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { RKInteractionMode } from 'src/services/wallets/enums';

function Card({ title, message, buttonText, buttonCallBack }) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.primaryBackground`}
      width="100%"
      borderRadius={10}
      justifyContent="center"
      marginTop={hp(20)}
    >
      <Box
        style={{
          paddingHorizontal: wp(20),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 10,
          height: hp(80),
        }}
        backgroundColor={`${colorMode}.secondaryBackground`}
      >
        <Box>
          <Text color={`${colorMode}.black`} fontSize={14} style={{ marginBottom: hp(5) }}>
            {title}
          </Text>
          <Text color={`${colorMode}.placeHolderTextColor`} fontSize={12}>
            {message}
          </Text>
        </Box>
        <Pressable
          backgroundColor={`${colorMode}.pantoneGreen`}
          justifyContent="center"
          borderRadius={5}
          width={wp(69)}
          height={hp(26)}
          alignItems="center"
          onPress={buttonCallBack}
        >
          <Text fontSize={11} color={`${colorMode}.buttonText`}>
            {buttonText}
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
}

function SignWithColdCard({ route }: { route }) {
  const navigation = useNavigation();
  const { nfcVisible, closeNfc, withNfcModal } = useNfcModal();
  const [mk4Helper, showMk4Helper] = useState(false);
  const { vaultKey, signTransaction, isMultisig, vaultId, isRemoteKey } = route.params as {
    vaultKey: VaultSigner;
    signTransaction;
    isMultisig: boolean;
    vaultId: string;
    isRemoteKey: boolean;
  };

  const { activeVault } = useVault({ vaultId });
  const { signer } = useSignerFromKey(vaultKey);

  const { registered = false } =
    vaultKey.registeredVaults.find((info) => info.vaultId === activeVault.id) || {};
  const dispatch = useDispatch();

  const receiveFromColdCard = async () =>
    withNfcModal(async () => {
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_SIGNING,
          },
        ])
      );
      if (!isMultisig) {
        const { txn } = await receiveTxHexFromColdCard();
        if (isRemoteKey) {
          navigation.replace('RemoteSharing', {
            isPSBTSharing: true,
            signer: signer,
            psbt: txn,
            mode: RKInteractionMode.SHARE_SIGNED_PSBT,
            vaultKey: vaultKey,
            vaultId: vaultId,
            isMultisig: isMultisig,
          });
          return;
        }
        dispatch(updatePSBTEnvelops({ xfp: vaultKey.xfp, txHex: txn }));
      } else {
        const { psbt } = await receivePSBTFromColdCard();
        if (isRemoteKey) {
          navigation.replace('RemoteSharing', {
            isPSBTSharing: true,
            signer: signer,
            psbt,
            mode: RKInteractionMode.SHARE_SIGNED_PSBT,
            vaultKey: vaultKey,
            vaultId: vaultId,
            isMultisig: isMultisig,
          });
          return;
        }
        dispatch(updatePSBTEnvelops({ signedSerializedPSBT: psbt, xfp: vaultKey.xfp }));
        dispatch(
          updateKeyDetails(vaultKey, 'registered', {
            registered: true,
            vaultId: activeVault.id,
          })
        );
      }
      dispatch(
        healthCheckStatusUpdate([
          {
            signerId: signer.masterFingerprint,
            status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
          },
        ])
      );
      navigation.goBack();
    });

  const registerCC = async () => {
    navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId }));
  };
  const { colorMode } = useColorMode();
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <VStack justifyContent="space-between" flex={1}>
        <KeeperHeader
          title="Sign Transaction via NFC"
          subtitle="First send the transaction to the Coldcard, sign it on Coldcard, then click receive to pass it back into Keeper"
        />
        <VStack flex={1} marginTop={hp(25)}>
          <Card
            title="Send transaction"
            message="from the app to the Coldcard"
            buttonText="Send"
            buttonCallBack={signTransaction}
          />
          <Card
            title="Receive signed transaction"
            message="from the Coldcard to the app"
            buttonText="Receive"
            buttonCallBack={receiveFromColdCard}
          />
        </VStack>
        <VStack>
          <Box padding={2}>
            <Box opacity={1}>
              <Text fontSize={14} color={`${colorMode}.primaryText`}>
                Note
              </Text>
            </Box>
            <HStack alignItems="center">
              <Text fontSize={13}>Coldcard is showing an error?</Text>
              <TouchableOpacity
                onPress={() => {
                  showMk4Helper(true);
                }}
              >
                <Text fontSize={14} bold>
                  {' Need Help?'}
                </Text>
              </TouchableOpacity>
            </HStack>
          </Box>
        </VStack>
      </VStack>
      <KeeperModal
        visible={mk4Helper}
        close={() => showMk4Helper(false)}
        title="Need help with Coldcard?"
        subTitle="Try to map the error on your Coldcard to one of the options here"
        Content={() => (
          <Box>
            <TouchableOpacity
              onPress={() => {
                showMk4Helper(false);
                registerCC();
              }}
              activeOpacity={0.8}
              style={{ alignItems: 'center', paddingVertical: 10, flexDirection: 'row' }}
            >
              <VStack width="97%">
                <Text fontSize={14}>Manually Register Coldcard</Text>
                <Text fontSize={12}>Please resigister the vault if not already registered</Text>
              </VStack>
              <Arrow />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                showMk4Helper(false);
                Linking.openURL('https://coldcard.com/docs/');
              }}
              activeOpacity={0.8}
              style={{ alignItems: 'center', paddingVertical: 10, flexDirection: 'row' }}
            >
              <VStack width="97%">
                <Text fontSize={14}>Learn more about Coldcard</Text>
                <Text fontSize={12}>
                  Here you will find all of our User Documentation for the Coldcard.
                </Text>
              </VStack>
              <Arrow />
            </TouchableOpacity>
          </Box>
        )}
      />
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
    </ScreenWrapper>
  );
}

export default SignWithColdCard;
