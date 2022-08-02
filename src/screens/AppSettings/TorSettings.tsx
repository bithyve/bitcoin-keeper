import React, { useState, useEffect } from 'react'
import { SafeAreaView, TouchableOpacity } from 'react-native'
import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { Box, Text, ScrollView, StatusBar, useColorMode, Pressable } from 'native-base';
import SettingsSwitchCard from 'src/components/SettingComponent/SettingsSwitchCard';
import RestClient, { TorStatus } from 'src/core/services/rest/RestClient';
import useToastMessage from 'src/hooks/useToastMessage';
import { useAppDispatch } from 'src/store/hooks';
import { setTorEnabled } from 'src/store/reducers/settings';


const TorSettings = ({ navigation }) => {
  const { colorMode } = useColorMode();
  const [torStatus, settorStatus] = useState<TorStatus>(RestClient.getTorStatus())
  const { showToast } = useToastMessage();
  const dispatch = useAppDispatch()

  const onChangeTorStatus = (status: TorStatus) => {
    settorStatus(status)
  }

  useEffect(() => {
    RestClient.subToTorStatus(onChangeTorStatus)
    return () => {
      RestClient.unsubscribe(onChangeTorStatus)
    }
  }, [])

  const toggleTor = () => {
    if (torStatus === TorStatus.CONNECTED) {
      RestClient.setUseTor(false)
      dispatch(setTorEnabled(false))
    } else {
      RestClient.setUseTor(true)
      showToast('Connecting to Tor');
      dispatch(setTorEnabled(true))
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}>
      <Box mx={10} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>

      <Box mx={5} mb={5}>
        <Text color={'light.headerText'} fontSize={RFValue(16)} fontFamily={'heading'} pl={10}>
          Tor Settings
        </Text>
        <Text color={'light.GreyText'} fontSize={RFValue(12)} fontFamily={'body'} pl={10}>
          Tor daemon
        </Text>
      </Box>
      <Text color={'light.GreyText'} fontSize={RFValue(12)} fontFamily={'body'} pl={10}>
        {`Status: ${torStatus}`}
      </Text>
      <SettingsSwitchCard
        title={'Enabled'}
        description={'Enabled tor daemon'}
        my={2}
        bgColor={`${colorMode}.backgroundColor2`}
        onSwitchToggle={toggleTor}
        value={torStatus === TorStatus.CONNECTED}
      />

    </SafeAreaView>
  )
}

export default TorSettings

