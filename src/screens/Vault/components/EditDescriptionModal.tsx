import KeeperModal from 'src/components/KeeperModal';
import { TextInput } from 'react-native';
import { Box, HStack, Text, VStack } from 'native-base';
import React, { useEffect, useRef } from 'react';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';

import moment from 'moment';

import { ScaledSheet } from 'react-native-size-matters';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import { WalletMap } from '../WalletMap';

function SignerData({ signer }: { signer: VaultSigner }) {
  return (
    <HStack>
      <Box
        width="8"
        height="8"
        borderRadius={30}
        bg="#725436"
        justifyContent="center"
        alignItems="center"
        alignSelf="center"
      >
        {WalletMap(signer.type, true).Icon}
      </Box>
      <VStack marginX="4" maxW="80%">
        <Text
          color="light.lightBlack"
          fontSize={15}
          numberOfLines={2}
          alignItems="center"
          fontWeight={200}
          letterSpacing={1.12}
        >
          {signer.signerName}
        </Text>
        <Text color="light.GreyText" fontSize={12} fontWeight={200} letterSpacing={0.6}>
          {`Added ${moment(signer.lastHealthCheck).calendar().toLowerCase()}`}
        </Text>
      </VStack>
    </HStack>
  );
}

function Content({ signer, descRef }: { signer: VaultSigner; descRef }) {
  const updateDescription = (text) => {
    descRef.current = text;
  };
  const inputRef = useRef<TextInput>();
  useEffect(() => {
    setTimeout(() => {
      inputRef.current.focus();
    }, 100);
  }, []);
  return (
    <VStack style={styles.descriptionContainer}>
      <SignerData signer={signer} />
      <TextInput
        ref={inputRef}
        autoCapitalize="sentences"
        onChangeText={updateDescription}
        style={styles.descriptionEdit}
        defaultValue={signer.signerDescription}
      />
    </VStack>
  );
}

function DescriptionModal({
  visible,
  close,
  signer,
  callback,
}: {
  visible: boolean;
  close: () => void;
  signer: VaultSigner;
  callback: any;
}) {
  const descRef = useRef();
  const MemoisedContent = React.useCallback(
    () => <Content signer={signer} descRef={descRef} />,
    [signer]
  );
  const onSave = () => {
    close();
    callback(descRef.current);
  };
  return (
    <KeeperModal
      visible={visible}
      close={close}
      title="Add Description"
      subTitle="Optionally you can add a short description to the signing device"
      buttonText="Save"
      justifyContent="center"
      Content={MemoisedContent}
      buttonCallback={onSave}
    />
  );
}

export default DescriptionModal;

const styles = ScaledSheet.create({
  descriptionEdit: {
    height: 50,
    backgroundColor: '#FDF7F0',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  descriptionContainer: {
    width: windowWidth * 0.8,
  },
});
