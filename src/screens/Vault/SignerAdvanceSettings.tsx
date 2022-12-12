import { Box, HStack, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';

import HeaderTitle from 'src/components/HeaderTitle';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import { RealmSchema } from 'src/storage/realm/enum';
import { RealmWrapperContext } from 'src/storage/realm/RealmProvider';
import RightArrowIcon from 'src/assets/icons/Wallets/icon_arrow.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { getSignerNameFromType } from 'src/hardware';
import moment from 'moment';
import { registerToColcard } from 'src/hardware/coldcard';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import KeeperModal from 'src/components/KeeperModal';
import { updateSignerDetails } from 'src/store/sagaActions/wallets';
import { WalletMap } from './WalletMap';

const { width } = Dimensions.get('screen');

const gradientStyles = {
  linearGradient: {
    colors: ['#B17F44', '#6E4A35'],
    start: [0, 0],
    end: [1, 0],
  },
};

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
}: {
  visible: boolean;
  close: () => void;
  signer: VaultSigner;
}) {
  const dispatch = useDispatch();
  const navgation: any = useNavigation();
  const descRef = useRef();
  const MemoisedContent = React.useCallback(
    () => <Content signer={signer} descRef={descRef} />,
    [signer]
  );
  const onSave = () => {
    navgation.setParams({ signer: { ...signer, signerDescription: descRef.current } });
    dispatch(updateSignerDetails(signer, 'signerDescription', descRef.current));
    close();
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

function SignerAdvanceSettings({ route }: any) {
  const { signer }: { signer: VaultSigner } = route.params;
  const signerName = getSignerNameFromType(
    signer.type,
    signer.isMock,
    signer.amfData && signer.amfData.xpub
  );
  const [nfcModal, setNfcModal] = useState(false);
  const [visible, setVisible] = useState(false);
  const openNfc = () => setNfcModal(true);
  const closeNfc = () => setNfcModal(false);
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);
  const { useQuery } = useContext(RealmWrapperContext);

  const Vault: Vault = useQuery(RealmSchema.Vault)
    .map(getJSONFromRealmObject)
    .filter((vault) => !vault.archived)[0];

  const register = async () => {
    if (signer.type === SignerType.COLDCARD) {
      openNfc();
      await registerToColcard({ vault: Vault });
      closeNfc();
    }
  };

  const navigation = useNavigation();

  const registerSigner = () => {
    switch (signer.type) {
      case SignerType.COLDCARD:
        register();
        return;
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR'));
        break;
      default:
        break;
    }
  };

  const navigateToPolicyChange = (signer: VaultSigner) => {
    const restrictions = idx(signer, (_) => _.signerPolicy.restrictions);
    const exceptions = idx(signer, (_) => _.signerPolicy.exceptions);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChoosePolicyNew',
        params: {
          restrictions,
          exceptions,
          update: true,
          signer,
        },
      })
    );
  };

  const isPolicyServer = signer.type === SignerType.POLICY_SERVER;

  const changePolicy = () => {
    if (isPolicyServer) navigateToPolicyChange(signer);
  };

  return (
    <ScreenWrapper>
      <HeaderTitle title="Advanced Settings" headerTitleColor="#092C27" />
      <Box bg={gradientStyles} style={styles.card}>
        <HStack alignItems="center">
          <Box style={styles.circle}>{WalletMap(signer.type, true).Icon}</Box>
          <VStack justifyContent="center" px={4}>
            <Text color="white" fontSize={14} fontFamily="body" fontWeight="200">
              {signerName}
            </Text>
            <Text color="white" fontSize={10} fontFamily="body" fontWeight="100">
              {moment(signer.addedOn).calendar().toLowerCase()}
            </Text>
            {signer.signerDescription ? (
              <Text color="white" fontSize={12} fontFamily="body" fontWeight="100">
                {signer.signerDescription}
              </Text>
            ) : null}
          </VStack>
        </HStack>
      </Box>
      <TouchableOpacity onPress={openDescriptionModal}>
        <HStack style={styles.item}>
          <VStack px={4} width="90%">
            <Text color="light.lightBlack" fontSize={14} fontFamily="body" fontWeight="200">
              Edit Description
            </Text>
            <Text color="light.lightBlack" fontSize={12} fontFamily="body" fontWeight="100">
              Short description to help you remember
            </Text>
          </VStack>
          <RightArrowIcon />
        </HStack>
      </TouchableOpacity>
      <TouchableOpacity onPress={registerSigner}>
        <HStack style={styles.item}>
          <VStack px={4} width="90%">
            <Text color="light.lightBlack" fontSize={14} fontFamily="body" fontWeight="200">
              Manual Registration
            </Text>
            <Text color="light.lightBlack" fontSize={12} fontFamily="body" fontWeight="100">
              {`Register your active vault with the ${signerName}.`}
            </Text>
          </VStack>
          <RightArrowIcon />
        </HStack>
      </TouchableOpacity>
      {isPolicyServer && (
        <TouchableOpacity onPress={changePolicy}>
          <HStack style={styles.item}>
            <VStack px={4} width="90%">
              <Text color="light.lightBlack" fontSize={14} fontFamily="body" fontWeight="200">
                Change Verification & Policy
              </Text>
              <Text color="light.lightBlack" fontSize={12} fontFamily="body" fontWeight="100">
                Restriction and threshold
              </Text>
            </VStack>
            <RightArrowIcon />
          </HStack>
        </TouchableOpacity>
      )}
      <NfcPrompt visible={nfcModal} />
      <DescriptionModal visible={visible} close={closeDescriptionModal} signer={signer} />
    </ScreenWrapper>
  );
}

export default SignerAdvanceSettings;

const styles = StyleSheet.create({
  card: {
    height: 80,
    width: '100%',
    borderRadius: 10,
    marginVertical: '10%',
    paddingHorizontal: '6%',
    justifyContent: 'center',
  },
  circle: {
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#694B2E',
  },
  item: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  descriptionBox: {
    height: 24,
    backgroundColor: '#FDF7F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  descriptionEdit: {
    height: 50,
    backgroundColor: '#FDF7F0',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  descriptionContainer: {
    width: width * 0.8,
  },
});
