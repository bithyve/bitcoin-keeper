import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import UpgradeIcon from 'src/assets/images/UpgradeCTAs.svg';
import InheritanceSeedIcon from 'src/assets/images/inheritanceSeedIcon.svg';
import InheritanceContactIcon from 'src/assets/images/inheritancecontacticon.svg';
import InheritanceShareKeyIcon from 'src/assets/images/inheritanceShareKeyIcon.svg';
import InheritanceRecoveryIcon from 'src/assets/images/inheritanceRecoveryIcon.svg';
import InheritanceLetterIcon from 'src/assets/images/inheritanceLetterIcon.svg';
import InheritanceTipsIcon from 'src/assets/images/inheritanceTipsIcon.svg';
import SettingServerIcon from 'src/assets/images/settingServer.svg';
import SettingAppIcon from 'src/assets/images/settingAppAccess.svg';
import SettingTorIcon from 'src/assets/images/settingTor.svg';
import SettingHistoryIcon from 'src/assets/images/settingHistory.svg';
import RecoveryKeyIcon from 'src/assets/images/recover_white.svg';
import CloudIcon from 'src/assets/images/clouduser.svg';
import DarkModeIcon from 'src/assets/images/dark-mode-icom.svg';
import CloudBackupIcon from 'src/assets/images/cloud-backup-icon.svg';
import GeneralPRIcon from 'src/assets/images/general-pref-icon.svg';
import AppSetIcon from 'src/assets/images/app-settng.svg';
import ManageKeyIcon from 'src/assets/images/setting-manage-wallet-icon.svg';
import ManageWalletIcon from 'src/assets/images/setting-hidden-Key-icon.svg';
import CanaryIcon from 'src/assets/images/bird-white.svg';
import PlebIcon from 'src/assets/images/plebIcon.svg';
import HodlerIcon from 'src/assets/images/hodlerIcon.svg';
import DiamondIcon from 'src/assets/images/diamondHandsIcon.svg';
import PlebGreenSub from 'src/assets/images/Pleb-green-sub-icon.svg';
import PlebWhiteSub from 'src/assets/images/pleb-white-sub-icon.svg';
import HodlerWhiteSub from 'src/assets/images/Hodler-white-sub-icon.svg';
import HodlerGreenSub from 'src/assets/images/Hodler-green-sub-icon.svg';
import DiamondGreenSub from 'src/assets/images/DiamondHands-green-sub-icon.svg';
import DiamondWhiteSub from 'src/assets/images/DiamondHands-white-sub-iocn.svg';

import Switch from 'src/components/Switch/Switch';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useIndicatorHook } from './useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useColorMode } from 'native-base';
import { SubscriptionTier } from 'src/models/enums/SubscriptionTier';
import { backupAllSignersAndVaults, deleteBackup } from 'src/store/sagaActions/bhr';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import {
  setBackupAllFailure,
  setBackupAllSuccess,
  setAutomaticCloudBackup,
  setDeleteBackupSuccess,
  setDeleteBackupFailure,
} from 'src/store/reducers/bhr';
import useToastMessage from './useToastMessage';
import ToastErrorIcon from 'src/assets/images/toast_error.svg';
import { setThemeMode } from 'src/store/reducers/settings';
import ThemeMode from 'src/models/enums/ThemeMode';
import { credsAuthenticated } from 'src/store/reducers/login';
import usePlan from './usePlan';
import KeeperModal from 'src/components/KeeperModal';
import { wp } from 'src/constants/responsive';
import Buttons from 'src/components/Buttons';

