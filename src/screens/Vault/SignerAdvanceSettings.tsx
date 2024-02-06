import Text from 'src/components/KeeperText';
import { Box, VStack, useColorMode } from 'native-base';

import { CommonActions, useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Signer, Vault, VaultSigner } from 'src/core/wallets/interfaces/vault';
import KeeperHeader from 'src/components/KeeperHeader';
import NfcPrompt from 'src/components/NfcPromptAndroid';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { SignerType } from 'src/core/wallets/enums';
import TickIcon from 'src/assets/images/icon_tick.svg';
import { registerToColcard } from 'src/hardware/coldcard';
import idx from 'idx';
import { useDispatch } from 'react-redux';
import { updateKeyDetails, updateSignerDetails } from 'src/store/sagaActions/wallets';
import useToastMessage from 'src/hooks/useToastMessage';
import useVault from 'src/hooks/useVault';
import useNfcModal from 'src/hooks/useNfcModal';
import { SDIcons } from './SigningDeviceIcons';
import DescriptionModal from './components/EditDescriptionModal';
import WarningIllustration from 'src/assets/images/warning.svg';
import KeeperModal from 'src/components/KeeperModal';
import OptionCard from 'src/components/OptionCard';
import WalletVault from 'src/assets/images/wallet_vault.svg';
import DeleteIcon from 'src/assets/images/delete_phone.svg';

import { hp, wp } from 'src/constants/responsive';
import ActionCard from 'src/components/ActionCard';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { InheritanceAlert, InheritancePolicy } from 'src/services/interfaces';
import InheritanceKeyServer from 'src/services/operations/InheritanceKey';
import { captureError } from 'src/services/sentry';
import { emailCheck } from 'src/utils/utilities';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import WalletFingerprint from 'src/components/WalletFingerPrint';
import useSignerMap from 'src/hooks/useSignerMap';

const { width } = Dimensions.get('screen');

