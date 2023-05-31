import KeeperModal from 'src/components/KeeperModal';
import { TextInput } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, HStack, VStack } from 'native-base';
import React, { useCallback, useRef, useState } from 'react';
import { VaultSigner } from 'src/core/wallets/interfaces/vault';

import moment from 'moment';

import { ScaledSheet } from 'react-native-size-matters';
import { windowWidth } from 'src/common/data/responsiveness/responsive';
import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import { SDIcons } from '../SigningDeviceIcons';

function SignerData({ signer }: { signer: VaultSigner }) {
  return (
    <HStack>
      <Box style={styles.icon}>{SDIcons(signer.type, true).Icon}</Box>
      <VStack marginX="4" maxWidth="80%">
        <Text style={styles.name} color="light.primaryText" numberOfLines={2}>
          {signer.signerName}
        </Text>
        <Text color="light.GreyText" fontSize={12} letterSpacing={0.6}>
          {`Added ${moment(signer.lastHealthCheck).calendar().toLowerCase()}`}
        </Text>
      </VStack>
    </HStack>
  );
}

function Content({ signer, descRef }: { signer: VaultSigner; descRef }) {
  const updateDescription = useCallback((text) => {
    descRef.current = text;
    setMaxLength(text.length);
  }, []);

  const [maxLength, setMaxLength] = useState(
    signer && signer.signerDescription ? signer.signerDescription.length : 0
  );

  return (
    <VStack style={styles.descriptionContainer}>
      <SignerData signer={signer} />
      <Box style={styles.limitTextWrapper}>
        <Text color="light.GreyText" style={styles.limitText}>
          {maxLength}/20
        </Text>
      </Box>
      <TextInput
        autoCapitalize="sentences"
        onChangeText={updateDescription}
        style={styles.descriptionEdit}
        placeholder="Add Description"
        placeholderTextColor={Colors.RichBlack}
        defaultValue={signer.signerDescription}
        maxLength={20}
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
      modalBackground={['light.mainBackground', 'light.mainBackground']}
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    width: windowWidth * 0.7,
    fontSize: 13,
    fontFamily: Fonts.RobotoCondensedBold,
    letterSpacing: 1,
    opacity: 0.5,
  },
  descriptionContainer: {
    width: windowWidth * 0.8,
  },
  limitTextWrapper: {
    width: windowWidth * 0.7,
    paddingHorizontal: 10,
    marginVertical: 10,
    alignItems: 'flex-end',
  },
  limitText: {
    fontSize: 12,
    letterSpacing: 0.6,
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
