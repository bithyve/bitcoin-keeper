import Text from 'src/components/KeeperText';
import { Box, HStack, Pressable, VStack, useColorMode } from 'native-base';
import { Linking, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import Arrow from 'src/assets/images/rightarrow.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import {
  receivePSBTFromColdCard,
  receiveTxHexFromColdCard,
  registerToColcard,
} from 'src/hardware/coldcard';
import { useDispatch } from 'react-redux';
import { updatePSBTEnvelops } from 'src/store/reducers/send_and_receive';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import useNfcModal from 'src/hooks/useNfcModal';
import { healthCheckSigner } from 'src/store/sagaActions/bhr';

function Card({ message, buttonText, buttonCallBack }) {
  return (
    <Box
      backgroundColor="light.primaryBackground"
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
        <Text color="light.greenText" fontSize={13} letterSpacing={0.65} width="70%">
          {message}
        </Text>
        <Pressable
          backgroundColor="light.accent"
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
  const { nfcVisible, closeNfc, withNfcModal } = useNfcModal();
  const [mk4Helper, showMk4Helper] = useState(false);
  const { useQuery } = useContext(RealmWrapperContext);
  const Vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const { signer, signTransaction, isMultisig } = route.params as {
    signer: VaultSigner;
    signTransaction;
    isMultisig: boolean;
  };
  const { registered } = signer;

  const dispatch = useDispatch();

  const receiveFromColdCard = async () =>
    withNfcModal(async () => {
      if (!isMultisig) {
        const { txn } = await receiveTxHexFromColdCard();
        dispatch(updatePSBTEnvelops({ signerId: signer.signerId, txHex: txn }));
        dispatch(healthCheckSigner([signer]));
      } else {
        const { psbt } = await receivePSBTFromColdCard();
        dispatch(updatePSBTEnvelops({ signedSerializedPSBT: psbt, signerId: signer.signerId }));
        dispatch(updateSignerDetails(signer, 'registered', true));
        dispatch(healthCheckSigner([signer]));
      }
    });

  const registerCC = async () =>
    withNfcModal(async () => {
      await registerToColcard({ vault: Vault });
      dispatch(updateSignerDetails(signer, 'registered', true));
    });
  const { colorMode } = useColorMode();
  return (
    <ScreenWrapper>
      <VStack justifyContent="space-between" flex={1}>
        <VStack>
          {!registered && isMultisig ? (
            <>
              <HeaderTitle
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
          <HeaderTitle title="Sign Transaction" subtitle="Two step process" enableBack={false} />
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
          <Box backgroundColor={`${colorMode}.offWhite`} padding={2}>
            <Box opacity={1}>
              <Text fontSize={14} color="light.primaryText">
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
                <Text fontSize={14}>Manually Register Mk4</Text>
                <Text fontSize={12}>Please resigister the Vault if not already registered</Text>
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
                <Text fontSize={14}>Learn more about Mk4</Text>
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
