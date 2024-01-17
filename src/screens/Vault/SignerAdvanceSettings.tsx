import Text from 'src/components/KeeperText';
import { Box, HStack, ScrollView, useColorMode, VStack } from 'native-base';
import Clipboard from '@react-native-community/clipboard';

import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Signer, VaultSigner } from 'src/core/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
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
import WalletInsideGreen from 'src/assets/images/coldcard_light.svg';
import WalletVault from 'src/assets/images/wallet_vault.svg';
import DeleteIcon from 'src/assets/images/delete_phone.svg';
import CopyIcon from 'src/assets/images/copy_new.svg';

import { hp, windowHeight, wp } from 'src/constants/responsive';
import ActionCard from 'src/components/ActionCard';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { TextInput } from 'react-native-gesture-handler';

const { width } = Dimensions.get('screen');

function SignerAdvanceSettings({ route }: any) {
  const { colorMode } = useColorMode();
  const { signer, vaultKey, vaultId }: { signer: Signer; vaultKey: VaultSigner; vaultId: string } =
    route.params;
  const { showToast } = useToastMessage();
  const signerName = getSignerNameFromType(signer.type, signer.isMock, isSignerAMF(signer));

  const [visible, setVisible] = useState(false);
  const [editEmailModal, setEditEmailModal] = useState(false);
  const [deleteEmailModal, setDeleteEmailModal] = useState(false);

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

  function VaultCardHeader() {
    return (
      <Box style={styles.walletHeaderWrapper}>
        <Box style={styles.walletIconWrapper}>
          <Box
            style={styles.walletIconView}
            backgroundColor={`${colorMode}.primaryGreenBackground`}
          >
            <WalletInsideGreen />
          </Box>
        </Box>
        <Box style={styles.walletNameWrapper}>
          <Text color={`${colorMode}.primaryGreenBackground`} style={styles.walletNameText}>
            Advanced Settings
          </Text>
          <Text color={`${colorMode}.textBlack`} style={styles.walletDescText}>
            StateBankLocker
          </Text>
        </Box>
      </Box>
    );
  }

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

  function editModalContent() {
    return (
      <Box height={400}>
        <Box>
          <TextInput style={styles.textInput} placeholder="disa@khazadum.com" />

          <TouchableOpacity
            onPress={() => {
              setEditEmailModal(false);
              setDeleteEmailModal(true);
            }}
          >
            <Box
              flexDirection={'row'}
              gap={2}
              alignItems={'center'}
              height={70}
              padding={5}
              style={{
                borderWidth: 1,
                borderStyle: 'dashed',
                borderRadius: 10,
                marginVertical: 10,
                backgroundColor: 'rgba(145, 120, 93, 0.08)',
              }}
            >
              <Box>
                <DeleteIcon />
              </Box>
              <Box>
                <Text
                  style={{ fontWeight: '800' }}
                  color={`${colorMode}.RussetBrown`}
                  fontSize={13}
                >
                  Delete Email
                </Text>
                <Box fontSize={12}>This is a irreversible action</Box>
              </Box>
            </Box>
          </TouchableOpacity>
          <Box alignItems={'center'} marginVertical={20}>
            <WarningIllustration />
          </Box>
          <Text
            style={{ fontWeight: '900' }}
            color={`${colorMode}.primaryGreenBackground`}
            fontSize={14}
          >
            Note:
          </Text>
          <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
            If notification is not declined continuously for 30 days, the Key would be activated
          </Text>
        </Box>
      </Box>
    );
  }

  function deleteEmailModalContent() {
    return (
      <Box height={200} justifyContent={'flex-end'}>
        <Box>
          <Text color="light.greenText" fontSize={13} padding={1} letterSpacing={0.65}>
            You would not receive daily reminders about your Inheritance Key if it is used
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
  const isOtherSD = signer.type === SignerType.UNKOWN_SIGNER;
  const isTapsigner = signer.type === SignerType.TAPSIGNER;

  const { font12, font10, font14 } = globalStyles;

  const { translations } = useContext(LocalizationContext);

  const { wallet: walletTranslation } = translations;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box mb={-10}>
        <KeeperHeader />
      </Box>
      {/* ------------ TODO Pratyaksh ---- add vault details------- */}
      <VaultCardHeader />
      {/* <Box backgroundColor={`${colorMode}.coffeeBackground`} style={styles.card}>
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
      </Box> */}
      <ScrollView>
        <OptionCard
          title={'Edit Description'}
          description={`Short description to help you remember`}
          callback={openDescriptionModal}
        />
        <OptionCard
          title={'Registered Email/Phone'}
          description={`Delete or Edit registered email/phone`}
          callback={() => {
            setEditEmailModal(true);
          }}
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
      </ScrollView>
      <Box ml={2} style={{ marginVertical: 20 }}>
        Wallet used in
      </Box>
      <ScrollView horizontal contentContainerStyle={{ gap: 5 }}>
        <ActionCard
          customStyle={{ height: 135 }}
          description={'Funds to return home'}
          cardName={'Valinor'}
          icon={<WalletVault />}
          callback={() => {}}
        />
        <ActionCard
          customStyle={{ height: 135 }}
          description={'Funds to return home'}
          cardName={'Valinor'}
          icon={<WalletVault />}
          callback={() => {}}
        />
        <ActionCard
          customStyle={{ height: 135 }}
          description={'Funds to return home'}
          cardName={'Valinor'}
          icon={<WalletVault />}
          callback={() => {}}
        />
      </ScrollView>

      {/* ---------------- Finger Print copy ---------- */}
      <TouchableOpacity
        activeOpacity={0.4}
        testID="btn_copy_address"
        onPress={() => {
          Clipboard.setString('testing');
          showToast(walletTranslation.addressCopied, <TickIcon />);
        }}
        style={styles.inputContainer}
      >
        <Box height={60} style={styles.inputWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
          <Box justifyContent={'center'} paddingLeft={2}>
            <Text fontSize={14}>Signer Fingerprint</Text>
            <Text width="80%" numberOfLines={1} color={`${colorMode}.GreenishGrey`}>
              JWL7U89
            </Text>
          </Box>
          <Box backgroundColor={`${colorMode}.copyBackground`} style={styles.copyIconWrapper}>
            <CopyIcon />
          </Box>
        </Box>
      </TouchableOpacity>
      {/* ------------------------------------------------------- */}
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
      <KeeperModal
        visible={editEmailModal}
        close={() => setEditEmailModal(false)}
        title="Registered Email"
        subTitle="Delete or edit registered email"
        subTitleColor="light.secondaryText"
        buttonTextColor="light.white"
        textColor="light.primaryText"
        Content={editModalContent}
      />
      <KeeperModal
        visible={deleteEmailModal}
        close={() => setDeleteEmailModal(false)}
        title="Deleting Registered Email"
        subTitle="Are you sure you want to delete email id?"
        subTitleColor="light.secondaryText"
        buttonTextColor="light.white"
        textColor="light.primaryText"
        buttonText="Delete"
        // -----TODO PARSH-----
        buttonCallback={() => {}}
        secondaryButtonText="Cancel"
        secondaryCallback={() => setDeleteEmailModal(false)}
        Content={deleteEmailModalContent}
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
  textInput: {
    width: '100%',
    height: 55,
    padding: 20,
    backgroundColor: 'rgba(253, 247, 240, 1)',
    borderRadius: 10,
  },
  walletHeaderWrapper: {
    margin: wp(15),
    flexDirection: 'row',
    width: '100%',
  },
  walletIconWrapper: {
    width: '15%',
  },
  walletIconView: {
    height: 40,
    width: 40,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletDescText: {
    fontSize: 14,
  },
  walletNameWrapper: {
    width: '85%',
  },
  walletNameText: {
    fontSize: 20,
  },
  inputContainer: {
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    marginTop: windowHeight > 600 ? hp(40) : 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
  },
  copyIconWrapper: {
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
  },
});
