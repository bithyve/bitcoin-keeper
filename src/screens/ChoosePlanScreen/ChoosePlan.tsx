import React, { useContext, useState } from 'react';
import { Box, Text, StatusBar } from 'native-base';
import { SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';

import { RFValue } from 'react-native-responsive-fontsize';

import BackIcon from 'src/assets/icons/back.svg';
import ChoosePlanCarousel from 'src/components/Carousel/ChoosePlanCarousel';
import Note from 'src/components/Note/Note';
import DotView from 'src/components/DotView';
import { LocalizationContext } from 'src/common/content/LocContext';

const ChoosePlan = (props) => {
  const { translations } = useContext(LocalizationContext);
  const choosePlan = translations['choosePlan'];
  const [currentPosition, setCurrentPosition] = useState(0);
  const [items, setItems] = useState([
    {
      id: '1',
      title: 'Benefits of Basic tier',
      subTitle: 'A good place to start',
      point1: 'Add multiple wallets',
      point2: 'Encrypted iCloud/ Google Drive backup for wallets',
      point3: 'Add one hardware signer',
      point4: 'Air-gapped Vault (single-sig)',
      point5: 'Community support',
    },
    {
      id: '2',
      title: 'Benefits of Pro tier',
      subTitle: 'Suggested for up to $50,000 in total funds',
      point1: 'All features of Basic tier',
      point2: 'Import wallets',
      point3: 'Add up to 3 hardware signers',
      point4: '2 of 3 multi-sig Vault',
      point5: 'Email support',
    },
    {
      id: '3',
      title: 'Benefits of Elite tier',
      subTitle: 'Suggested for up to $100,000,000 in total funds',
      point1: 'All features of Pro tier',
      point2: 'Add up to 5 hardware wallets',
      point3: '3 of 5 multi-sig Vault',
      point4: 'Inheritance and independent recovery',
      point5: 'Dedicated email support',
    },
  ]);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box mx={7} my={10}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box ml={10} mb={5} flexDirection={'row'} w={'100%'} alignItems={'center'}>
        <Box w={'60%'}>
          <Text fontSize={RFValue(20)} color={'light.textBlack'} fontFamily={'heading'}>
            {choosePlan.choosePlantitle}
          </Text>
          <Text fontSize={RFValue(12)} color={'light.GreyText'} fontFamily={'body'}>
            {choosePlan.choosePlanSubTitle}{' '}
          </Text>
        </Box>
      </Box>
      <ScrollView>
        <ChoosePlanCarousel onChange={(item) => setCurrentPosition(item)} />
        <Box mx={10} my={5}>
          <Text
            fontSize={RFValue(14)}
            color={'light.lightBlack'}
            fontWeight={'bold'}
            fontFamily={'body'}
          >
            {items[currentPosition].title}
          </Text>
          <Text fontSize={RFValue(12)} color={'light.GreyText'} fontFamily={'body'}>
            {items[currentPosition].subTitle}
          </Text>
        </Box>
        <Box mx={12}>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3} fontFamily={'body'}>
              {items[currentPosition].point1}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point2}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point3}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point4}
            </Text>
          </Box>
          <Box flexDirection={'row'} alignItems={'center'}>
            <DotView height={2} width={2} color={'black'} />
            <Text fontSize={RFValue(13)} color={'light.GreyText'} mb={2} ml={3}>
              {items[currentPosition].point5}
            </Text>
          </Box>
        </Box>
        <Box flex={1} justifyContent={'flex-end'}>
          <Note title={'Note'} subtitle={choosePlan.noteSubTitle} />
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};
export default ChoosePlan;
