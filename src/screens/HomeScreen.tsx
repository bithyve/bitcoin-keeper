import React from 'react';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { View, Text } from 'native-base'
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { ImageBackground,FlatList,TouchableOpacity } from 'react-native';

import StatusBarComponent from 'src/components/StatusBarComponent';
import DevicesComponent from 'src/components/DevicesComponent';
import backgroundImage from '../assets/Images/background.png';
import HomeCard from '../components/HomeCard';
import ScannerIcon from '../assets/Images/svgs/ScannerIcon.svg';
import SettingIcon from '../assets/Images/svgs/SettingIcon.svg';
import MobileIcon from '../assets/Images/svgs/MobileIcon.svg';
import LaptopIcon from '../assets/Images/svgs/LaptopIcon.svg';
import ColdCardIcon from '../assets/Images/svgs/ColdCardIcon.svg';
import IPardIcon from '../assets/Images/svgs/IPadIcon.svg';
import PdfIcon from '../assets/Images/svgs/PdfIcon.svg';
import DiamondIcon from '../assets/Images/svgs/DiamondIcon.svg';

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'Arika’s',
    subtitle: 'iPhone 12',
    Childern: MobileIcon
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Personal ',
    subtitle: 'iMac',
    Childern: LaptopIcon

  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Cold Card ',
    subtitle: 'Wallet',
    Childern: ColdCardIcon

  },
  {
    id: '58694a0f-3da1-471f-bd96-14557671e29d72',
    title: 'Home',
    subtitle: 'iPad',
    Childern: IPardIcon

  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e2679d72',
    title: 'Arika’s',
    subtitle: 'PDF',
    Childern: PdfIcon

  },

];

const DATATWO = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-14557671e29d72',
    title: 'four Item',
  },
  
];

const HomeScreen = () => {

  const renderItem = ( item ) => (
    <DevicesComponent item ={item} />
  );
  const renderItemTwo = ( item ) => (
    <HomeCard title ={item?.title} />
  );

  return (
    <View style={styles.Container} background={'light.lightYellow'}>
      <StatusBarComponent />
      <ImageBackground style={styles.backgroundImage} source={backgroundImage}>
        <View style={styles.headerContainer}>
          <TouchableOpacity>
          <ScannerIcon/>
          </TouchableOpacity>
          <TouchableOpacity>
          <SettingIcon/>
          </TouchableOpacity>
        </View>
        <View style={styles.eliteUserContentContainer}>
          <DiamondIcon/>
          <View style={styles.eliteUserContainer} backgroundColor={'light.brown'}>
          <Text style={styles.eliteUserText} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'300'}>Elite User</Text>
          </View>
        </View>
        <View style={styles.userNameContainer}>
          <Text style={styles.helloText} color={'light.white'} fontFamily={'body'} fontWeight={'200'}>Hello,</Text>
          <Text style={styles.helloText} color={'light.white'} fontFamily={'body'} fontWeight={'300'} fontStyle={'italic'}> Alex</Text>
        </View>
        <Text style={styles.loremText} color={'light.white'} fontFamily={'body'} fontWeight={'100'}>Lorem Ipsum Dolor Amet</Text>
      </ImageBackground>
      <Text style={styles.devicesText} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'200'}>5 Devices</Text>
      <Text style={styles.securingFundsText} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'100'}>used for securing funds</Text>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal={true}
        style={styles.flatlistContainer}
        showsHorizontalScrollIndicator={false}
      />
       <Text style={styles.devicesText} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'200'}>10 Wallets</Text>
      <Text style={styles.securingFundsText} color={'light.lightBlack'} fontFamily={'body'} fontWeight={'100'}>lorem ipsum dolor</Text>
      <FlatList
        data={DATATWO}
        renderItem={renderItemTwo}
        keyExtractor={item => item.id}
        horizontal={true}
        style={styles.cardFlatlistContainer}
        showsHorizontalScrollIndicator={false}
      />
    </View >
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
  },
  headerContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingTop:hp(4),
    paddingHorizontal:wp(2),
  },
  backgroundImage: {
    width: wp('100%'),
    height: hp(35),
    padding: '30@s',
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloText: {
    fontSize: RFValue(24),
    lineHeight: '24@s',
    letterSpacing: '0.7@s',
  },
  loremText: {
    fontSize: RFValue(12),
    lineHeight: '20@s',
    letterSpacing: '0.5@s',
    textAlign:'center',
  },
  devicesText:{
    fontSize: RFValue(20),
    lineHeight: '27@s',
    letterSpacing: '0.5@s',
    marginLeft:wp(10)
  },
  securingFundsText:{
    fontSize: RFValue(12),
    lineHeight: '16@s',
    letterSpacing: '0.5@s',
    marginLeft:wp(10)
  },
  flatlistContainer:{
    flexGrow:0,
    marginBottom:hp(4),
    marginTop:hp(3),
    paddingLeft:wp(8),
  },
  cardFlatlistContainer:{
    paddingLeft:wp(8),
  },
  eliteUserContentContainer:{
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    marginTop:hp(8),
    marginBottom:hp(1.3)
  },
  eliteUserContainer:{
    paddingHorizontal:wp(1.5),
    borderRadius:'20@s',
    height:hp(1.7),
    marginLeft:wp(1)
  },
  eliteUserText:{
    fontSize: RFValue(8),
    lineHeight: '12@s',
    letterSpacing: '0.5@s',
  }
});
export default HomeScreen;