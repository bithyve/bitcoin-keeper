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
      <Box style={styles.icon}>{WalletMap(signer.type, true).Icon}</Box>
      <VStack marginX="4" maxW="80%">
        <Text style={styles.name} color="light.primaryText" numberOfLines={2}>
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
    height: 45,
    backgroundColor: '#FDF7F0',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    width: windowWidth * 0.7,
  },
  descriptionContainer: {
    width: windowWidth * 0.8,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: '#725436',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  name: {
    fontSize: 15,
    alignItems: 'center',
    fontWeight: '200',
    letterSpacing: 1.12,
  },
});
