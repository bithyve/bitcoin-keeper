import { Box, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import { hp, wp } from 'src/constants/responsive';
import KeeperModal from 'src/components/KeeperModal';
import AdditonalUserIcon from 'src/assets/images/additional_user_icon.svg';
import Buttons from 'src/components/Buttons';
import NewUserContent from './components/NewUserContent';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';
import PermittedActionContent from './components/PermittedActionContent';
import OtpContent from './components/OtpContent';
import UserCard from './components/UserCard';
import DeleteIllustration from 'src/assets/images/delete-illustration.svg';

const AdditionalUsers = () => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const [additionalUser, setAdditionalUser] = useState(false);
  const [addNewUserModal, setAddNewUserModal] = useState(false);
  const [PermittedActions, setPermittedActions] = useState(false);
  const [validationModal, showValidationModal] = useState(false);
  const [isSetupValidated, setIsSetupValidated] = useState(false);
  const [PermittedActionData, setPermittedActionData] = useState([]);
  const [otp, setOtp] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [deleteUser, setDeleteUser] = useState(false);
  const [deleteUserValidationModal, setDeleteUserValidationModal] = useState(false);

  useEffect(() => {
    if (isSetupValidated && !deleteUserValidationModal) {
      navigation.navigate('SetupSigningServer', {
        addSignerFlow: true,
        newUserName,
        PermittedActionData,
      });
      setIsSetupValidated(false);
    } else if (isSetupValidated && deleteUserValidationModal) {
      showToast('User Deleted Successfully');
      setDeleteUserValidationModal(false);
      setIsSetupValidated(false);
    }
  }, [isSetupValidated]);

  // dummy array for additional user data
  const additionalUserData = [
    {
      id: 1,
      name: 'Personal Use',
      tags: ['Transaction Signing', 'Policy Updates'],
    },
    {
      id: 2,
      name: 'When Backup',
      tags: ['Backup Access'],
    },
    {
      id: 3,
      name: 'For cancel ',
      tags: ['Cancel Transaction'],
    },
  ];

  // const additionalUserData = [];

  useEffect(() => {
    // if dont have user then modal will open
    if (additionalUserData.length <= 0) {
      setAdditionalUser(true);
    }
  }, []);

  return (
    <ScreenWrapper>
      <WalletHeader title="2FA Management" />
      {additionalUserData.length > 0 ? (
        <Box>
          <UserCard data={additionalUserData} setDeleteUser={setDeleteUser} />
        </Box>
      ) : null}

      <Box style={styles.ButtonContainer}>
        <Buttons
          primaryText="Add New"
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
        buttonBackground={`${colorMode}.modalWhiteButton`}
        buttonTextColor={`${colorMode}.textGreen`}
        modalBackground={`${colorMode}.pantoneGreen`}
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
          />
        )}
        buttonCallback={() => {
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
            showValidationModal={showValidationModal}
            setIsSetupValidated={setIsSetupValidated}
          />
        )}
      />

      <KeeperModal
        visible={deleteUser}
        close={() => {
          setDeleteUser(false);
        }}
        title={'Confirm Deletion'}
        subTitle={'Are you sure you want to delete this user?'}
        modalBackground={`${colorMode}.modalWhiteBackground`}
        textColor={`${colorMode}.textGreen`}
        subTitleColor={`${colorMode}.modalSubtitleBlack`}
        Content={() => (
          <Box style={styles.modalIcon}>
            <DeleteIllustration />
          </Box>
        )}
        buttonText={'Confirm'}
        buttonCallback={() => {
          setDeleteUser(false);
          showValidationModal(true);
          setDeleteUserValidationModal(true);
        }}
      />
    </ScreenWrapper>
  );
};

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
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingBottom: hp(20),
  },
  noUserContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
