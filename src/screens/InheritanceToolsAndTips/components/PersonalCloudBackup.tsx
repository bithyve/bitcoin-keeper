import React, { useContext, useMemo } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { Platform, StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp } from 'src/constants/responsive';
import InheritanceHeader from '../InheritanceHeader';
import DashedButton from 'src/components/DashedButton';
import PersonalCloudBackupIcon from 'src/assets/images/personal-cloud-backup.svg';
import Cloud from 'src/assets/images/cloud.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { useNavigation } from '@react-navigation/native';

function PersonalCloudBackup({}) {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { inheritancePlanning } = translations;
  const navigation = useNavigation();
  const cloudName = useMemo(() => {
    return Platform.select({ android: 'Google Drive', ios: 'iCloud' });
  }, []);
  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading}>{inheritancePlanning.personalCloudTitle}</Text>
        <Text style={styles.description}>
          {`${inheritancePlanning.personalCloudDescpMain} ${cloudName}`}
        </Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.personalCloudParagph1}</Text>
        <Text style={styles.commonTextStyle}>{inheritancePlanning.personalCloudParagph2}</Text>
        <Box style={styles.circleStyle}>
          <PersonalCloudBackupIcon />
        </Box>
        <Box mt={5} alignItems={'center'}>
          <DashedButton
            description="Ensure only you have access"
            callback={() => navigation.navigate('AppSettings')}
            name="Manage Cloud Backup"
            icon={<Cloud />}
          />
        </Box>

        <Box style={[styles.leftTextStyle]}>
          <Text bold color={`${colorMode}.buttonText`}>
            Note:
          </Text>
          <Text color={`${colorMode}.buttonText`}>{inheritancePlanning.personalCloudNotes}</Text>
        </Box>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 25,
    marginTop: 20,
  },
  walletType: {
    justifyContent: 'space-between',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
  },
  description: {
    fontSize: 14,
    color: Colors.white,
  },
  commonTextStyle: {
    marginTop: hp(40),
    color: Colors.white,
  },
  addContainer: {
    marginTop: hp(40),
  },
  leftTextStyle: {
    textAlign: 'left',
    marginTop: hp(40),
    color: Colors.white,
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default PersonalCloudBackup;
