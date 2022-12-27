import React, { useState, useContext } from 'react';

import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Text from 'src/components/KeeperText';
import { Box, ScrollView, StatusBar, useColorMode } from 'native-base';
import BackIcon from 'src/assets/images/back.svg';
import CountryCard from 'src/components/SettingComponent/CountryCard';
import CountrySwitchCard from 'src/components/SettingComponent/CountrySwitchCard';
import { setCurrencyCode, setLanguage } from 'src/store/reducers/settings';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from 'src/theme/Colors';
import Fonts from 'src/common/Fonts';
import FiatCurrencies from 'src/common/FiatCurrencies';
import CountryCode from 'src/common/CountryCode';
import { LocalizationContext } from 'src/common/content/LocContext';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import availableLanguages from '../../common/content/availableLanguages';
import { useAppSelector, useAppDispatch } from '../../store/hooks';

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    height: wp('13%'),
    position: 'relative',
    //   borderRadius: 10,
    //   borderWidth: 1,
    //   borderColor: Colors.borderColor,
  },
  textCurrency: {
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 18,
    color: '#00836A',
    fontWeight: '700',
  },
  icArrow: {
    marginLeft: wp('3%'),
    marginRight: wp('13%'),
    alignSelf: 'center',
  },
  textValue: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: 12,
    marginLeft: wp('3%'),
  },
  mainText: {
    color: '#00715B',
  },
  scrollViewWrapper: {
    borderWidth: 1,
    borderColor: Colors.Platinum,
    borderRadius: 10,
    margin: 15,
    position: 'absolute',
    width: '90%',
    zIndex: 10,
    backgroundColor: '#FAF4ED',
    height: '70%',
    top: 50,
  },
  menuWrapper: {
    height: wp('13%'),
    width: wp('15%'),
    backgroundColor: '#FAF4ED',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 28,
  },
  emptyView: {
    height: '55%',
    marginTop: 10,
    width: 2,
    backgroundColor: '#D8A572',
  },
  textValueWrapper: {
    flex: 1,
    justifyContent: 'center',
    height: wp('13%'),
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#F7F2EC',
  },
  symbolWrapper: {
    height: wp('13%'),
    width: wp('15%'),
    paddingLeft: wp('5%'),
    backgroundColor: '#FAF4ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
  },
  symbolText: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: 13,
    color: '#00836A',
    fontWeight: '700',
  },
  codeTextWrapper: {
    flex: 1,
    justifyContent: 'center',
    height: wp('13%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
    backgroundColor: '#FAF4ED',
  },
  codeText: {
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 13,
    marginLeft: wp('7%'),
    letterSpacing: 0.6,
  },
  flagWrapper1: {
    flexDirection: 'row',
    height: wp('13%'),
  },
  flagWrapper2: {
    height: wp('13%'),
    width: wp('15%'),
    marginLeft: wp('8%'),
    backgroundColor: '#FAF4ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
  },
  flagStyle: {
    fontFamily: Fonts.FiraSansMedium,
    fontSize: 13,
    color: '#00836A',
    fontWeight: '700',
  },
  countryCodeWrapper1: {
    flex: 1,
    justifyContent: 'center',
    height: wp('13%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
  },
  countryCodeWrapper2: {
    fontFamily: Fonts.RobotoCondensedRegular,
    fontSize: 13,
    marginLeft: wp('3%'),
    letterSpacing: 0.6,
  },
  countryCodeText: {
    textTransform: 'uppercase',
  },
});

