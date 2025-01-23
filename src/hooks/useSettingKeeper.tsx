import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
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
import GeneralPRIcon from 'src/assets/images/general-pref-icon.svg';
import AppSetIcon from 'src/assets/images/app-settng.svg';
import ManageKeyIcon from 'src/assets/images/setting-manage-wallet-icon.svg';
import ManageWalletIcon from 'src/assets/images/setting-hidden-Key-icon.svg';
import CanaryIcon from 'src/assets/images/bird-white.svg';

import Switch from 'src/components/Switch/Switch';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useIndicatorHook } from './useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';
import { useQuery } from '@realm/react';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import { useColorMode } from 'native-base';

export const useSettingKeeper = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigation = useNavigation();
  const data = useQuery(RealmSchema.BackupHistory);
  const [confirmPass, setConfirmPass] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const { vault, wallet, inheritancePlanning, settings, common } = translations;
  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.RECOVERY_PHRASE_HEALTH_CHECK],
  });
  const { id }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(getJSONFromRealmObject)[0];
  const changeThemeMode = () => {
    toggleColorMode();
  };

  const BackAndRecovery = [
    {
      title: wallet.RecoveryKeyReset,
      description: inheritancePlanning.masterKeyDescp,
      icon: <RecoveryKeyIcon width={14} height={14} />,
      onPress: () => {
        if (data.length === 0) {
          console.log('no data');

          setConfirmPass(true);
        } else {
          navigation.navigate('WalletBackHistory');
        }
      },
      showDot: typeBasedIndicator?.[uaiType.RECOVERY_PHRASE_HEALTH_CHECK]?.[id],
      isDiamond: false,
    },
    {
      title: settings.personalCloudBackup,
      description: inheritancePlanning.personalCloudDescp,
      icon: <CloudIcon width={16} height={12} />,
      onRightPress: () => navigation.navigate('ChoosePlan'),
      rightIcon: <UpgradeIcon width={64} height={20} />,
      onPress: () => navigation.navigate('CloudBackup'),
      isDiamond: true,
    },
  ];

  const General = [
    {
      title: settings.DarkMode,
      description: settings.DarkModeSubTitle,
      icon: <DarkModeIcon width={14} height={14} />,
      onPress: () => changeThemeMode(),
      rightIcon: (
        <Switch
          onValueChange={() => changeThemeMode()}
          value={colorMode === 'dark'}
          testID="switch_darkmode"
        />
      ),
      onRightPress: () => changeThemeMode(),
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
      onPress: () => navigation.navigate('DeleteKeys'),
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
      rightIcon: <UpgradeIcon width={64} height={20} />,
      onRightPress: () => navigation.navigate('ChoosePlan'),

      onPress: () => navigation.navigate('CanaryWallets'),
      isDiamond: true,
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

  return {
    BackAndRecovery,
    General,
    keysAndwallet,
    Tips,
    appSetting,
    inheritanceDocument,
    confirmPass,
  };
};
