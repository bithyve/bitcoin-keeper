import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { useQuery } from '@realm/react';
import { CommonActions } from '@react-navigation/native';

import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import AppBackupIcon from 'src/assets/images/app_backup.svg';
import SettingsIcon from 'src/assets/images/settings.svg';
import WalletIcon from 'src/assets/images/manage-wallet-icon.svg';
import CloudIcon from 'src/assets/images/cloud-white.svg';
import Twitter from 'src/assets/images/Twitter.svg';
import TwitterDark from 'src/assets/images/Twitter-white.svg';
import Telegram from 'src/assets/images/Telegram.svg';
import TelegramDark from 'src/assets/images/Telegram-white.svg';

import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import openLink from 'src/utils/OpenLink';
import OptionCard from 'src/components/OptionCard';
import Switch from 'src/components/Switch/Switch';
import { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import ActionCard from 'src/components/ActionCard';
import NavButton from 'src/components/NavButton';
import CurrencyTypeSwitch from 'src/components/Switch/CurrencyTypeSwitch';
import PasscodeVerifyModal from 'src/components/Modal/PasscodeVerify';
import { RealmSchema } from 'src/storage/realm/enum';
import { getJSONFromRealmObject } from 'src/storage/realm/utils';
import KeeperModal from 'src/components/KeeperModal';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import LoginMethod from 'src/models/enums/LoginMethod';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { setThemeMode } from 'src/store/reducers/settings';
import ThemeMode from 'src/models/enums/ThemeMode';
import BackupModalContent from './BackupModal';
import { useIndicatorHook } from 'src/hooks/useIndicatorHook';
import { uaiType } from 'src/models/interfaces/Uai';
import usePlan from 'src/hooks/usePlan';
import { KeeperApp } from 'src/models/interfaces/KeeperApp';

function AppSettings({ navigation, route }) {
  const { satsEnabled }: { loginMethod: LoginMethod; satsEnabled: boolean } = useAppSelector(
    (state) => state.settings
  );
  const { isCloudBsmsBackupRequired } = useAppSelector((state) => state.bhr);

  const { plan } = usePlan();
  const versionHistory = useQuery(RealmSchema.VersionHistory).map(getJSONFromRealmObject);
  const { colorMode, toggleColorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;
  const data = useQuery(RealmSchema.BackupHistory);
  const { primaryMnemonic, id, publicId }: KeeperApp = useQuery(RealmSchema.KeeperApp).map(
    getJSONFromRealmObject
  )[0];
  const isUaiFlow: boolean = route.params?.isUaiFlow ?? false;
  const [confirmPassVisible, setConfirmPassVisible] = useState(isUaiFlow);
  const [backupModalVisible, setBackupModalVisible] = useState(false);

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

  const { typeBasedIndicator } = useIndicatorHook({
    types: [uaiType.RECOVERY_PHRASE_HEALTH_CHECK],
  });

  const actionCardData = [
    {
      cardName: settings.appBackup,
      icon: <AppBackupIcon />,
      callback: () => {
        if (data.length === 0) {
          setConfirmPassVisible(true);
        } else {
          navigation.navigate('WalletBackHistory');
        }
      },
      showDot: typeBasedIndicator?.[uaiType.RECOVERY_PHRASE_HEALTH_CHECK]?.[id],
    },
    {
      cardName: settings.ManageWallets,
      icon: <WalletIcon />,
      callback: () => navigation.navigate('ManageWallets'),
    },
    {
      cardName: settings.personalCloudBackup,
      icon: <CloudIcon />,
      callback: () => navigation.navigate('CloudBackup'),
      showDot: isCloudBsmsBackupRequired,
    },
  ];

  // TODO: add learn more modal
  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={`Keeper ${common.settings}`}
        mediumTitle
        subtitle={settings.settingsSubTitle}
        // To-Do-Learn-More
        icon={
          <CircleIconWrapper
            backgroundColor={`${colorMode}.primaryGreenBackground`}
            icon={<SettingsIcon width={23} height={23} />}
          />
        }
        rightComponent={<CurrencyTypeSwitch />}
        rightComponentPadding={wp(10)}
        rightComponentBottomPadding={hp(5)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.appSettingsContainer}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box style={styles.actionContainer}>
            {actionCardData.map((card) => (
              <ActionCard
                cardName={card.cardName}
                icon={card.icon}
                callback={card.callback}
                key={card.cardName}
                customStyle={{ justifyContent: 'flex-end' }}
                showDot={card.showDot}
              />
            ))}
          </Box>
        </ScrollView>
        <OptionCard
          title={settings.DarkMode}
          description={settings.DarkModeSubTitle}
          callback={() => changeThemeMode()}
          Icon={
            <Switch
              onValueChange={() => changeThemeMode()}
              value={colorMode === 'dark'}
              testID="switch_darkmode"
            />
          }
        />
        <OptionCard
          title={settings.GeneralPreferences}
          description={settings.CurrencyDefaultsSubtitle}
          callback={() => navigation.navigate('ChangeLanguage')}
        />
        <OptionCard
          title={settings.SecurityAndLogin}
          description={settings.SecurityAndLoginSubtitle}
          callback={() => navigation.navigate('PrivacyAndDisplay')}
        />
        <OptionCard
          title={settings.nodeSettings}
          description={settings.nodeSettingsSubtitle}
          callback={() => navigation.navigate('NodeSettings')}
        />
        <OptionCard
          title={settings.torSettingTitle}
          description={settings.torSettingSubTitle}
          callback={() => navigation.navigate('TorSettings')}
        />
        <OptionCard
          title={settings.VersionHistory}
          description={settings.VersionHistorySubTitle}
          callback={() => navigation.navigate('AppVersionHistory')}
        />
      </ScrollView>
      <Box backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.bottomNav}>
          <NavButton
            icon={colorMode === 'dark' ? <TelegramDark /> : <Telegram />}
            heading="Keeper Telegram"
            link="https://telegram.me/bitcoinkeeper"
          />
          <NavButton
            icon={colorMode === 'dark' ? <TwitterDark /> : <Twitter />}
            heading="Keeper X"
            link="https://twitter.com/bitcoinKeeper_"
          />
        </Box>
        <Box style={styles.bottomLinkWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
          <Pressable
            onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}/terms-of-service/`)}
            testID="btn_termsCondition"
          >
            <Text
              style={styles.bottomLinkText}
              color={`${colorMode}.textColor2`}
              testID="text_termsCondition"
            >
              {common.TermsConditions}
            </Text>
          </Pressable>
          <Text color={`${colorMode}.textColor2`}>|</Text>
          <Pressable
            onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}/privacy-policy/`)}
            testID="btn_privacyPolicy"
          >
            <Text
              style={styles.bottomLinkText}
              color={`${colorMode}.textColor2`}
              testID="text_privacyPolicy"
            >
              {common.PrivacyPolicy}
            </Text>
          </Pressable>
        </Box>
      </Box>
      <KeeperModal
        visible={confirmPassVisible}
        closeOnOverlayClick={false}
        close={() => setConfirmPassVisible(false)}
        title="Confirm Passcode"
        subTitleWidth={wp(240)}
        subTitle="To backup app Recovery Key"
        modalBackground={`${colorMode}.modalWhiteBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.primaryText`}
        Content={() => (
          <PasscodeVerifyModal
            useBiometrics
            close={() => {
              setConfirmPassVisible(false);
            }}
            onSuccess={() => {
              setConfirmPassVisible(false);
              setBackupModalVisible(true);
            }}
          />
        )}
      />
      <KeeperModal
        visible={backupModalVisible}
        close={() => setBackupModalVisible(false)}
        title={settings.RKBackupTitle}
        subTitle={settings.RKBackupSubTitle}
        subTitleWidth={wp(300)}
        showCloseIcon={false}
        dismissible
        closeOnOverlayClick
        modalBackground={`${colorMode}.primaryBackground`}
        subTitleColor={`${colorMode}.secondaryText`}
        textColor={`${colorMode}.modalGreenTitle`}
        secondaryButtonText={common.cancel}
        secondaryCallback={() => setBackupModalVisible(false)}
        secButtonTextColor={`${colorMode}.greenText`}
        buttonText={common.backupNow}
        buttonCallback={() => {
          setBackupModalVisible(false);
          navigation.dispatch(
            CommonActions.navigate('ExportSeed', {
              seed: primaryMnemonic,
              next: true,
            })
          );
        }}
        Content={BackupModalContent}
      />
    </ScreenWrapper>
  );
}
const styles = StyleSheet.create({
  appBackupWrapper: {
    borderRadius: 10,
    height: hp(116),
    padding: wp(10),
    width: '100%',
    flexDirection: 'row',
    marginBottom: 10,
  },
  appBackupIconWrapper: {
    width: '20%',
    position: 'relative',
  },
  infoWrapper: {
    width: '80%',
  },
  notificationIndicator: {
    height: 10,
    width: 10,
    borderRadius: 10,
    borderWidth: 0.3,
    position: 'absolute',
    right: 18,
    zIndex: 999,
  },
  appBackupTitle: {
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 1.12,
  },
  appBackupSubTitle: {
    fontWeight: '400',
    fontSize: 12,
    letterSpacing: 0.6,
    width: '100%',
  },
  currentTypeSwitchWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },

  socialMediaLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  telTweetLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    height: hp(45),
    width: wp(166),
    borderRadius: 8,
    marginBottom: hp(8),
    alignItems: 'center',
  },
  telTweetLinkTitle: {
    fontWeight: '400',
    fontSize: 13,
    letterSpacing: 0.79,
  },
  telTweetLinkWrapper2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(3),
  },
  linkIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  bottomLinkText: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  customeStyle: {
    justifyContent: 'flex-end',
    width: wp(110),
  },
  appSettingsContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
});
export default AppSettings;
