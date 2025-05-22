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
import AdditionalUserPrivate from 'src/assets/privateImages/additional-user-illustration.svg';
import { useSelector } from 'react-redux';
import ConfirmDeleteGoldIllustration from 'src/assets/privateImages/Confirm-Deletion-gold.svg';

enum SecondaryVerificationOptionActionType {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

function AdditionalUsers({ route }: any) {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common, error: errorTranslation, signingServer: signingServerTranslation } = translations;
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
  const themeMode = useSelector((state: any) => state?.settings?.themeMode);
  const privateTheme = themeMode === 'PRIVATE';
  const privateThemeLight = themeMode === 'PRIVATE_LIGHT';
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
          showToast(errorTranslation.userDeleted);
          setDeleteUserValidationModal(false);
        }

        showValidationModal(false);
        setOtp('');
      } else {
        showValidationModal(false);
        showToast(errorTranslation.invalidOtp);
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
      <WalletHeader title={signingServerTranslation.manageAdditionalUsers} />
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
        <Text style={styles.noUsersText}>{signingServerTranslation.noAdditionalUsers}</Text>
      )}

      <Box flex={1} />
      <Box style={styles.ButtonContainer}>
        <Buttons
          primaryText={signingServerTranslation.addNewUser}
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
        title={signingServerTranslation.additionalUsers}
        subTitle={signingServerTranslation.additionalUsersSubTitle}
        buttonText={signingServerTranslation.addNewUser}
        buttonBackground={
          privateTheme || privateThemeLight
            ? `${colorMode}.pantoneGreen`
            : `${colorMode}.modalWhiteButton`
        }
        buttonTextColor={`${colorMode}.textGreen`}
        modalBackground={
          privateTheme || privateThemeLight
            ? `${colorMode}.primaryBackground`
            : `${colorMode}.pantoneGreen`
        }
        textColor={privateThemeLight ? `${colorMode}.textBlack` : `${colorMode}.headerWhite`}
        buttonCallback={() => {
          setAddNewUserModal(true);
          setAdditionalUser(false);
        }}
        Content={() => (
          <Box style={styles.modalIcon}>
            {privateTheme || privateThemeLight ? <AdditionalUserPrivate /> : <AdditonalUserIcon />}
          </Box>
        )}
      />

      <KeeperModal
        visible={addNewUserModal}
        close={() => {
          setAddNewUserModal(false);
        }}
        title={signingServerTranslation.addNewUser}
        subTitle={signingServerTranslation.subtitle2}
        buttonText={common.confirm}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <NewUserContent
            setPermittedActions={setPermittedActions}
            setAddNewUserModal={setAddNewUserModal}
            setNewUserName={setNewUserName}
            newUserName={newUserName}
            privateTheme={privateTheme || privateThemeLight}
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
        title={signingServerTranslation.permittedAction}
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
        title={signingServerTranslation.confirmDeletion}
        subTitle={signingServerTranslation.confirmDeletionSubTitle}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box style={styles.modalIcon}>
            {privateTheme || privateThemeLight ? (
              <ConfirmDeleteGoldIllustration />
            ) : (
              <DeleteIllustration />
            )}
          </Box>
        )}
        buttonText={common.confirm}
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
