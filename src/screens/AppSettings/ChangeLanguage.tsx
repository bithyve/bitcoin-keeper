import React, { useState, useContext } from 'react';

import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Box, Text, ScrollView, StatusBar, useColorMode } from 'native-base';
import BackIcon from 'src/assets/icons/back.svg';
import CountryCard from 'src/components/SettingComponent/CountryCard';
import CountrySwitchCard from 'src/components/SettingComponent/CountrySwitchCard';
import Note from 'src/components/Note/Note';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import FiatCurrencies from 'src/common/FiatCurrencies';
import CountryCode from 'src/common/CountryCode';
import IconArrow from 'src/assets/icons/Wallets/icon_arrow.svg';
import { useDispatch } from 'react-redux';
import { LocalizationContext } from 'src/common/content/LocContext';

const styles = StyleSheet.create( {
    container: {
      flexGrow: 1,
      paddingHorizontal:  wp( '5%' ),
    },
    textHeading: {
      fontFamily: Fonts.FiraSansRegular,
      fontSize: RFValue( 24 ),
      marginBottom: wp( '5%' ),
      marginTop: wp( '10%' ),
    },
    textTitle: {
      fontFamily: Fonts.FiraSansRegular,
      fontSize: RFValue( 15 ),
    },
    textSubtitle: {
      fontFamily: Fonts.FiraSansRegular,
      fontSize: RFValue( 12 ),
    },
    row: {
      flexDirection: 'row',
      marginBottom: wp( '2%' ),
      marginTop: wp( '8%' ),
    },
    containerItem: {
      marginHorizontal: wp( '5%' ),
    },
    btn:{
      flexDirection: 'row',
      height: wp( '13%' ),
    //   borderRadius: 10,
    //   borderWidth: 1,
    //   borderColor: Colors.borderColor,
    },
    textCurrency: {
      fontFamily: Fonts.FiraSansMedium,
      fontSize: RFValue( 18 ),
    },
    icArrow: {
      marginLeft: wp( '3%' ),
      marginRight: wp( '3%' ),
      alignSelf: 'center',
    },
    textValue: {
      fontFamily: Fonts.FiraSansRegular,
      fontSize: RFValue( 13 ),
      marginLeft: wp( '3%' ),
    },
    textHelpUs: {
      fontFamily: Fonts.FiraSansRegular,
      fontSize: RFValue( 16 ),
      marginLeft: wp( '3%' ),
    },
    textHelpUsSub: {
      fontFamily: Fonts.FiraSansRegular,
      fontSize: RFValue( 13 ),
      marginLeft: wp( '3%' ),
      marginTop: wp( '1%' ),
    },
    mainText :{
        color: '#00715B',
      },
    subText : {
        color : '#4F5955'
    }
  } )

