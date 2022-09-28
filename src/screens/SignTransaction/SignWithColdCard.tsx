import { Box, Pressable, Text, VStack } from 'native-base';
import React, { useContext, useState } from 'react';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import { hp, wp } from 'src/common/data/responsiveness/responsive';

import HeaderTitle from 'src/components/HeaderTitle';
import NFC from 'src/core/services/nfc';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { NfcTech } from 'react-native-nfc-manager';
import Note from 'src/components/Note/Note';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { StyleSheet } from 'react-native';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { updatePSBTSignatures } from 'src/store/sagaActions/send_and_receive';
import { useDispatch } from 'react-redux';

const Card = ({ message, buttonText, buttonCallBack }) => {
  return (
    <Box
      backgroundColor={'light.lightYellow'}
      height={hp(100)}
      width={'100%'}
      borderRadius={10}
      justifyContent={'center'}
      marginY={6}
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
          noOfLines={2}
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
  return (
    <ScreenWrapper>
      <VStack justifyContent={'space-between'} flex={1}>
        <VStack>
          {resigter ? (
            <>
              <HeaderTitle title="Register Device" subtitle="Lorem ipsum dolor sit amet" />
              <Card
                message={'Register the vault with this MK4'}
                buttonText={'Scan'}
                buttonCallBack={register}
              />
            </>
          ) : null}
          <HeaderTitle
            title="Sign Transaction"
            subtitle="Lorem ipsum dolor sit amet"
            enableBack={false}
          />
          <Card
            message={'Send Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit,'}
            buttonText={'Send'}
            buttonCallBack={signTransaction}
          />
          <Card
            message={
              'Receive Assigned PSBT Lorem ipsum dolor sit amet, consectetur adipiscing elit,'
            }
            buttonText={'Receive'}
            buttonCallBack={receiveAndBroadCast}
          />
        </VStack>
        <VStack>
          <Note title="Note" subtitle="Lorem ipsum dolor sit amet, consectetur adipiscing elit" />
        </VStack>
      </VStack>
      <NfcPrompt visible={nfcVisible} />
    </ScreenWrapper>
  );
};

export default SignWithColdCard;

const styles = StyleSheet.create({});
