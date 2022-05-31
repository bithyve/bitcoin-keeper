import React, { useState, useEffect, useContext } from 'react';
import { Box, Text, ScrollView, StatusBar, useColorMode } from 'native-base';
import { SafeAreaView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';

const AppSettings = ({ navigation }: any) => {
  const [isBiometicSupported, setIsBiometicSupported] = useState(false);
  const onChangeLoginMethod = async () => {};
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#2F2F2F',
      }}
    >
      <StatusBar backgroundColor={'#2F2F2F'} barStyle="dark-content" />
      <Box mx={5} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name={'chevron-back-outline'} size={25} color={'#FFF'} />
        </TouchableOpacity>
      </Box>
      <Box flex={1}>
        <ScrollView
          overScrollMode="never"
          bounces={false}
          flex={1}
          pb={20}
          showsVerticalScrollIndicator={false}
          py={3}
        >
          <SettingsSwitchCard
            title={'Use Biometrics'}
            description={'Lorem ipsum dolor sit amet,'}
            my={2}
            bgColor={'#CCC'}
            onSwitchToggle={(value: any) => onChangeLoginMethod()}
            // value={loginMethod === LoginMethod.BIOMETRIC}
            value={true}
          />
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
};
export default AppSettings;
