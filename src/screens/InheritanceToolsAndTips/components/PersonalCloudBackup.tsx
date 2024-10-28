import React, { useContext } from 'react';
import { Box, ScrollView, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
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
  return (
    <ScreenWrapper barStyle="dark-content" backgroundcolor={`${colorMode}.pantoneGreen`}>
      <InheritanceHeader />
      <ScrollView>
        <Text style={styles.heading} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.personalCloudTitle}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.personalCloudParagph1}
        </Text>
        <Text style={styles.commonTextStyle} color={`${colorMode}.modalGreenContent`}>
          {inheritancePlanning.personalCloudParagph2}
        </Text>
        <Box style={styles.circleStyle}>
          <PersonalCloudBackupIcon />
        </Box>
        <Box mt={5} alignItems={'center'}>
          <DashedButton
            description={inheritancePlanning.manageCloudBackupSubTitle}
            callback={() => navigation.navigate('CloudBackup')}
            name={inheritancePlanning.manageCloudBackupTitle}
            icon={<Cloud />}
          />
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
  },
  commonTextStyle: {
    marginTop: hp(40),
  },
  addContainer: {
    marginTop: hp(40),
  },
  circleStyle: {
    alignItems: 'center',
    marginTop: hp(20),
  },
});

export default PersonalCloudBackup;