const ChangeLanguage = () => {
  const [ currencyList ] = useState( FiatCurrencies )
  const [ countryList ] = useState( CountryCode )
  const [ languageList ] = useState( CountryCode )
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const [satsMode, setSatsMode] = useState(false);
  const [ isVisible, setIsVisible ] = useState( false )
  //const [ showCurrencies, setShowCurrencies ] = useState( false )
  const [ showLanguages, setShowLanguages ] = useState( false )
  const [ currency, setCurrency ] = useState( {
    code: 'USD',
    symbol: '$',
  } )
  const [ country, setCountry ] = useState( {
    code: 'IN',
    name: 'India',
  } )
  const [ isDisabled, setIsDisabled ] = useState( true )
  const dispatch = useDispatch()

  const changeThemeMode = () => {
    setSatsMode(!satsMode);
  };

  const { translations } = useContext( LocalizationContext )
  const settings = translations[ 'settings' ]

  const Menu = ( { label, value } ) => {
    return (
      <TouchableOpacity
        // onPress={onPress}
        style={styles.btn}
      >
        <View
          style={{
            height: wp( '13%' ),
            width: wp( '15%' ),
            // backgroundColor: Colors.borderColor,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 28,
          }}
        >
          <Text
            style={styles.textCurrency}
          >
            {label}
          </Text>
        </View>
        <View
          style={{
            flex: 1, justifyContent: 'center', height: wp( '13%' )
          }}
        >
          <Text
            style={styles.textValue}
          >
            {value}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBar backgroundColor={'#F7F2EC'} barStyle="dark-content" />
      <Box mx={5} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
        <Box flex={1}>
        <ScrollView
          overScrollMode="never"
          bounces={false}
          flex={1}
          pb={20}
          flexDirection ={'column'}
          showsVerticalScrollIndicator={false}
          py={3}
        >
        <Box w={'60%'} marginLeft={'10%'}>
          <Text fontSize={RFValue(16)} style = {styles.mainText}>{settings.LanguageCountry}</Text>
          <Text fontSize={RFValue(12)} style = {styles.subText}>{settings.biometricsDesc}</Text>
        </Box>
        <CountryCard
            title={settings.SatsMode}
            description={settings.Viewbalancessats}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            onSwitchToggle={() => changeThemeMode()}
            value={satsMode}
          />
          <CountrySwitchCard
            title={settings.CountrySettings}
            description={settings.ChooseKeeperaccesslocation}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => console.log('pressed')}
          />
        <Menu
          onPress={()=> {
            setIsVisible( isVisible )
            setIsDisabled( false )
            setShowLanguages( false )
          }}
          arrow={isVisible}
          label={country ? country.code : '+91'}
          value={country ? country.name : 'India'}
        />
         <View style={{
          position: 'relative',
          marginLeft: 20,
        }}>
          {isVisible && (
            <View
              style={{
                marginTop: wp( '3%' ),
                // borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <ScrollView>
                {countryList.map( ( item ) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setCountry( item )
                        setIsVisible( false )
                      }}
                      style={{
                        flexDirection: 'row', height: wp( '13%' )
                      }}
                    >
                      <View
                        style={{
                          height: wp( '13%' ),
                          width: wp( '15%' ),
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.FiraSansMedium,
                            fontSize: RFValue( 12 ),
                          }}
                        >
                          {item.code}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          height: wp( '13%' ),
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue( 12 ),
                            marginLeft: wp( '3%' ),
                          }}
                        >
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                } )}
              </ScrollView>
            </View>
          )}
        </View>
        <IconArrow />
          <CountrySwitchCard
            title={settings.AlternateCurrency}
            description={settings.Selectyourlocalcurrency}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => console.log('pressed')}
          />
          <Menu
          onPress={()=> {
            setIsVisible( !isVisible )
            setIsDisabled( false )
            setShowLanguages( false )
          }}
          arrow={isVisible}
          label={currency ? currency.symbol : '$'}
          value={currency ? currency.code : '+91'}
        />
         <View style={{
          position: 'relative',
          marginLeft: 20,
        }}>
          {isVisible && (
            <View
              style={{
                marginTop: wp( '3%' ),
                overflow: 'hidden',
              }}
            >
              <ScrollView>
                {languageList.map( ( item ) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setCurrency( item )
                        setIsVisible( false )
                      }}
                      style={{
                        flexDirection: 'row', height: wp( '13%' )
                      }}
                    >
                      <View
                        style={{
                          height: wp( '13%' ),
                          width: wp( '15%' ),
                          backgroundColor: Colors.white,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderBottomWidth: 1,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.FiraSansMedium,
                            fontSize: RFValue( 12 ),
                          }}
                        >
                          {item.dial_code}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          height: wp( '13%' ),
                          borderBottomWidth: 1,
                          backgroundColor: Colors.white,

                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue( 12 ),
                            marginLeft: wp( '3%' ),
                          }}
                        >
                          {item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                } )}
              </ScrollView>
            </View>
          )}
        </View>
          <CountrySwitchCard
            title={settings.LanguageSettings}
            description={settings.Chooseyourlanguage}
            my={2}
            bgColor={`${colorMode}.backgroundColor2`}
            icon={false}
            onPress={() => console.log('pressed')}
          />
          <Menu
          onPress={()=> {
            setIsVisible( !isVisible )
            setIsDisabled( false )
            setShowLanguages( false )
          }}
          arrow={isVisible}
          label={currency ? currency.symbol : '$'}
          value={currency ? currency.code : '+91'}
        />
         <View style={{
          position: 'relative',
          marginLeft: 20,
        }}>
          {isVisible && (
            <View
              style={{
                marginTop: wp( '3%' ),
                borderRadius: 10,
                borderWidth: 1,
                overflow: 'hidden',
              }}
            >
              <ScrollView>
                {currencyList.map( ( item ) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setCurrency( item )
                        setIsVisible( false )
                      }}
                      style={{
                        flexDirection: 'row', height: wp( '13%' )
                      }}
                    >
                      <View
                        style={{
                          height: wp( '13%' ),
                          width: wp( '15%' ),
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.FiraSansMedium,
                            fontSize: RFValue( 12 ),
                          }}
                        >
                          {item.symbol}
                        </Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          justifyContent: 'center',
                          height: wp( '13%' ),

                        }}
                      >
                        <Text
                          style={{
                            fontFamily: Fonts.FiraSansRegular,
                            fontSize: RFValue( 12 ),
                            marginLeft: wp( '3%' ),
                          }}
                        >
                          {item.code}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                } )}
              </ScrollView>
            </View>
          )}
        </View>
          </ScrollView>
          <Box flex={0.3} justifyContent={'flex-end'} mb={5}>
          <Note
            title={settings.HelpUstranslate}
            subtitle={
              settings.desc
            }
          />
        </Box>
          </Box>
    </SafeAreaView>
  );
};

export default ChangeLanguage;