export const useSettingKeeper = () => {
  const dispatch = useAppDispatch();
  const { colorMode, toggleColorMode } = useColorMode();
  const navigation = useNavigation();
  const { showToast } = useToastMessage();
  const isFocused = useIsFocused();
  const { isOnL2Above } = usePlan();

  const data = useQuery(RealmSchema.BackupHistory);
  const [confirmPass, setConfirmPass] = useState(false);
  const [hiddenKeyPass, setHiddenKeyPass] = useState(false);
  const [showDeleteBackup, setShowDeleteBackup] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { vault, wallet, inheritancePlanning, settings, common, signer } = translations;
  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.RECOVERY_PHRASE_HEALTH_CHECK],
  });
  const { id }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const {
    backupAllFailure,
    backupAllSuccess,
    automaticCloudBackup,
    deleteBackupSuccess,
    deleteBackupFailure,
  } = useAppSelector((state) => state.bhr);

  useEffect(() => {
    if (colorMode === 'dark') {
      dispatch(setThemeMode(ThemeMode.DARK));
    } else {
      dispatch(setThemeMode(ThemeMode.LIGHT));
    }
  }, [colorMode]);

  const changeThemeMode = () => {
    toggleColorMode();
  };
  useEffect(() => {
    if (backupAllSuccess && isFocused) {
      dispatch(setBackupAllSuccess(false));
      dispatch(setAutomaticCloudBackup(true));
    }
  }, [backupAllSuccess]);

  useEffect(() => {
    if (deleteBackupSuccess && isFocused) {
      dispatch(setDeleteBackupSuccess(false));
      dispatch(setAutomaticCloudBackup(false));
    }
  }, [deleteBackupSuccess]);

  useEffect(() => {
    if (deleteBackupFailure && isFocused) {
      dispatch(setDeleteBackupFailure(false));
      showToast(
        'Unable to delete backup from Assisted Server, Please try again later.',
        <ToastErrorIcon />
      );
    }
  }, [deleteBackupFailure]);

  useEffect(() => {
    if (backupAllFailure && isFocused) {
      dispatch(setBackupAllFailure(false));
      showToast('Assisted Server Backup failed. Please try again later.', <ToastErrorIcon />);
    }
  }, [backupAllFailure]);
  const toggleAutomaticBackupMode = async () => {
    if (!automaticCloudBackup) dispatch(backupAllSignersAndVaults());
    else setShowDeleteBackup(true);
  };

  const toggleDebounce = (callback, delay = 300) => {
    let timeoutId;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(), delay);
    };
  };

  const planData = [
    {
      plan: SubscriptionTier.L1.toUpperCase(),
      title: signer.Pleb,
      subtitle: signer.Beginner,
      description: signer.plebDescription,
      icon: <PlebIcon width={30} height={30} />,
      sublightIcon: <PlebGreenSub width={24} height={24} />,
      subDarkIcon: <PlebWhiteSub width={24} height={24} />,
      subDescription: 'Start your bitcoin journey with our free subscription',
    },
    {
      plan: SubscriptionTier.L2.toUpperCase(),
      title: signer.hodler,
      subtitle: signer.intermediate,
      description: signer.hodlerDescription,
      icon: <HodlerIcon width={30} height={30} />,
      sublightIcon: <HodlerGreenSub width={24} height={24} />,
      subDarkIcon: <HodlerWhiteSub width={24} height={24} />,
      subDescription: 'Unlock features to easily manage bigger bitcoin stacks',
    },
    {
      plan: SubscriptionTier.L3.toUpperCase(),
      title: signer.diamondHands,
      subtitle: signer.advanced,
      description: signer.DiamondHandsDesciption,
      icon: <DiamondIcon width={30} height={30} />,
      sublightIcon: <DiamondGreenSub width={24} height={24} />,
      subDarkIcon: <DiamondWhiteSub width={24} height={24} />,
      subDescription: 'Unlock to protect significant amount of bitcoin and inheritance planning',
    },
  ];

  const BackAndRecovery = [
    {
      title: wallet.RecoveryKeyReset,
      description: inheritancePlanning.masterKeyDescp,
      icon: <RecoveryKeyIcon width={14} height={14} />,
      onPress: () => {
        if (data.length === 0) {
          dispatch(credsAuthenticated(false));
          setConfirmPass(true);
        } else {
          navigation.navigate('WalletBackHistory');
        }
      },
      showDot: typeBasedIndicator?.[uaiType.RECOVERY_PHRASE_HEALTH_CHECK]?.[id],
      isDiamond: false,
      isHodler: false,
    },
    {
      title: settings.personalCloudBackup,
      description: inheritancePlanning.personalCloudDescp,
      icon: <CloudIcon width={16} height={12} />,
      onRightPress: () => navigation.navigate('ChoosePlan'),
      rightIcon: isOnL2Above ? null : <UpgradeIcon width={64} height={20} />,
      onPress: () => navigation.navigate('CloudBackup'),
      isDiamond: true,
      isHodler: true,
    },

    {
      title: settings.assistedServerBackup,
      description: settings.assistedServerBackupSubtitle,
      icon: <CloudBackupIcon width={14} height={14} />,
      onPress: () => {},
      rightIcon: isOnL2Above ? (
        <Switch onValueChange={() => {}} value={automaticCloudBackup} />
      ) : (
        <UpgradeIcon width={64} height={20} />
      ),
      onRightPress: isOnL2Above
        ? toggleDebounce(() => toggleAutomaticBackupMode())
        : () => navigation.navigate('ChoosePlan'),
      isDiamond: false,
      isHodler: true,
    },
  ];

  const General = [
    {
      title: settings.DarkMode,
      description: settings.DarkModeSubTitle,
      icon: <DarkModeIcon width={14} height={14} />,
      onPress: toggleDebounce(() => changeThemeMode()),
      rightIcon: (
        <Switch
          onValueChange={toggleDebounce(() => changeThemeMode())}
          value={colorMode === 'dark'}
          testID="switch_darkmode"
        />
      ),
      onRightPress: toggleDebounce(() => changeThemeMode()),
      isDiamond: false,
    },
    {
      title: settings.GeneralPreferences,
      description: settings.CurrencyDefaultsSubtitle,
      icon: <GeneralPRIcon width={12} height={12} />,
      onPress: () => navigation.navigate('ChangeLanguage'),
      isDiamond: false,
    },
    {
      title: settings.appSetting,
      description: settings.appSettingDesc,
      icon: <AppSetIcon width={11} height={14} />,
      onPress: () => navigation.navigate('SettingApp'),
      isDiamond: false,
    },
  ];
  const keysAndwallet = [
    {
      title: common.manageKeys,
      description: common.manageKeysDesc,
      icon: <ManageKeyIcon width={14} height={14} />,
      onPress: () => setHiddenKeyPass(true),
      isDiamond: false,
    },
    {
      title: wallet.ManageWallets,
      description: wallet.ManageWalletsDesc,
      icon: <ManageWalletIcon width={14} height={14} />,
      onPress: () => navigation.navigate('ManageWallets'),
      isDiamond: false,
    },
    {
      title: vault.canaryWallet,
      description: inheritancePlanning.canaryWalletDesp,
      icon: <CanaryIcon width={14} height={14} />,
      rightIcon: isOnL2Above ? null : <UpgradeIcon width={64} height={20} />,
      onRightPress: () => navigation.navigate('ChoosePlan'),
      onPress: () => navigation.navigate('CanaryWallets'),
      isDiamond: false,
      isHodler: true,
    },
  ];
  const Tips = [
    {
      title: inheritancePlanning.backupRecoveryTips,
      description: inheritancePlanning.backupRecoveryDescp,
      icon: <InheritanceTipsIcon width={13} height={16} />,
      onPress: () => navigation.navigate('BackupAndRecoveryTips'),
      isDiamond: false,
    },
    {
      title: inheritancePlanning.secureUsageTips,
      description: inheritancePlanning.secureUsageTipsDesp,
      icon: <InheritanceTipsIcon width={13} height={16} />,
      onPress: () => navigation.navigate('SafeGuardingTips'),
      isDiamond: false,
    },
    {
      title: inheritancePlanning.safeKeepingTips,
      description: inheritancePlanning.safeKeepingTipsDesp,
      icon: <InheritanceTipsIcon width={13} height={16} />,
      onPress: () => navigation.navigate('SafeKeepingTips'),
      isDiamond: false,
    },
  ];
  const appSetting = [
    {
      title: common.serverSettings,
      description: settings.nodeSettingsSubtitle,
      icon: <SettingServerIcon width={16} height={11} />,
      onPress: () => navigation.navigate('NodeSettings'),
      isDiamond: false,
    },
    {
      title: settings.SecurityAndLogin,
      description: settings.SecurityAndLoginSubtitle,
      icon: <SettingAppIcon width={9} height={16} />,
      onPress: () => navigation.navigate('PrivacyAndDisplay'),
      isDiamond: false,
    },
    {
      title: settings.torSettingTitle,
      description: settings.torSettingSubTitle,
      icon: <SettingTorIcon width={14.5} height={16} />,
      onPress: () => navigation.navigate('TorSettings'),
      isDiamond: false,
    },
    {
      title: settings.VersionHistory,
      description: settings.VersionHistorySubTitle,
      icon: <SettingHistoryIcon width={16.5} height={16} />,
      onPress: () => navigation.navigate('AppVersionHistory'),
      isDiamond: false,
    },
  ];
  const inheritanceDocument = [
    {
      title: inheritancePlanning.recoveryPhraseTitle,
      description: inheritancePlanning.recoveryPhraseDescp,
      icon: <InheritanceSeedIcon width={14} height={14} />,
      onPress: () => navigation.navigate('RecoveryPhraseTemplate'),
      isDiamond: false,
    },
    {
      title: inheritancePlanning.trustedContactsTitle,
      description: inheritancePlanning.trustedContactsDescp,
      icon: <InheritanceContactIcon width={14} height={14} />,
      onPress: () => navigation.navigate('TrustedContactTemplates'),
      isDiamond: false,
    },
    {
      title: inheritancePlanning.additionalKeysshare,
      description: inheritancePlanning.additionalKeysDescp,
      icon: <InheritanceShareKeyIcon width={14} height={14} />,
      onPress: () => navigation.navigate('AdditionalSignerDetailsTemplate'),
      isDiamond: false,
    },
    {
      title: inheritancePlanning.recoveryInstructionsTitle,
      description: inheritancePlanning.recoveryInstructionsDescp,
      icon: <InheritanceRecoveryIcon width={14} height={14} />,
      onPress: () => navigation.navigate('RecoveryInstruction'),
      isDiamond: false,
    },
    {
      title: inheritancePlanning.letterOfAttorneyTitle,
      description: inheritancePlanning.letterOfAttorneyDescp,
      icon: <InheritanceLetterIcon width={14} height={14} />,
      onPress: () => navigation.navigate('LetterOfAttorney'),
      isDiamond: false,
    },
    {
      title: inheritancePlanning.inheritanceTipsTitle,
      description: inheritancePlanning.inheritanceTipsDescp,
      icon: <InheritanceTipsIcon width={14} height={14} />,
      onPress: () => navigation.navigate('InheritanceTips'),
      isDiamond: false,
    },
  ];

  const DeleteBackupModal = (
    <KeeperModal
      visible={showDeleteBackup}
      closeOnOverlayClick={false}
      close={() => setShowDeleteBackup(false)}
      title={settings.assistedServerBackup}
      subTitleWidth={wp(240)}
      subTitle={settings.assistedServerDeleteBackupSubtitle}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.modalHeaderTitle`}
      subTitleColor={`${colorMode}.modalSubtitleBlack`}
      Content={() => (
        <Buttons
          primaryText={settings.assistedServerDeleteBackupModalCTA}
          primaryCallback={() => {
            setShowDeleteBackup(false);
            dispatch(deleteBackup());
          }}
          secondaryCallback={() => {
            setShowDeleteBackup(false);
            dispatch(setAutomaticCloudBackup(false));
          }}
          secondaryText={settings.assistedServerDeleteBackupModalSecondaryCTA}
        />
      )}
    />
  );

  return {
    BackAndRecovery,
    General,
    keysAndwallet,
    Tips,
    appSetting,
    inheritanceDocument,
    confirmPass,
    setConfirmPass,
    planData,
    hiddenKeyPass,
    setHiddenKeyPass,
    DeleteBackupModal,
  };
};
