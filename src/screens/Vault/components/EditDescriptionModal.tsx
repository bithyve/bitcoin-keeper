import { StyleSheet, TextInput } from 'react-native';
import { Box, HStack, useColorMode, VStack } from 'native-base';
import React, { useCallback, useRef, useState } from 'react';
import moment from 'moment';

import { Signer } from 'src/services/wallets/interfaces/vault';
import { windowWidth } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import KeeperModal from 'src/components/KeeperModal';
import Colors from 'src/theme/Colors';
import Fonts from 'src/constants/Fonts';
import { getSignerNameFromType } from 'src/hardware';
import { NetworkType, SignerType } from 'src/services/wallets/enums';
import config from 'src/utils/service-utilities/config';
import { SDIcons } from '../SigningDeviceIcons';

function SignerData({ signer }: { signer: Signer }) {
  const { colorMode } = useColorMode();

  return (
    <HStack>
      <Box style={styles.icon}>{SDIcons(signer.type, true).Icon}</Box>
      <VStack marginX="4" maxWidth="80%">
        <Text style={styles.name} color={`${colorMode}.primaryText`} numberOfLines={2}>
          {!signer.isBIP85
            ? getSignerNameFromType(signer.type, signer.isMock, false)
            : getSignerNameFromType(signer.type, signer.isMock, false) + ' +'}
        </Text>
        <Text color={`${colorMode}.GreyText`} fontSize={12} letterSpacing={0.6}>
          {`Added ${moment(signer.lastHealthCheck).calendar().toLocaleLowerCase()}`}
        </Text>
      </VStack>
    </HStack>
  );
}

function Content({ signer, descRef }: { signer: Signer; descRef }) {
  const { colorMode } = useColorMode();
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
        <Text color={`${colorMode}.GreyText`} style={styles.limitText}>
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
  signer: Signer;
  callback: any;
}) {
  const { colorMode } = useColorMode();
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
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.primaryText`}
      subTitleColor={`${colorMode}.secondaryText`}
      DarkCloseIcon={colorMode === 'dark'}
      close={close}
      title="Add Description"
      subTitle="Optionally you can add a short description to the signer"
      buttonText="Save"
      Content={MemoisedContent}
      buttonCallback={onSave}
    />
  );
}

export default DescriptionModal;

const styles = StyleSheet.create({
  descriptionEdit: {
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginVertical: 10,
    borderRadius: 10,
    width: windowWidth * 0.7,
    fontSize: 13,
    fontFamily: Fonts.FiraSansBold,
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
    letterSpacing: 1.12,
  },
});
