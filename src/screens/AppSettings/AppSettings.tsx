import React, { useContext, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { Box, Pressable, ScrollView, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import BackupIcon from 'src/assets/images/backup.svg';
import Twitter from 'src/assets/images/Twitter.svg';
import Telegram from 'src/assets/images/Telegram.svg';
import CloseIcon from 'src/assets/images/cross.svg'
import LinkIcon from 'src/assets/images/link.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import ScreenWrapper from 'src/components/ScreenWrapper';
import openLink from 'src/utils/OpenLink';
import { RealmSchema } from 'src/storage/realm/enum';
import { BackupAction, BackupHistory } from 'src/models/enums/BHR';
import moment from 'moment';
import { getBackupDuration } from 'src/utils/utilities';
import { useAppSelector } from 'src/store/hooks';
import { useQuery } from '@realm/react';
import OptionCard from 'src/components/OptionCard';
import Switch from 'src/components/Switch/Switch';
import { KEEPER_KNOWLEDGEBASE, KEEPER_WEBSITE_BASE_URL } from 'src/core/config';

function AppSettings({ navigation }) {
  const { colorMode } = useColorMode();
  const { backupMethod } = useAppSelector((state) => state.bhr);
  const data: BackupHistory = useQuery(RealmSchema.BackupHistory);


  // const dispatch = useAppDispatch();

  // const [sensorType, setSensorType] = useState('Biometrics');
  const { translations, formatString } = useContext(LocalizationContext);
  const { common } = translations;
  const { settings } = translations;
  const backupWalletStrings = translations.BackupWallet;

  const backupHistory = useMemo(() => data.sorted('date', true), [data]);
  const backupSubTitle = useMemo(() => {
    if (backupMethod === null) {
      return 'Backup your Recovery Phrase';
    }
    if (backupHistory[0].title === BackupAction.SEED_BACKUP_CONFIRMED) {
      const lastBackupDate = moment(backupHistory[0].date);
      const today = moment(moment().unix());
      const remainingDays = getBackupDuration() - lastBackupDate.diff(today, 'seconds');
      if (remainingDays > 0) {
        return `Recovery Health check due in ${Math.floor(remainingDays / 86400)} days`;
      }
      return 'Recovery Health check is due';
    }
    return backupWalletStrings[backupHistory[0].title];
  }, [backupHistory, backupMethod]);




  function Option({ title, subTitle, onPress, Icon }) {
    return (
      <Pressable
        flexDirection="row"
        alignItems="center"
        onPress={onPress}
        backgroundColor={`${colorMode}.seashellWhite`}
        style={styles.appBackupWrapper}
        testID={`btn_${title.replace(/ /g, '_')}}`}
      >
        {Icon && (
          <Box style={styles.appBackupIconWrapper}>
            {/* { Notification indicator } */}
            {backupMethod === null && (
              <Box
                backgroundColor={`${colorMode}.indicator`}
                borderColor={`${colorMode}.white`}
                style={styles.notificationIndicator}
              />
            )}
            <BackupIcon />
          </Box>
        )}
        <Box style={styles.infoWrapper}>
          <Text color={`${colorMode}.primaryText`} style={styles.appBackupTitle}>
            {title}
          </Text>
          <Text color={`${colorMode}.GreyText`} style={styles.appBackupSubTitle}>
            {subTitle}
          </Text>
        </Box>
      </Pressable>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <CloseIcon />
      </TouchableOpacity>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ alignItems: 'center', paddingTop: 20 }}
      >
        <Option
          title={settings.appBackup}
          subTitle={backupSubTitle}
          onPress={() => {
            navigation.navigate('BackupWallet');
          }}
          Icon
        />

        <OptionCard
          title={settings.SatsMode}
          description={settings.SatsModeSubTitle}
          callback={() => console.log('SatsMode')}
          Icon={
            <Switch
              onValueChange={(value) => console.log('SatsMode')}
              value={colorMode === 'dark'}
              testID="switch_satsmode"
            />
          }
        />
        <OptionCard
          title={settings.PrivacyDisplay}
          description={settings.PrivacyDisplaySubTitle}
          callback={() => navigation.navigate('PrivacyAndDisplay')}
        />
        <OptionCard
          title={settings.networkSettings}
          description={settings.networkSettingConfigSubTitle}
          callback={() => navigation.navigate('NetworkSetting')}
        />

        <OptionCard
          title={settings.VersionHistory}
          description={settings.VersionHistorySubTitle}
          callback={() => navigation.navigate('AppVersionHistory')}
        />
        <OptionCard
          title={settings.LanguageCountry}
          description={settings.LanguageCountrySubTitle}
          callback={() => navigation.navigate('ChangeLanguage')}
        />
        <OptionCard
          title={settings.ManageWallets}
          description={settings.ManageWalletsSub}
          callback={() => navigation.navigate('ManageWallets')}
        />
      </ScrollView>
      <Box backgroundColor={`${colorMode}.primaryBackground`}>
        <Box style={styles.socialMediaLinkWrapper}>
          <Pressable onPress={() => openLink('https://telegram.me/bitcoinkeeper')}>
            <Box
              style={styles.telTweetLinkWrapper}
              backgroundColor={`${colorMode}.primaryBackground`}
              testID="view_ KeeperTelegram"
            >
              <Box style={styles.telTweetLinkWrapper2}>
                <Telegram />
                <Box style={{ marginLeft: wp(10) }}>
                  <Text
                    color={`${colorMode}.textColor2`}
                    style={styles.telTweetLinkTitle}
                    testID="text_ KeeperTelegram"
                  >
                    {settings.keeperTelegram}
                  </Text>
                </Box>
              </Box>
              <Box style={styles.linkIconWrapper}>
                <LinkIcon />
              </Box>
            </Box>
          </Pressable>
          <Pressable
            onPress={() => openLink('https://twitter.com/bitcoinKeeper_')}
            testID="btn_keeperTwitter"
          >
            <Box
              style={styles.telTweetLinkWrapper}
              backgroundColor={`${colorMode}.primaryBackground`}
              testID="view_keeperTwitter"
            >
              <Box style={styles.telTweetLinkWrapper2}>
                <Twitter />
                <Box style={{ marginLeft: wp(10) }}>
                  <Text
                    color={`${colorMode}.textColor2`}
                    style={styles.telTweetLinkTitle}
                    testID="text_keeperTwitter"
                  >
                    {settings.keeperTwitter}
                  </Text>
                </Box>
              </Box>
              <Box style={styles.linkIconWrapper}>
                <LinkIcon />
              </Box>
            </Box>
          </Pressable>
        </Box>
        <Box style={styles.bottomLinkWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
          <Pressable
            onPress={() => openLink(`${KEEPER_KNOWLEDGEBASE}knowledge-base/`)}
            testID="btn_FAQ"
          >
            <Text style={styles.bottomLinkText} color={`${colorMode}.textColor2`}>
              {common.FAQs}
            </Text>
          </Pressable>
          <Text color={`${colorMode}.textColor2`}>|</Text>
          <Pressable
            onPress={() => openLink(`${KEEPER_KNOWLEDGEBASE}terms-of-service/`)}
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
            onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}privacy-policy/`)}
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
    </ScreenWrapper >
  );
}
const styles = StyleSheet.create({
  appBackupWrapper: {
    borderRadius: 10,
    height: hp(116),
    padding: wp(10),
    width: '100%',
    flexDirection: 'row',
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
    right: wp(10),
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
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 8,
  },
  bottomLinkText: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.79,
  },
});
export default AppSettings;
