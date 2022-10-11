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
  const resigter = !hasSigned && !isMock;
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

  const register = async () => {
    setNfcVisible(true);
    let line = '';
    line += `Name: Keeper ${new Date().getTime()}\n`;
    line += `Policy: ${Vault.scheme.m} of ${Vault.scheme.n}\n`;
    line += `Format: P2SH-P2WSH\n`;
    line += `\n`;
    Vault.signers.forEach((signer) => {
      line += `Derivation: ${signer.xpubInfo.derivationPath}\n`;
      line += `${signer.xpubInfo.xfp}: ${signer.xpub}\n\n`;
    });
    const enc = NFC.encodeForColdCard(line);
    console.log(line);
    await NFC.send(NfcTech.Ndef, enc);
    setNfcVisible(false);
  };
  const { colorMode } = useColorMode();
  return (
    <ScreenWrapper>
      <VStack justifyContent={'space-between'} flex={1}>
        <VStack>
          {resigter ? (
            <>
              <HeaderTitle
                title="Register Device"
                subtitle="The Vault needs to be registered only once"
              />
              <Card
                message={
                  'You will register the new Vault with Coldcard so that it allows you to sign every time'
                }
                buttonText={'Scan'}
                buttonCallBack={register}
              />
            </>
          ) : null}
          <HeaderTitle title="Sign Transaction" subtitle="Two step process" enableBack={false} />
          <Card
            message={'Send PSBT from the app to ColdCard'}
            buttonText={'Send'}
            buttonCallBack={signTransaction}
          />
          <Card
            message={'Receive signed PSBT from ColdCard'}
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
                {'ColdCard is showing an error?'}
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
        title="Need help with ColdCard?"
        subTitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        Content={() => {
          return (
            <Box>
              <TouchableOpacity
                onPress={() => {
                  showMk4Helper(false);
                  register();
                }}
                activeOpacity={0.8}
                style={{ alignItems: 'center', paddingVertical: 10, flexDirection: 'row' }}
              >
                <VStack width={'97%'}>
                  <Text fontSize={14} fontFamily={'body'}>
                    {'Manually Register Cold Card'}
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
