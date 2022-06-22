import React, { useState, useEffect, useContext } from 'react';
import { Box, Text, ScrollView, StatusBar, useColorMode, Pressable } from 'native-base';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';

import BackIcon from 'src/assets/icons/back.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';

const InheritanceSetup = ({ navigation }) => {

  const { translations } = useContext(LocalizationContext);
  const inheritence = translations['inheritence'];

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <ScrollView>
      <Box mx={10} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box mx={3}>
        <Text color={'light.headerText'} fontSize={RFValue(16)} fontFamily={'heading'} pl={10}>
          {inheritence.SetupInheritance}
        </Text>
      </Box>
      <Box m={5}>
      <Box bg={'light.lightYellow'} flexDirection={'row'} p={15} borderRadius={10}>
        <View style={{
       alignItems:'center',
       justifyContent:'center',
       width:30,
       height:30,
       backgroundColor:'#E3E3E3',
       borderRadius:30,
       marginRight: 20,
       marginTop: 15
     }}>
            <Text fontWeight={'extrabold'}> 1 </Text>
        </View>
          <View style = {{flexDirection: 'column'}}>
          <Text color={'light.headerText'} fontSize={RFValue(13)} fontFamily={'heading'}>
          {inheritence.SetupInheritance}
          </Text>
          <Text color={'light.GreyText'} fontSize={RFValue(12)} marginRight={10} fontFamily={'body'}>
              {inheritence.UpgradetoElitetier}
            </Text>
          </View>
        </Box>
      </Box>
      <Box m={5}>
      <Box bg={'light.lightYellow'} flexDirection={'row'} p={15} borderRadius={10}>
        <View style={{
       alignItems:'center',
       justifyContent:'center',
       width:30,
       height:30,
       backgroundColor:'#E3E3E3',
       borderRadius:30,
       marginRight: 20,
       marginTop: 35
     }}>
            <Text fontWeight={'extrabold'}> 2 </Text>
        </View>
          <View style = {{flexDirection: 'column'}}>
          <Text color={'light.headerText'} fontSize={RFValue(13)} fontFamily={'heading'}>
           {inheritence.ActivateInheritance}
          </Text>
          <Text color={'light.GreyText'} fontSize={RFValue(12)} marginRight={10} fontFamily={'body'}>
             {inheritence.Downloadandsafelykeepinheritencedocuments}
            </Text>
          </View>
        </Box>
      </Box>
      <Box m={5}>
      <Box bg={'light.lightYellow'} flexDirection={'row'} p={15} borderRadius={10}>
        <View style={{
       alignItems:'center',
       justifyContent:'center',
       width:30,
       height:30,
       backgroundColor:'#E3E3E3',
       borderRadius:30,
       marginRight: 20,
       marginTop: 25
     }}>
            <Text fontWeight={'extrabold'}> 3 </Text>
        </View>
          <View style = {{flexDirection: 'column'}}>
          <Text color={'light.headerText'} fontSize={RFValue(13)} fontFamily={'heading'}>
           {inheritence.Setupfalserecoveryalert}
          </Text>
          <Text color={'light.GreyText'} fontSize={RFValue(12)} marginRight={10} fontFamily={'body'}>
              {inheritence.tryingtorecoveryourwallet}
            </Text>
          </View>
        </Box>
      </Box>
      <Box m={5}>
      <Box bg={'light.lightYellow'} flexDirection={'row'} p={15} borderRadius={10}>
        <View style={{
       alignItems:'center',
       justifyContent:'center',
       width:30,
       height:30,
       backgroundColor:'#E3E3E3',
       borderRadius:30,
       marginRight: 20,
       marginTop: 25
     }}>
            <Text fontWeight={'extrabold'}> 4 </Text>
        </View>
          <View style = {{flexDirection: 'column'}}>
          <Text color={'light.headerText'} fontSize={RFValue(13)} fontFamily={'heading'}>
           {inheritence.IndependentRecovery}
          </Text>
          <Text color={'light.GreyText'} fontSize={RFValue(12)} marginRight={10} fontFamily={'body'}>
              {inheritence.UnderstandhowyoucanrecoveryourVault}
            </Text>
          </View>
        </Box>
      </Box>
      <Box m={5}>
      <Box bg={'light.lightYellow'} flexDirection={'row'} p={15} borderRadius={10}>
        <View style={{
       alignItems:'center',
       justifyContent:'center',
       width:30,
       height:30,
       backgroundColor:'#E3E3E3',
       borderRadius:30,
       marginRight: 20,
       marginTop: 15
     }}>
            <Text fontWeight={'extrabold'}> 5 </Text>
        </View>
          <View style = {{flexDirection: 'column'}}>
          <Text color={'light.headerText'} fontSize={RFValue(13)} fontFamily={'heading'}>
           {inheritence.Practicehealthcheck}
          </Text>
          <Text color={'light.GreyText'} fontSize={RFValue(12)} marginRight={10} fontFamily={'body'}>
              {inheritence.Makessureyousignersareaccessible}
            </Text>
          </View>
        </Box>
      </Box>
      </ScrollView>
    </SafeAreaView>
  );
};
export default InheritanceSetup;
