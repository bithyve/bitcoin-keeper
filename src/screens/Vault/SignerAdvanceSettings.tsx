import Text from 'src/components/KeeperText';
import { Box, HStack, useColorMode, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Signer, VaultSigner } from 'src/core/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import { getSignerNameFromType, isSignerAMF } from 'src/hardware';
import moment from 'moment';
import { registerToColcard } from 'src/hardware/coldcard';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import { updateKeyDetails, updateSignerDetails } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import { globalStyles } from 'src/constants/globalStyles';
import useVault from 'src/hooks/useVault';
import useNfcModal from 'src/hooks/useNfcModal';
import { SDIcons } from './SigningDeviceIcons';
import DescriptionModal from './components/EditDescriptionModal';
import WarningIllustration from 'src/assets/images/warning.svg';
import KeeperModal from 'src/components/KeeperModal';
import OptionCard from 'src/components/OptionCard';

const { width } = Dimensions.get('screen');

function SignerAdvanceSettings({ route }: any) {
  const { colorMode } = useColorMode();
  const { signer, vaultKey, vaultId }: { signer: Signer; vaultKey: VaultSigner; vaultId: string } =
    route.params;
  const { showToast } = useToastMessage();
  const signerName = getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer));

  const [visible, setVisible] = useState(false);
  const [waningModal, setWarning] = useState(false);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);

  const { activeVault } = useVault({ vaultId });

  const registerColdCard = async () => {
    await withNfcModal(() => registerToColcard({ vault: activeVault }));
  };

  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const registerSigner = async () => {
    switch (signer.type) {
      case SignerType.COLDCARD:
        await registerColdCard();
        dispatch(
          updateKeyDetails(vaultKey, 'registered', {
            registered: true,
            vaultId: activeVault.id,
          })
        );
        return;
      case SignerType.LEDGER:
      case SignerType.BITBOX02:
        navigation.dispatch(CommonActions.navigate('RegisterWithChannel', { vaultKey }));
        break;
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
      case SignerType.SPECTER:
      case SignerType.OTHER_SD:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey }));
        break;
      default:
        showToast('Comming soon', null, 1000);
        break;
    }
  };

  const navigateToPolicyChange = () => {
    const restrictions = idx(signer, (_) => _.signerPolicy.restrictions);
    const exceptions = idx(signer, (_) => _.signerPolicy.exceptions);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'ChoosePolicyNew',
        params: {
          restrictions,
          exceptions,
          isUpdate: true,
          signer,
          vaultId,
          vaultKey,
        },
      })
    );
  };

  function WarningContent() {
    return (
      <Box alignItems="center">
        <WarningIllustration />
        <Box>
          <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
            If the signer is identified incorrectly there may be repurcusssions with general signer
            interactions like signing etc.
          </Text>
        </Box>
      </Box>
    );
  }

  const navigateToAssignSigner = () => {
    setWarning(false);
    navigation.dispatch(
      CommonActions.navigate({
        name: 'AssignSignerType',
        params: {
          parentNavigation: navigation,
          signer,
          vaultId,
        },
      })
    );
  };
  const navigateToUnlockTapsigner = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'UnlockTapsigner',
      })
    );
  };

  const isPolicyServer = signer.type === SignerType.POLICY_SERVER;
  const isOtherSD = signer.type === SignerType.OTHER_SD;
  const isTapsigner = signer.type === SignerType.TAPSIGNER;

  const { font12, font10, font14 } = globalStyles;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader title="Advanced Settings" />
      <Box backgroundColor={`${colorMode}.coffeeBackground`} style={styles.card}>
        <HStack alignItems="center">
          <Box style={styles.circle}>{SDIcons(signer.type, true).Icon}</Box>
          <VStack justifyContent="center" px={4}>
            <Text color="white" style={[font14]}>
              {signerName}
            </Text>
            <Text color={`${colorMode}.white`} style={[font10]} light>
              {moment(signer.addedOn).format('DD MMM YYYY, HH:mmA')}
            </Text>
            {signer.signerDescription ? (
              <Text color={`${colorMode}.white`} style={[font12]} light>
                {signer.signerDescription}
              </Text>
            ) : null}
          </VStack>
        </HStack>
      </Box>
      <OptionCard
        title={'Edit Description'}
        description={`Short description to help you remember`}
        callback={openDescriptionModal}
      />
      <OptionCard
        title={'Manual Registration'}
        description={`Register your active vault with the ${signerName}`}
        callback={registerSigner}
      />
      <OptionCard
        title={isOtherSD ? 'Assign signer type' : 'Change signer type'}
        description="Identify your signer type for enhanced connectivity and communication"
        callback={isOtherSD ? navigateToAssignSigner : () => setWarning(true)}
      />
      {isPolicyServer && (
        <OptionCard
          title="Change Verification & Policy"
          description="Restriction and threshold"
          callback={navigateToPolicyChange}
        />
      )}
      {isTapsigner && (
        <OptionCard
          title="Unlock card"
          description="Run the unlock card process if it's rate-limited"
          callback={navigateToUnlockTapsigner}
        />
      )}
      {/* ---------TODO Pratyaksh--------- */}
      <OptionCard title="XPub" description="Lorem Ipsum Dolor" callback={() => {}} />
      <NfcPrompt visible={nfcVisible} close={closeNfc} />
      <DescriptionModal
        visible={visible}
        close={closeDescriptionModal}
        signer={signer}
        callback={(value: any) => {
          navigation.setParams({ signer: { ...signer, signerDescription: value } });
          dispatch(updateSignerDetails(signer, 'signerDescription', value));
        }}
      />
      <KeeperModal
        visible={waningModal}
        close={() => setWarning(false)}
        title="Changing signer Type"
        subTitle="Are you sure you want to change the signer type?"
        subTitleColor="light.secondaryText"
        buttonText="Continue"
        buttonTextColor="light.white"
        secondaryButtonText="Cancel"
        secondaryCallback={() => setWarning(false)}
        buttonCallback={navigateToAssignSigner}
        textColor="light.primaryText"
        Content={WarningContent}
      />
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
