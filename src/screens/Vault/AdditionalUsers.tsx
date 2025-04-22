import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import AdditonalUserIcon from 'src/assets/images/additional_user_icon.svg';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import DeleteIllustration from 'src/assets/images/delete-illustration.svg';
import { Signer } from 'src/services/wallets/interfaces/vault';
import SigningServer from 'src/services/backend/SigningServer';
import {
  PermittedAction,
  SignerPolicy,
  VerificationOption,
  VerificationType,
} from 'src/models/interfaces/AssistedKeys';
import idx from 'idx';
import dbManager from 'src/storage/realm/dbManager';
import { RealmSchema } from 'src/storage/realm/enum';
import { getKeyUID } from 'src/utils/utilities';
import { generateKey } from 'src/utils/service-utilities/encryption';
import NewUserContent from './components/NewUserContent';
import PermittedActionContent from './components/PermittedActionContent';
import OtpContent from './components/OtpContent';
import UserCard from './components/UserCard';
import WalletUtilities from 'src/services/wallets/operations/utils';
import { ScriptTypes } from 'src/services/wallets/enums';
import Text from 'src/components/KeeperText';
import usePlan from 'src/hooks/usePlan';

enum SecondaryVerificationOptionActionType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

function AdditionalUsers({ route }: any) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const {
    signer,
  }: {
    signer: Signer;
  } = route.params;

  const [additionalUser, setAdditionalUser] = useState(false);
  const [addNewUserModal, setAddNewUserModal] = useState(false);
  const [PermittedActions, setPermittedActions] = useState(false);
  const [validationModal, showValidationModal] = useState(false);
  const [PermittedActionData, setPermittedActionData] = useState({
    [PermittedAction.SIGN_TRANSACTION]: true,
  });
  const [otp, setOtp] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [deleteUser, setDeleteUser] = useState(false);
  const [deleteUserValidationModal, setDeleteUserValidationModal] = useState(false);
  const [secondaryActionType, setSecondaryActionType] = useState('');
  const [removeOptionId, setRemoveOptionId] = useState('');
  const [secondaryVerificationOptions, setSecondaryVerificationOptions] = useState<
    VerificationOption[]
  >(idx(signer, (_) => _.signerPolicy.secondaryVerification) || []);
  const { isOnL4 } = usePlan();
  const [additionalUserData, setAdditionalUserData] = useState(
    (idx(signer, (_) => _.signerPolicy.secondaryVerification) || []).map((option) => {
      return {
        id: option.id,
        name: option.label,
        tags: option.permittedActions,
      };
    })
  );

  useEffect(() => {
    const userData = secondaryVerificationOptions.map((option) => {
      return {
        id: option.id,
        name: option.label,
        tags: option.permittedActions,
      };
    });

    setAdditionalUserData(userData);

    if (userData.length <= 0) {
      setAdditionalUser(true);
    }
  }, [secondaryVerificationOptions]);

  const processSecondaryVerificationOption = async () => {
    try {
      const verificationToken = Number(otp);
      let success: boolean;
      let newSecondaryVerificationOption: VerificationOption;
      let updatedSecondaryVerificationOptions: VerificationOption[];

      if (secondaryActionType === SecondaryVerificationOptionActionType.ADD) {
        const permittedActions = Object.keys(PermittedActionData).filter(
          (key) => PermittedActionData[key]
        ) as PermittedAction[];

        if (permittedActions.length < 1) {
          throw new Error('Unable to add - permitted action(s) not selected');
        }
        const label = newUserName;
        const verificationOption: VerificationOption = {
          id: generateKey(10),
          method: VerificationType.TWO_FA,
          label,
          permittedActions,
        };

        const res = await SigningServer.addSecondaryVerificationOption(
          WalletUtilities.getFingerprintFromExtendedKey(
            signer.signerXpubs[ScriptTypes.P2WSH][0].xpub,
            WalletUtilities.getNetworkByType(signer.networkType)
          ),
          verificationToken,
          verificationOption
        );
        success = res.success;
        if (success) {
          newSecondaryVerificationOption = res.secondaryVerificationOption;
          updatedSecondaryVerificationOptions = [
            ...(secondaryVerificationOptions || []),
            verificationOption,
          ];
        }
      } else if (secondaryActionType === SecondaryVerificationOptionActionType.REMOVE) {
        if (!removeOptionId) throw new Error('Unable to remove - optionId missing');

        const res = await SigningServer.removeSecondaryVerificationOption(
          WalletUtilities.getFingerprintFromExtendedKey(
            signer.signerXpubs[ScriptTypes.P2WSH][0].xpub,
            WalletUtilities.getNetworkByType(signer.networkType)
          ),
          verificationToken,
          removeOptionId
        );
        success = res.success;
        if (success) {
          updatedSecondaryVerificationOptions = secondaryVerificationOptions.filter(
            (option) => option.id !== removeOptionId
          );
        }
      } else throw new Error('Invalid action');

      if (success && updatedSecondaryVerificationOptions) {
        const updatedSignerPolicy: SignerPolicy = {
          ...signer.signerPolicy,
          secondaryVerification: updatedSecondaryVerificationOptions,
        };

        const signerKeyUID = getKeyUID(signer);
        dbManager.updateObjectByQuery(
          RealmSchema.Signer,
          (realmSigner) => getKeyUID(realmSigner) === signerKeyUID,
          {
            signerPolicy: updatedSignerPolicy,
          }
        );

        setSecondaryVerificationOptions(updatedSecondaryVerificationOptions);

        if (secondaryActionType === SecondaryVerificationOptionActionType.ADD) {
          navigation.navigate('SetupAdditionalServerKey', {
            validationKey: newSecondaryVerificationOption.verifier,
            label: newUserName,
          });
        } else if (secondaryActionType === SecondaryVerificationOptionActionType.REMOVE) {
          showToast('User was deleted successfully');
          setDeleteUserValidationModal(false);
        }

        showValidationModal(false);
        setOtp('');
      } else {
        showValidationModal(false);
        showToast('Invalid OTP. Please try again!');
        setOtp('');
      }
    } catch (err) {
      showValidationModal(false);
      showToast(`${err.message}`);
      setOtp('');
    }
  };

  return (
    <ScreenWrapper>
      <WalletHeader title="Manage Additional Users" />
      {additionalUserData.length > 0 ? (
        <ScrollView>
          <Box>
            <UserCard
              data={additionalUserData}
              setDeleteUser={setDeleteUser}
              setRemoveOptionId={setRemoveOptionId}
            />
          </Box>
        </ScrollView>
      ) : (
        <Text style={styles.noUsersText}>The Server Key has no existing additional users.</Text>
      )}

      <Box flex={1} />
      <Box style={styles.ButtonContainer}>
        <Buttons
          primaryText="Add New User"
          primaryCallback={() => {
            setAddNewUserModal(true);
          }}
          fullWidth
        />
      </Box>

      <KeeperModal
        visible={additionalUser}
        close={() => {
          setAdditionalUser(false);
        }}
        title="Additional Users"
        subTitle="Here you can add and manage additional users to whom you would like to give access to your Server Key. Each user will have their own 2FA code, and a set of permissions for the actions they are allowed to access with your Server Key."
        buttonText="Add New User"
        buttonBackground={isOnL4 ? `${colorMode}.pantoneGreen` : `${colorMode}.modalWhiteButton`}
        buttonTextColor={`${colorMode}.textGreen`}
        modalBackground={isOnL4 ? `${colorMode}.primaryBackground` : `${colorMode}.pantoneGreen`}
        textColor={`${colorMode}.headerWhite`}
        buttonCallback={() => {
          setAddNewUserModal(true);
          setAdditionalUser(false);
        }}
        Content={() => (
          <Box style={styles.modalIcon}>
            <AdditonalUserIcon />
          </Box>
        )}
      />

      <KeeperModal
        visible={addNewUserModal}
        close={() => {
          setAddNewUserModal(false);
        }}
        title="Add New User"
        subTitle="Please add a name for the new user and select the permissions for them to have with your Server Key"
        buttonText="Confirm"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <NewUserContent
            setPermittedActions={setPermittedActions}
            setAddNewUserModal={setAddNewUserModal}
            setNewUserName={setNewUserName}
            newUserName={newUserName}
            isOnL4={isOnL4}
          />
        )}
        buttonCallback={() => {
          setSecondaryActionType(SecondaryVerificationOptionActionType.ADD);
          if (removeOptionId) setRemoveOptionId('');
          showValidationModal(true);
          setAddNewUserModal(false);
        }}
      />

      <KeeperModal
        visible={PermittedActions}
        close={() => {
          setPermittedActions(false);
        }}
        title="Permitted Actions"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <PermittedActionContent
            setPermittedActionData={setPermittedActionData}
            PermittedActionData={PermittedActionData}
            setPermittedActions={setPermittedActions}
            setAddNewUserModal={setAddNewUserModal}
          />
        )}
      />
      <KeeperModal
        visible={validationModal}
        close={() => {
          showValidationModal(false);
          setOtp('');
        }}
        title={common.confirm2FACodeTitle}
        subTitle={common.confirm2FACodeSubtitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <OtpContent
            setOtp={setOtp}
            otp={otp}
            showToast={showToast}
            callback={processSecondaryVerificationOption}
          />
        )}
      />

      <KeeperModal
        visible={deleteUser}
        close={() => {
          setDeleteUser(false);
        }}
        title="Confirm Deletion"
        subTitle="Are you sure you want to delete this user?"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box style={styles.modalIcon}>
            <DeleteIllustration />
          </Box>
        )}
        buttonText="Confirm"
        buttonCallback={() => {
          setSecondaryActionType(SecondaryVerificationOptionActionType.REMOVE);
          setDeleteUser(false);
          showValidationModal(true);
          setDeleteUserValidationModal(true);
        }}
      />
    </ScreenWrapper>
  );
}

export default AdditionalUsers;

const styles = StyleSheet.create({
  infoIcon: {
    marginRight: wp(10),
  },
  modalIcon: {
    alignItems: 'center',
    marginVertical: hp(10),
  },
  ButtonContainer: {
    marginTop: hp(20),
    paddingBottom: hp(20),
  },
  noUserContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noUsersText: {
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});
