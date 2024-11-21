import { StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { useDispatch } from 'react-redux';
import { Box, useColorMode } from 'native-base';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import Checked from 'src/assets/images/check';
import { hideOnboarding } from 'src/store/reducers/concierge';
import { openConcierge } from 'src/store/sagaActions/concierge';
import Buttons from '../Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import QueryIllustrationLight from 'src/assets/images/concierge-query-illustration-light.svg';
import QueryIllustrationDark from 'src/assets/images/concierge-query-illustration-dark.svg';
import BackupIllustrationLight from 'src/assets/images/concierge-backup-illustration-light.svg';
import BackupIllustrationDark from 'src/assets/images/concierge-backup-illustration-dark.svg';
import AnalyticsIllustrationLight from 'src/assets/images/concierge-analytics-illustration-light.svg';
import AnalyticsIllustrationDark from 'src/assets/images/concierge-analytics-illustration-dark.svg';

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
  const { common } = translations;
  const [pageNo, setPageNo] = useState(1);
  const [agree, setAgree] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  const isDarkMode = colorMode === 'dark';

  const pageData = [
    {
      title: 'Welcome to Keeper Concierge \n(Beta)',
      subTitle: 'Get all your questions answered with Keeper Concierge.',
      contentText:
        'Upgrade to Hodler to chat with a support executive and Diamond Hands to schedule.',
      illustrationLight: <QueryIllustrationLight />,
      illustrationDark: <QueryIllustrationDark />,
      buttonText: common.next,
      nextPage: 2,
    },
    {
      title: 'Cautions and Encouragements',
      subTitle:
        'Test your multi-key setups and backups once every few months. Regularly update your signing devices’ firmware/softwares.',
      contentText:
        'Please ensure that your backups are updated if you change one or more of the signers.',
      illustrationLight: <BackupIllustrationLight />,
      illustrationDark: <BackupIllustrationDark />,
      buttonText: common.next,
      nextPage: 3,
    },
    {
      title: 'Share data for analytics:',
      subTitle: `To help you troubleshoot better and faster, \nKeeper would like to collect the following data:`,
      contentText: `You can choose to decline now but maybe asked for the data again if one or more parameters seem to be the bottleneck in troubleshooting.`,
      additionalContent: [
        'Tier Info',
        'Phone and OS',
        'App version history',
        'Screen context (where the user is coming from)',
        'Tor and network (WiFi/ Mobile) status',
        'Sentry items - error codes',
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
    dispatch(openConcierge(dontShow));
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
              <Check checked={dontShow} onPress={handleDontShowChange} label="Don’t show again" />
              <Check
                checked={agree}
                onPress={handleAgreeChange}
                label="I agree for these to be shared"
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
