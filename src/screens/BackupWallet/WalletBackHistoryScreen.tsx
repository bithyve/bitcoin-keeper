import React, { useState, useEffect, useContext } from 'react';
import { Box, Text, ScrollView, StatusBar, useColorMode, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';

import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import BackupHealthCheckList from 'src/components/CloudBackup/BackupHealthCheckList';
import { LocalizationContext } from 'src/common/content/LocContext';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const WalletBackHistoryScreen = ({ navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box mx={10} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>

      <Box mx={10} mb={5}>
        <Text color={'light.headerText'} fontSize={RFValue(16)} fontFamily={'heading'} pl={10}>
          {BackupWallet.myWalletBackupTitle}
        </Text>
        <Text color={'light.GreyText'} fontSize={RFValue(12)} fontFamily={'body'} pl={10}>
          Lorem ipsum dolor sit amet
        </Text>
      </Box>
      <Box mx={wp(5)}>
        <BackupHealthCheckList />
      </Box>
    </SafeAreaView>
  );
};
export default WalletBackHistoryScreen;