function ChangeLanguage() {
  const [currencyList] = useState(FiatCurrencies);
  const [countryList] = useState(CountryCode);
  const navigation = useNavigation();
  const { colorMode } = useColorMode();
  const [satsMode, setSatsMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [Visible, setVisible] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const { appLanguage, setAppLanguage } = useContext(LocalizationContext);
  const { currencyCode, language } = useAppSelector((state) => state.settings);
  const [currency, setCurrency] = useState(FiatCurrencies.find((cur) => cur.code === currencyCode));
  const [selectedLanguage, setSelectedLanguage] = useState(
    availableLanguages.find((lang) => lang.iso === language)
  );
  const [isDisabled, setIsDisabled] = useState(true);
  const dispatch = useAppDispatch();

  const changeThemeMode = () => {
    setSatsMode(!satsMode);
  };

  const { translations } = useContext(LocalizationContext);
  const { settings } = translations;

  function Menu({ label, value, onPress, arrow }) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.btn}>
        <View style={styles.menuWrapper}>
          <Text style={styles.textCurrency}>{label}</Text>
        </View>
        <View style={styles.emptyView} />
        <View style={styles.textValueWrapper}>
          <Text style={styles.textValue} color="light.GreyText">
            {value}
          </Text>
        </View>
        <View
          style={{
            marginLeft: 'auto',
            height: wp('13%'),
            justifyContent: 'center',
          }}
        >
          <Box
            style={[
              styles.icArrow,
              {
                transform: [{ rotate: arrow ? '-90deg' : '90deg' }],
              },
            ]}
          >
            <RightArrowIcon />
          </Box>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <StatusBar backgroundColor="light.secondaryBackground" barStyle="dark-content" />
      <Box mx={5} my={10}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
      </Box>
      <Box flex={1}>
        {/* <ScrollView
          overScrollMode="never"
          bounces={false}
          flex={1}
          pb={20}
          flexDirection={'column'}
          showsVerticalScrollIndicator={false}
          py={3}
        > */}
        <Box width="60%" marginLeft="10%">
          <Text fontSize={16} letterSpacing={0.8} style={styles.mainText}>
            {settings.LanguageCountry}
          </Text>
          <Text fontSize={12} letterSpacing={0.6} color="light.GreyText">
            {settings.biometricsDesc}
          </Text>
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
          title={settings.AlternateCurrency}
          description={settings.Selectyourlocalcurrency}
          my={2}
          bgColor={`${colorMode}.backgroundColor2`}
          icon={false}
          onPress={() => console.log('pressed')}
        />
        <Menu
          onPress={() => {
            setVisible(!Visible);
            setIsDisabled(false);
            setShowLanguages(false);
          }}
          arrow={Visible}
          label={currency.symbol}
          value={currency.code}
        />
        {Visible && (
          <ScrollView style={styles.scrollViewWrapper}>
            {currencyList.map((item) => (
              <TouchableOpacity
                onPress={() => {
                  setCurrency(item);
                  setVisible(false);
                  dispatch(setCurrencyCode(item.code));
                }}
                style={{
                  flexDirection: 'row',
                  height: wp('13%'),
                }}
              >
                <View style={styles.symbolWrapper}>
                  <Text style={styles.symbolText}>{item.symbol}</Text>
                </View>
                <View style={styles.codeTextWrapper}>
                  <Text style={styles.codeText} color="light.GreyText">
                    {item.code}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <CountrySwitchCard
          title={settings.LanguageSettings}
          description={settings.Chooseyourlanguage}
          my={2}
          bgColor={`${colorMode}.backgroundColor2`}
          icon={false}
          onPress={() => console.log('pressed')}
        />
        <Menu
          onPress={() => {
            // Do not remove this
            setShowLanguages(!showLanguages);
            setIsDisabled(false);
            setVisible(false);
          }}
          arrow={showLanguages}
          label={selectedLanguage.flag}
          value={`${selectedLanguage.country_code.toUpperCase()}- ${selectedLanguage.displayTitle}`}
        />
        {showLanguages && (
          <ScrollView style={styles.scrollViewWrapper}>
            {availableLanguages.map((item) => (
              <TouchableOpacity
                onPress={() => {
                  setAppLanguage(item.iso);
                  setShowLanguages(false);
                  setIsVisible(false);
                  dispatch(setLanguage(item.iso));
                  setSelectedLanguage(availableLanguages.find((lang) => lang.iso === item.iso));
                }}
                style={styles.flagWrapper1}
              >
                <View style={styles.flagWrapper2}>
                  <Text style={styles.flagStyle}>{item.flag}</Text>
                </View>
                <View style={styles.countryCodeWrapper1}>
                  <Text style={styles.countryCodeWrapper2} color="light.GreyText">
                    <Text style={styles.countryCodeText}>{item.country_code}</Text>
                    <Text>{`- ${item.displayTitle}`}</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {/* </ScrollView> */}
        {/* <View style={{ marginBottom: 10 }}>
          <LanguageNote
            title={settings.HelpUstranslate}
            subtitle={
              settings.desc
            }
          />
        </View> */}
      </Box>
    </SafeAreaView>
  );
}

export default ChangeLanguage;
