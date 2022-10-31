import { Box, HStack, Pressable, Text, VStack, useColorMode } from 'native-base';
import { Linking, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import Arrow from 'src/assets/images/rightarrow.svg';
import HeaderTitle from 'src/components/HeaderTitle';
import KeeperModal from 'src/components/KeeperModal';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { registerToColcard } from 'src/hardware/coldcard';
import { updatePSBTSignatures } from 'src/store/sagaActions/send_and_receive';
import { useDispatch } from 'react-redux';

const Card = ({ message, buttonText, buttonCallBack }) => {
  return (
    <Box
      backgroundColor={'light.lightYellow'}
      width={'100%'}
      borderRadius={10}
      justifyContent={'center'}
      marginY={6}
      py={'5'}
    >
      <Box
        style={{
          paddingHorizontal: wp(20),
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text
          color={'light.modalText'}
          fontSize={13}
          letterSpacing={0.65}
          fontWeight={200}
          width={'70%'}
        >
          {message}
        </Text>
        <Pressable
          bg={'light.yellow1'}
          justifyContent={'center'}
          borderRadius={5}
          width={wp(60)}
          height={hp(25)}
          alignItems={'center'}
          onPress={buttonCallBack}
        >
          <Text fontSize={12} letterSpacing={0.65} fontWeight={200}>
            {buttonText}
          </Text>
        </Pressable>
      </Box>
    </Box>
  );
};

const SignWithColdCard = ({ route }) => {
  const [nfcVisible, setNfcVisible] = useState(false);
  const [mk4Helper, showMk4Helper] = useState(false);
  const { useQuery } = useContext(RealmWrapperContext);
  const Vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];
  const { signer, signTransaction }: { signer: VaultSigner; signTransaction } = route.params;
  const { hasSigned, isMock } = signer;
  const register = !hasSigned && !isMock;
  const dispatch = useDispatch();
  const receiveAndBroadCast = async () => {
    setNfcVisible(true);
    const signedPSBT = await NFC.read(NfcTech.NfcV);
    setNfcVisible(false);
    const payload = {
      name: '',
      signature: '',
      psbt: '',
    };
    signedPSBT.forEach((record) => {
      if (record.data === 'Partly signed PSBT') {
        payload.name = record.data;
      }
      // signature is of length 64 but 44 when base64 encoded
      else if (record.data.length === 44) {
        payload.signature = record.data;
      } else {
        payload.psbt = record.data;
      }
    });
    dispatch(
      updatePSBTSignatures({ signedSerializedPSBT: payload.psbt, signerId: signer.signerId })
    );
  };
  const registerCC = async () => {
    setNfcVisible(true);
    await registerToColcard({ vault: Vault });
    setNfcVisible(false);
  };
  const { colorMode } = useColorMode();
  return (
    <ScreenWrapper>
      <VStack justifyContent={'space-between'} flex={1}>
        <VStack>
          {register ? (
            <>
              <HeaderTitle
                title="Register Device"
                subtitle="The vault needs to be registered only once"
              />
              <Card
                message={
                  'You will register the new vault with Coldcard so that it allows you to sign every time'
                }
                buttonText={'Scan'}
                buttonCallBack={registerCC}
              />
            </>
          ) : null}
          <HeaderTitle title="Sign Transaction" subtitle="Two step process" enableBack={false} />
          <Card
            message={'Send PSBT from the app to Coldcard'}
            buttonText={'Send'}
            buttonCallBack={signTransaction}
          />
          <Card
            message={'Receive signed PSBT from Coldcard'}
            buttonText={'Receive'}
            buttonCallBack={receiveAndBroadCast}
          />
        </VStack>
        <VStack>
          <Box bg={`${colorMode}.offWhite`} p={2}>
            <Box opacity={1}>
              <Text fontSize={14} fontFamily={'body'} color={`light.lightBlack`} fontWeight={200}>
                {'Note'}
              </Text>
            </Box>
            <HStack alignItems={'center'}>
              <Text fontSize={13} fontFamily={'body'}>
                {'Coldcard is showing an error?'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  showMk4Helper(true);
                }}
              >
                <Text fontSize={14} fontFamily={'body'} fontWeight={'300'}>
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
        Content={() => {
          return (
            <Box>
              <TouchableOpacity
                onPress={() => {
                  showMk4Helper(false);
                  registerCC();
                }}
                activeOpacity={0.8}
                style={{ alignItems: 'center', paddingVertical: 10, flexDirection: 'row' }}
              >
                <VStack width={'97%'}>
                  <Text fontSize={14} fontFamily={'body'}>
                    {'Manually Register Mk4'}
                  </Text>
                  <Text fontSize={12} fontFamily={'body'}>
                    {'Please resigister the Vault if not already registered'}
                  </Text>
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
                <VStack width={'97%'}>
                  <Text fontSize={14} fontFamily={'body'}>
                    {'Learn more about Mk4'}
                  </Text>
                  <Text fontSize={12} fontFamily={'body'}>
                    {'Here you will find all of our User Documentation for the COLDCARD.'}
                  </Text>
                </VStack>
                <Arrow />
              </TouchableOpacity>
            </Box>
          );
        }}
      />
      <NfcPrompt visible={nfcVisible} />
    </ScreenWrapper>
  );
};

export default SignWithColdCard;
