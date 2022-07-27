import React, { useContext, useState } from 'react';
import { Box, Text } from 'native-base';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import Check from 'src/assets/images/check.svg';

const CreateCloudBackup = (props) => {
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];

  const [currentPosition, setCurrentPosition] = useState(0);
  const [items, setItems] = useState([
    {
      id: '1',
    },
    {
      id: '2',
    },
  ]);
  return (
    <Box bg={'#F7F2EC'} borderRadius={10}>
      {/* <TouchableOpacity onPress={() => props.closeBottomSheet()}>
        <Box
          m={5}
          bg={'#E3BE96'}
          borderRadius={32}
          h={8}
          w={8}
          alignItems={'center'}
          justifyContent={'center'}
          alignSelf={'flex-end'}
        >
          <Text fontSize={18} color={'#FFF'}>
            X
          </Text>
        </Box>
      </TouchableOpacity> */}
      <Box p={10}>
        <Text fontSize={RFValue(19)} color={'light.lightBlack'} fontFamily={'heading'}>
          {BackupWallet.createCloudBackTitle}
        </Text>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {BackupWallet.createCloudBackSubTitle}
        </Text>
      </Box>
      <Box flexDirection={'row'} px={10} py={5} alignItems={'center'}>
        <Check />
        <Box marginLeft={5}>
          <Text color={'#00715B'} fontSize={RFValue(16)}>
            Lorem ipsum dolor
          </Text>
        </Box>
      </Box>
      <Box flexDirection={'row'} px={10} py={5} alignItems={'center'}>
        <Check />
        <Box marginLeft={5}>
          <Text color={'#00715B'} fontSize={RFValue(16)}>
            Lorem ipsum dolor
          </Text>
        </Box>
      </Box>
      <Box flexDirection={'row'} px={10} py={5} alignItems={'center'}>
        <Check />
        <Box marginLeft={5}>
          <Text color={'#00715B'} fontSize={RFValue(16)}>
            Lorem ipsum dolor
          </Text>
        </Box>
      </Box>
      <Box p={10}>
        <Text fontSize={RFValue(13)} color={'light.lightBlack'} fontFamily={'body'}>
          {BackupWallet.createCloudBackSubTitle}
        </Text>
      </Box>
      {/* <Box p={10} flexDirection={'row'}>
        {items.map((item, index) => {
          return (
            <Box
              key={index}
              style={currentPosition == index ? styles.selectedDot : styles.unSelectedDot}
            />
          );
        })}
      </Box> */}
    </Box>
  );
};
export default CreateCloudBackup;
const styles = StyleSheet.create({
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#676767',
    marginEnd: 5,
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#A7A7A7',
    marginEnd: 5,
  },
});
