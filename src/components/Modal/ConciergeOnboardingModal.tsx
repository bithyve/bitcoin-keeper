import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/check';
import { hideOnboarding } from 'src/store/reducers/concierge';
import Buttons from '../Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import QueryIllustrationLight from 'src/assets/images/concierge-query-illustration-light.svg';
import QueryIllustrationDark from 'src/assets/images/concierge-query-illustration-dark.svg';
import BackupIllustrationLight from 'src/assets/images/concierge-backup-illustration-light.svg';
import BackupIllustrationDark from 'src/assets/images/concierge-backup-illustration-dark.svg';
import AnalyticsIllustrationLight from 'src/assets/images/concierge-analytics-illustration-light.svg';
import AnalyticsIllustrationDark from 'src/assets/images/concierge-analytics-illustration-dark.svg';
import { setDontShowConceirgeOnboarding } from 'src/store/reducers/storage';

const Check = ({ checked, onPress, label }) => {
  const { colorMode } = useColorMode();
  return (
    <TouchableOpacity style={styles.checkContainer} onPress={onPress} activeOpacity={0.6}>
      <Box height={5} width={5}>
        {checked ? (
          <Checked default={false} />
        ) : (
          <Box style={styles.circle} borderColor={`${colorMode}.whiteGreyBorder`} />
        )}
      </Box>
      <Text color={`${colorMode}.modalGreenContent`} style={styles.checkContent}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const PageContent = ({
  isDarkMode,
  colorMode,
  contentText,
  illustrationLight,
  illustrationDark,
  additionalContent,
}) => {
  const NumberedList = ({ items }) => {
    return (
      <Box style={styles.listContainer}>
        {items.map((item, index) => (
          <Box key={index} style={styles.listItem}>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.number}>
              {index + 1}.
            </Text>
            <Text color={`${colorMode}.modalGreenContent`} style={styles.itemText}>
              {item}
            </Text>
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      {additionalContent && <NumberedList items={additionalContent} />}
      <Box style={styles.illustrationContainer}>
        {isDarkMode ? illustrationDark : illustrationLight}
      </Box>
      <Text color={`${colorMode}.modalGreenContent`} style={styles.contentText}>
        {contentText}
      </Text>
    </Box>
  );
};

function ConciergeOnboardingModal({ visible }) {
  const dispatch = useDispatch();
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common, concierge } = translations;
  const [pageNo, setPageNo] = useState(1);
  const [agree, setAgree] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  const isDarkMode = colorMode === 'dark';

  const pageData = [
    {
      title: concierge.welcomeToConcierge,
      subTitle: concierge.getAnsweredWithConcierge,
      contentText: concierge.upgradeForMoreFeatures,
      illustrationLight: <QueryIllustrationLight />,
      illustrationDark: <QueryIllustrationDark />,
      buttonText: common.next,
      nextPage: 2,
    },
    {
      title: concierge.cautionsAndEncouragements,
      subTitle: concierge.backupRegularly,
      contentText: concierge.ensureBackupsAreUpdated,
      illustrationLight: <BackupIllustrationLight />,
      illustrationDark: <BackupIllustrationDark />,
      buttonText: common.next,
      nextPage: 3,
    },
    {
      title: concierge.shareAnalytics,
      subTitle: concierge.ensureBackupsAreUpdated,
      contentText: concierge.analyticsNote,
      additionalContent: [
        concierge.tierInfo,
        concierge.phoneAndOS,
        concierge.appVersionHistory,
        concierge.screenContext,
        concierge.torAndNetworkStatus,
        concierge.sentryItems,
      ],
      illustrationLight: <AnalyticsIllustrationLight />,
      illustrationDark: <AnalyticsIllustrationDark />,
      buttonText: common.continue,
      nextPage: 1,
    },
  ];

  const currentPage = pageData[pageNo - 1];

  const handleAgreeChange = () => setAgree((prev) => !prev);
  const handleDontShowChange = () => setDontShow((prev) => !prev);
  const handleCloseModal = () => {
    setPageNo(1);
    dispatch(hideOnboarding());
  };
  const handleContinue = () => {
    setPageNo(1);
    dispatch(hideOnboarding());
    dontShow && dispatch(setDontShowConceirgeOnboarding());
  };

  return (
    <KeeperModal
      visible={visible}
      close={handleCloseModal}
      title={currentPage.title}
      subTitle={currentPage.subTitle}
      subTitleWidth={wp(310)}
      modalBackground={`${colorMode}.modalGreenBackground`}
      textColor={`${colorMode}.modalGreenContent`}
      Content={() => (
        <Box>
          <PageContent
            isDarkMode={isDarkMode}
            colorMode={colorMode}
            contentText={currentPage.contentText}
            illustrationLight={currentPage.illustrationLight}
            illustrationDark={currentPage.illustrationDark}
            additionalContent={currentPage.additionalContent}
          />
          {pageNo === 3 && (
            <Box style={styles.checkContainerWrapper}>
              <Check
                checked={dontShow}
                onPress={handleDontShowChange}
                label={concierge.dontShowAgain}
              />
              <Check
                checked={agree}
                onPress={handleAgreeChange}
                label={concierge.iAgreeForTheseToBeShared}
              />
            </Box>
          )}
          <Box style={styles.buttonContainer}>
            <Buttons
              primaryText={currentPage.buttonText}
              primaryCallback={
                pageNo === 3 ? handleContinue : () => setPageNo(currentPage.nextPage)
              }
              primaryDisable={pageNo === 3 && !agree}
              primaryBackgroundColor={`${colorMode}.whiteButtonBackground`}
              primaryTextColor={`${colorMode}.whiteButtonText`}
              fullWidth
            />
          </Box>
        </Box>
      )}
      showCloseIcon={false}
    />
  );
}

const styles = StyleSheet.create({
  contentText: {
    fontSize: 14,
    padding: 1,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(35),
  },
  checkContainerWrapper: {
    marginTop: hp(15),
    gap: hp(5),
  },
  checkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  checkContent: {
    fontSize: 14,
    padding: 1,
    marginLeft: wp(14),
  },
  listContainer: {
    marginTop: hp(-20),
    marginBottom: hp(20),
  },
  listItem: {
    flexDirection: 'row',
    marginVertical: hp(2.5),
  },
  number: {
    fontSize: 14,
    marginRight: wp(10),
  },
  itemText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: hp(40),
  },
});

export default ConciergeOnboardingModal;