function SignerAdvanceSettings({ route }: any) {
  const { colorMode } = useColorMode();
  const { vaultKey, vaultId }: { signer: Signer; vaultKey: VaultSigner; vaultId: string } =
    route.params;
  const { signerMap } = useSignerMap();
  const signer = signerMap[vaultKey.masterFingerprint];
  const { showToast } = useToastMessage();
  const [visible, setVisible] = useState(false);
  const [editEmailModal, setEditEmailModal] = useState(false);
  const [deleteEmailModal, setDeleteEmailModal] = useState(false);

  const currentEmail = idx(signer, (_) => _.inheritanceKeyInfo.policy.alert.emails[0]) || '';

  const [waningModal, setWarning] = useState(false);
  const { withNfcModal, nfcVisible, closeNfc } = useNfcModal();
  const openDescriptionModal = () => setVisible(true);
  const closeDescriptionModal = () => setVisible(false);

  const { activeVault, allVaults } = useVault({ vaultId, includeArchived: false });
  const signerVaults: Vault[] = [];

  allVaults.forEach((vault) => {
    const keys = vault.signers;
    for (const key of keys) {
      if (signer.masterFingerprint === key.masterFingerprint) {
        signerVaults.push(vault);
        break;
      }
    }
  });

  const registerColdCard = async () => {
    await withNfcModal(() => registerToColcard({ vault: activeVault }));
  };

  const navigation: any = useNavigation();
  const dispatch = useDispatch();

  const updateIKSPolicy = async (removeEmail: string, newEmail?: string) => {
    try {
      if (!removeEmail && !newEmail) {
        showToast('Nothing to update');
        navigation.goBack();
        return;
      }

      const thresholdDescriptors = activeVault.signers.map((signer) => signer.xfp).slice(0, 2);

      if (signer.inheritanceKeyInfo === undefined)
        showToast('Something went wrong, IKS configuration missing', <TickIcon />);

      const existingPolicy: InheritancePolicy = signer.inheritanceKeyInfo.policy;
      const existingAlert: InheritanceAlert | any =
        idx(signer, (_) => _.inheritanceKeyInfo.policy.alert) || {};
      const existingEmails = existingAlert.emails || [];

      // remove the previous email
      const index = existingEmails.indexOf(removeEmail);
      if (index !== -1) existingEmails.splice(index, 1);

      // add the new email(if provided)
      const updatedEmails = [...existingEmails];
      if (newEmail) updatedEmails.push(newEmail);

      const updatedPolicy: InheritancePolicy = {
        ...existingPolicy,
        alert: {
          ...existingAlert,
          emails: updatedEmails,
        },
      };

      const { updated } = await InheritanceKeyServer.updateInheritancePolicy(
        vaultKey.xfp,
        updatedPolicy,
        thresholdDescriptors
      );

      if (updated) {
        const updateInheritanceKeyInfo = {
          ...signer.inheritanceKeyInfo,
          policy: updatedPolicy,
        };

        dispatch(updateSignerDetails(signer, 'inheritanceKeyInfo', updateInheritanceKeyInfo));
        showToast(`Email ${newEmail ? 'updated' : 'deleted'}`, <TickIcon />);
        navigation.goBack();
      } else showToast(`Failed to ${newEmail ? 'update' : 'delete'} email`);
    } catch (err) {
      captureError(err);
      showToast(`Failed to ${newEmail ? 'update' : 'delete'} email`);
    }
  };

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
        navigation.dispatch(CommonActions.navigate('RegisterWithChannel', { vaultKey, vaultId }));
        break;
      case SignerType.KEYSTONE:
      case SignerType.JADE:
      case SignerType.PASSPORT:
      case SignerType.SEEDSIGNER:
      case SignerType.SPECTER:
      case SignerType.OTHER_SD:
        navigation.dispatch(CommonActions.navigate('RegisterWithQR', { vaultKey, vaultId }));
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
          <Text color="light.greenText" style={styles.warningText}>
            If the signer is identified incorrectly there may be repurcusssions with general signer
            interactions like signing etc.
          </Text>
        </Box>
      </Box>
    );
  }

  const EditModalContent = () => {
    const [email, setEmail] = useState(currentEmail);
    const [emailStatusFail, setEmailStatusFail] = useState(false);
    return (
      <Box style={styles.editModalContainer}>
        <Box>
          <TextInput
            style={styles.textInput}
            placeholder="pleb@bitcoin.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              emailStatusFail && setEmailStatusFail(false);
            }}
          />
          {emailStatusFail && (
            <Text color={`${colorMode}.errorRed`} style={styles.errorStyle}>
              Email is not correct
            </Text>
          )}
          <TouchableOpacity
            onPress={() => {
              setEditEmailModal(false);
              setDeleteEmailModal(true);
            }}
          >
            <Box style={styles.deleteContentWrapper} backgroundColor={`${colorMode}.LightBrown`}>
              <Box>
                <DeleteIcon />
              </Box>
              <Box>
                <Text style={styles.fw800} color={`${colorMode}.RussetBrown`} fontSize={13}>
                  Delete Email
                </Text>
                <Box fontSize={12}>This is a irreversible action</Box>
              </Box>
            </Box>
          </TouchableOpacity>
          <Box style={styles.warningIconWrapper}>
            <WarningIllustration />
          </Box>
          <Text style={styles.noteText} color={`${colorMode}.primaryGreenBackground`}>
            Note:
          </Text>
          <Text color="light.greenText" style={styles.noteDescription}>
            If notification is not declined continuously for 30 days, the Key would be activated
          </Text>
        </Box>
        {currentEmail !== email && (
          <TouchableOpacity
            style={styles.updateBtnCtaStyle}
            onPress={() => {
              if (!emailCheck(email)) {
                setEmailStatusFail(true);
              } else {
                updateIKSPolicy(currentEmail, email);
              }
            }}
          >
            <Box backgroundColor={`${colorMode}.greenButtonBackground`} style={styles.cta}>
              <Text style={styles.ctaText} color={'light.white'} bold>
                Update
              </Text>
            </Box>
          </TouchableOpacity>
        )}
      </Box>
    );
  };

  function DeleteEmailModalContent() {
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
          vault: activeVault,
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
  const isInheritanceKey = signer.type === SignerType.INHERITANCEKEY;
  const isAssistedKey = isPolicyServer || isInheritanceKey;

  const isOtherSD = signer.type === SignerType.UNKOWN_SIGNER;
  const isTapsigner = signer.type === SignerType.TAPSIGNER;

  const { translations } = useContext(LocalizationContext);

  const { wallet: walletTranslation } = translations;
  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title="Advanced Settings"
        subtitle={`for ${signer.signerName}`}
        icon={
          <CircleIconWrapper
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={SDIcons(signer.type, true).Icon}
          />
        }
      />
      <ScrollView contentContainerStyle={{ flex: 1, paddingTop: '10%' }}>
        <OptionCard
          title={'Edit Description'}
          description={`Short description to help you remember`}
          callback={openDescriptionModal}
        />
        {isInheritanceKey && vaultId && (
          <OptionCard
            title={'Registered Email'}
            description={`Delete or Edit registered email`}
            callback={() => {
              setEditEmailModal(true);
            }}
          />
        )}
        {isAssistedKey || !vaultId ? null : (
          <OptionCard
            title={'Manual Registration'}
            description={`Register your active vault`}
            callback={registerSigner}
          />
        )}
        {/* disabling this temporarily */}
        {/* <OptionCard
          title={isOtherSD ? 'Assign signer type' : 'Change signer type'}
          description="Identify your signer type for enhanced connectivity and communication"
          callback={isOtherSD ? navigateToAssignSigner : () => setWarning(true)}
        /> */}
        {isPolicyServer && vaultId && (
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
        {/* <OptionCard title="XPub" description="Lorem Ipsum Dolor" callback={() => {}} /> */}
      </ScrollView>
      <VStack>
        <Box ml={2} style={{ marginVertical: 20 }}>
          {`Wallet used in ${signerVaults.length} wallet${signerVaults.length > 1 ? 's' : ''}`}
        </Box>
        <ScrollView horizontal contentContainerStyle={{ gap: 5 }}>
          {signerVaults.map((vault) => (
            <ActionCard
              key={vault.id}
              description={vault.presentationData?.description}
              cardName={vault.presentationData.name}
              icon={<WalletVault />}
              callback={() => {}}
            />
          ))}
        </ScrollView>
        <Box style={styles.fingerprint}>
          <WalletFingerprint title="Signer Fingerprint" fingerprint={vaultId} />
        </Box>
      </VStack>
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
        Content={EditModalContent}
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
        buttonCallback={() => {
          updateIKSPolicy(currentEmail);
        }}
        secondaryButtonText="Cancel"
        secondaryCallback={() => setDeleteEmailModal(false)}
        Content={DeleteEmailModalContent}
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
    marginTop: '10%',
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    height: 60,
  },
  copyIconWrapper: {
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
  },
  deleteContentWrapper: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    marginVertical: hp(10),
    gap: 10,
    padding: 10,
    height: hp(70),
    alignItems: 'center',
    flexDirection: 'row',
  },
  warningIconWrapper: {
    alignItems: 'center',
    marginVertical: hp(20),
  },
  noteText: {
    fontWeight: '900',
    fontSize: 14,
  },
  noteDescription: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
  editModalContainer: {},
  fw800: {
    fontWeight: '800',
  },
  fingerprintContainer: {
    justifyContent: 'center',
    paddingLeft: 2,
  },
  w80: {
    width: '80%',
  },
  warningText: {
    fontSize: 13,
    padding: 1,
    letterSpacing: 0.65,
  },
  walletUsedText: {
    marginLeft: 2,
    marginVertical: 20,
  },
  actionCardContainer: {
    gap: 5,
  },
  cta: {
    borderRadius: 10,
    width: wp(120),
    height: hp(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 13,
    letterSpacing: 1,
  },
  updateBtnCtaStyle: { alignItems: 'flex-end', marginTop: 10 },
  errorStyle: {
    marginTop: 10,
  },
  fingerprint: {
    alignItems: 'center',
  },
});
