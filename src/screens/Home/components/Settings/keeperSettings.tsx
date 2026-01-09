import { Box, Pressable, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import Colors from 'src/theme/Colors';
import PlebContainer from './Component/PlebContainer';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import NavButton from 'src/components/NavButton';
import { FlatList, StyleSheet } from 'react-native';
import openLink from 'src/utils/OpenLink';
import config, { KEEPER_WEBSITE_BASE_URL } from 'src/utils/service-utilities/config';
import Text from 'src/components/KeeperText';
import Twitter from 'src/assets/images/Twitter.svg';
import TwitterDark from 'src/assets/images/Twitter-white.svg';
import NosterIcon from 'src/assets/images/noster.svg';
import NosterDarkIcon from 'src/assets/images/noster-white.svg';
import Telegram from 'src/assets/images/Telegram.svg';
import TelegramDark from 'src/assets/images/Telegram-white.svg';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { setShowTipModal } from 'src/store/reducers/settings';
import { useDispatch } from 'react-redux';
import SupportDeveloperIcon from 'src/assets/images/supportDeveloper.svg';
import { screenWidth } from 'react-native-gifted-charts/src/utils';
import TipsIcon from 'src/assets/images/setting_tip.svg';
import InheritanceIcon from 'src/assets/images/setting_inheritance.svg';
import InheritanceIconLight from 'src/assets/images/setting_inheritance_light.svg';
import BackupIcon from 'src/assets/images/setting_backup.svg';
import BackupIconLight from 'src/assets/images/setting_backup_light.svg';
import GearIcon from 'src/assets/images/setting_gear.svg';
import GearIconLight from 'src/assets/images/setting_grear_light.svg';
import Fonts from 'src/constants/Fonts';
import { FAB } from 'src/components/FAB';

const KeeperSettings = () => {
  const { colorMode } = useColorMode();
  const isDarKMode = colorMode === 'dark';
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { settings, common, signer: signerText, inheritancePlanning } = translations;
  const dispatch = useDispatch();

  const cardItems = [
    {
      title: signerText.inheritanceDocuments,
      icon: isDarKMode ? <InheritanceIconLight /> : <InheritanceIcon />,
      onPress: () => navigation.dispatch(CommonActions.navigate('InheritanceDocumentScreen')),
    },
    {
      title: inheritancePlanning.backupRecovery,
      icon: isDarKMode ? <BackupIconLight /> : <BackupIcon />,
      onPress: () => navigation.dispatch(CommonActions.navigate('BackupSettingsScreen')),
    },
    {
      title: settings.General,
      icon: isDarKMode ? <GearIconLight /> : <GearIcon />,
      onPress: () => navigation.dispatch(CommonActions.navigate('GeneralSettingsScreen')),
    },
  ];

  return (
    <>
      <Box style={styles.ctr}>
        <Box>
          <PlebContainer
            title={settings.supportDeveloperTitle}
            description={settings.supportDeveloperSubTitle}
            titleColor={`${colorMode}.whiteSecButtonText`}
            subtitleColor={`${colorMode}.whiteSecButtonText`}
            backgroundColor={Colors.GreenishGrey}
            onPress={() =>
              dispatch(setShowTipModal({ status: true, address: config.ADDRESS.settings }))
            }
            icon={<SupportDeveloperIcon width={30} height={30} />}
            showDot={false}
          />

          <FlatList
            data={cardItems}
            contentContainerStyle={styles.columnGap}
            columnWrapperStyle={styles.column}
            style={styles.cardCtr}
            renderItem={({ item }) => {
              return (
                <Pressable
                  backgroundColor={`${colorMode}.seashellWhite`}
                  borderColor={`${colorMode}.separator`}
                  style={styles.card}
                  onPress={item.onPress}
                  testID={`btn_${item.title}`}
                >
                  <Box style={styles.cardIcon}>{item.icon}</Box>
                  <Text color={`${colorMode}.modalWhiteContent`} style={styles.cardText} medium>
                    {item.title}
                  </Text>
                </Pressable>
              );
            }}
            numColumns={2}
          />
        </Box>
        <Box backgroundColor={`${colorMode}.primaryBackground`}>
          <Box style={styles.bottomNav}>
            <NavButton
              icon={colorMode === 'dark' ? <TelegramDark /> : <Telegram />}
              heading="Telegram"
              link="https://telegram.me/bitcoinkeeper"
            />
            <NavButton
              icon={colorMode === 'dark' ? <TwitterDark /> : <Twitter />}
              heading="Twitter"
              link="https://twitter.com/bitcoinKeeper_"
            />
            <NavButton
              icon={colorMode === 'dark' ? <NosterDarkIcon /> : <NosterIcon />}
              heading="Nostr"
              link="https://primal.net/p/npub1mlzukkwhuhl3y7wd6kw20fz6s99l8d0uqtj4sskhvaaud8rwcuuszt2t6p"
            />
          </Box>

          <Text style={styles.disclaimer} color={`${colorMode}.termsText`} testID="disclaimer">
            {common.disclaimer}
          </Text>

          <Box style={styles.bottomLinkWrapper} backgroundColor={`${colorMode}.primaryBackground`}>
            <Pressable
              onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}/terms-of-service/`)}
              testID="btn_termsCondition"
            >
              <Text
                style={styles.bottomLinkText}
                color={`${colorMode}.termsText`}
                testID="text_termsCondition"
              >
                {common.TermsConditions}
              </Text>
            </Pressable>
            <Text color={`${colorMode}.termsText`}>|</Text>
            <Pressable
              onPress={() => openLink(`${KEEPER_WEBSITE_BASE_URL}/privacy-policy/`)}
              testID="btn_privacyPolicy"
            >
              <Text
                style={styles.bottomLinkText}
                color={`${colorMode}.termsText`}
                testID="text_privacyPolicy"
              >
                {common.PrivacyPolicy}
              </Text>
            </Pressable>
          </Box>
        </Box>
      </Box>
      <Box style={{ paddingRight: wp(11) }}>
        <FAB
          onPress={() => navigation.dispatch(CommonActions.navigate('AppTipsScreen'))}
          icon={<TipsIcon />}
        />
      </Box>
    </>
  );
};

export default KeeperSettings;

const styles = StyleSheet.create({
  ctr: { flex: 1, justifyContent: 'space-between' },
  bottomNav: {
    width: windowWidth * 0.88,
    flexDirection: 'row',
    gap: wp(10),
    justifyContent: 'center',
  },

  bottomLinkWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    marginBottom: hp(20),
  },
  bottomLinkText: {
    fontSize: 13,
    letterSpacing: 0.13,
  },
  disclaimer: {
    maxWidth: '99%',
    fontSize: 11,
    textAlign: 'center',
    marginVertical: hp(10),
  },
  // ----
  columnGap: { gap: 10 },
  column: {
    justifyContent: 'space-between',
  },
  cardCtr: {
    width: windowWidth * 0.89,
    alignSelf: 'center',
  },
  card: {
    width: (screenWidth - 60) / 2,
    paddingHorizontal: wp(13),
    paddingVertical: wp(26),
    alignItems: 'flex-start',
    borderRadius: 10,
    position: 'relative',
    borderWidth: 1,
  },
  cardIcon: {
    height: wp(40),
    width: wp(40),
    borderRadius: 40,
    backgroundColor: 'rgba(47, 79, 79, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 12,
    fontFamily: Fonts.InterMedium,
    width: '100%',
    gap: 2,
    marginTop: hp(12),
  },
});
