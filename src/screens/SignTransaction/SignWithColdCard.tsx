import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack, useColorMode } from 'native-base';
import { Linking, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Signer, Vault, VaultSigner } from 'src/services/wallets/interfaces/vault';
import { hp, wp } from 'src/constants/responsive';
import Arrow from 'src/assets/images/rightarrow.svg';
import KeeperHeader from 'src/components/KeeperHeader';
import KeeperModal from 'src/components/KeeperModal';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import ScreenWrapper from 'src/components/ScreenWrapper';
import {
  receivePSBTFromColdCard,
  receiveTxHexFromColdCard,
  registerToColcard,
} from 'src/hardware/coldcard';
import { useDispatch } from 'react-redux';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { updateKeyDetails } from 'src/store/sagaActions/wallets';
import useNfcModal from 'src/hooks/useNfcModal';
import { healthCheckSigner, healthCheckStatusUpdate } from 'src/store/sagaActions/bhr';
import useVault from 'src/hooks/useVault';
import useSignerFromKey from 'src/hooks/useSignerFromKey';
import { hcStatusType } from 'src/models/interfaces/HeathCheckTypes';
import { useNavigation } from '@react-navigation/native';
import { RKInteractionMode } from 'src/services/wallets/enums';

function Card({ message, buttonText, buttonCallBack }) {
  const { colorMode } = useColorMode();
  return (
    <Box
      backgroundColor={`${colorMode}.primaryBackground`}
      width="100%"
      borderRadius={10}
      justifyContent="center"
      marginY={6}
      py="5"
    >
      <Box
        style={{
          paddingHorizontal: wp(20),
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text color={`${colorMode}.greenText`} fontSize={13} letterSpacing={0.65} width="70%">
          {message}
        </Text>
        <Pressable
          backgroundColor={`${colorMode}.accent`}
          justifyContent="center"
          borderRadius={5}
          width={wp(60)}
          height={hp(25)}
          alignItems="center"
          onPress={buttonCallBack}
        >
          <Text fontSize={12} letterSpacing={0.65}>
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
  const {
    vaultKey,
    signTransaction,
    isMultisig,
    vaultId,
    isRemoteKey,
    signer: signerRK,
    activeVault: activeVaultRK,
  } = route.params as {
    vaultKey: VaultSigner;
    signTransaction;
    isMultisig: boolean;
    vaultId: string;
    isRemoteKey: boolean;
    signer?: Signer;
    activeVault?: Vault;
  };

  const { activeVault } = isRemoteKey ? { activeVault: activeVaultRK } : useVault({ vaultId });
  const { signer } = isRemoteKey ? { signer: signerRK } : useSignerFromKey(vaultKey);
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
        dispatch(
          healthCheckStatusUpdate([
            {
              signerId: signer.masterFingerprint,
              status: hcStatusType.HEALTH_CHECK_SUCCESSFULL,
            },
          ])
        );
        navigation.goBack();
      }
    });

  const registerCC = async () =>
    withNfcModal(async () => {
      await registerToColcard({ vault: activeVault });
      dispatch(
        updateKeyDetails(vaultKey, 'registered', {
          registered: true,
          vaultId: activeVault.id,
        })
      );
    });
  const { colorMode } = useColorMode();
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <VStack justifyContent="space-between" flex={1}>
        <VStack>
          {!registered && isMultisig ? (
            <>
              <KeeperHeader
                title="Register Device"
                subtitle="The vault needs to be registered only once"
              />
              <Card
                message="You will register the new vault with Coldcard so that it allows you to sign every time"
                buttonText="Scan"
                buttonCallBack={registerCC}
              />
            </>
          ) : null}
          <KeeperHeader title="Sign Transaction" subtitle="Two step process" enableBack={false} />
          <Card
            message="Send PSBT from the app to Coldcard"
            buttonText="Send"
            buttonCallBack={signTransaction}
          />
          <Card
            message="Receive signed PSBT from Coldcard"
            buttonText="Receive"
            buttonCallBack={receiveFromColdCard}
          />
        </VStack>
        <VStack>
          <Box backgroundColor={`${colorMode}.whiteText`} padding={2}>
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
                  Here you will find all of our User Documentation for the COLDCARD.
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
