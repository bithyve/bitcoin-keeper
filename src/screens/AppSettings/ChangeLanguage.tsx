import React, { useState, useContext } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import Text from 'src/components/KeeperText';
import CountrySwitchCard from 'src/components/SettingComponent/CountrySwitchCard';
import { setCurrencyCode, setLanguage, setSatsEnabled } from 'src/store/reducers/settings';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Colors from 'src/theme/Colors';
import RightArrowIcon from 'src/assets/images/icon_arrow.svg';
import ScreenWrapper from 'src/components/ScreenWrapper';
import KeeperHeader from 'src/components/KeeperHeader';
import availableLanguages from 'src/context/Localization/availableLanguages';
import { useAppSelector, useAppDispatch } from 'src/store/hooks';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import FiatCurrencies from 'src/constants/FiatCurrencies';
import LoginMethod from 'src/models/enums/LoginMethod';
import Switch from 'src/components/Switch/Switch';
import OptionCard from 'src/components/OptionCard';
import KeeperModal from 'src/components/KeeperModal';
import TickIcon from 'src/assets/images/icon_check.svg';
import { hp } from 'src/constants/responsive';
import useExchangeRates from 'src/hooks/useExchangeRates';

function ChangeLanguage() {
  const { currencyCode, language } = useAppSelector((state) => state.settings);
  const { satsEnabled }: { loginMethod: LoginMethod; satsEnabled: boolean } = useAppSelector(
    (state) => state.settings
  );
  const exchangeRates = useExchangeRates();
  const dispatch = useAppDispatch();
  const [currencyList] = useState(FiatCurrencies);
  const { colorMode } = useColorMode();
  const [showCurrency, setShowCurrency] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [currency, setCurrency] = useState(FiatCurrencies.find((cur) => cur.code === currencyCode));
  const [selectedLanguage, setSelectedLanguage] = useState(
    availableLanguages.find((lang) => lang.iso === language)
  );

  const { translations } = useContext(LocalizationContext);
  const { common, settings } = translations;

  const changeSatsMode = () => {
    dispatch(setSatsEnabled(!satsEnabled));
  };

  function CurrencyModalContent() {
    const { colorMode } = useColorMode();
    const reorderedCurrency = [
      currency,
      ...currencyList.filter((cur) => cur.code !== currency.code),
    ];

    return (
      <ScrollView style={styles.currencyModal}>
        {reorderedCurrency.map((item) => (
          <TouchableOpacity
            key={item.code}
            testID={`btn_currency_${item}`}
            onPress={() => {
              if (exchangeRates[item.code]) {
                setCurrency(item);
                setShowCurrency(false);
                dispatch(setCurrencyCode(item.code));
              } else {
                Alert.alert(settings.currencyErrorTitle, settings.currencyErrorSubTitle, [
                  { text: common.ok },
                ]);
              }
            }}
            style={{
              flexDirection: 'row',
              height: wp('13%'),
            }}
          >
            <Box style={styles.symbolWrapper}>
              <Text
                style={styles.symbolText}
                semiBold={currency.code === item.code}
                color={
                  currency.code === item.code ? `${colorMode}.headerText` : `${colorMode}.GreyText`
                }
              >
                {item.symbol}
              </Text>
            </Box>
            <Box style={styles.codeTextWrapper}>
              <Text
                style={styles.codeText}
                semiBold={currency.code === item.code}
                color={
                  currency.code === item.code ? `${colorMode}.headerText` : `${colorMode}.GreyText`
                }
              >
                {item.code}
              </Text>
              {currency.code === item.code && <TickIcon />}
            </Box>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  function LanguageModalContent() {
    const { colorMode } = useColorMode();
    const reorderedLanguage = [
      selectedLanguage,
      ...availableLanguages.filter((lang) => lang.country_code !== selectedLanguage.country_code),
    ];

    return (
      <ScrollView style={styles.currencyModal}>
        {reorderedLanguage.map((item) => (
          <TouchableOpacity
            testID={`btn_currency_${item}`}
            onPress={() => {
              setSelectedLanguage(item);
              setShowLanguages(false);
              dispatch(setLanguage(item.iso));
            }}
            style={{
              flexDirection: 'row',
              height: wp('13%'),
            }}
          >
            <Box style={styles.symbolWrapper}>
              <Text
                style={styles.symbolText}
                semiBold={selectedLanguage.country_code === item.country_code}
                color={
                  selectedLanguage.country_code === item.country_code
                    ? `${colorMode}.headerText`
                    : `${colorMode}.GreyText`
                }
              >
                {item.flag}
              </Text>
            </Box>
            <Box style={styles.codeTextWrapper}>
              <Text
                style={styles.codeText}
                semiBold={selectedLanguage.country_code === item.country_code}
                color={
                  selectedLanguage.country_code === item.country_code
                    ? `${colorMode}.headerText`
                    : `${colorMode}.GreyText`
                }
              >
                {`${item.country_code.toUpperCase()}- ${item.displayTitle}`}
              </Text>
              {selectedLanguage.country_code === item.country_code && <TickIcon />}
            </Box>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  function Menu({ label, value, onPress, arrow }) {
    return (
      <TouchableOpacity testID={`btn_${label}`} onPress={onPress}>
        <Box backgroundColor={`${colorMode}.seashellWhite`} style={styles.btn}>
          <Box style={styles.menuWrapper}>
            <Text color={`${colorMode}.primaryText`} bold style={styles.textCurrency}>
              {label}
            </Text>
          </Box>
          <Box backgroundColor={`${colorMode}.secondaryText`} style={styles.emptyView} />
          <Box style={styles.textValueWrapper}>
            <Text style={styles.textValue} color={`${colorMode}.GreyText`}>
              {value}
            </Text>
          </Box>
          <Box style={styles.dropdownIconWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
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
          </Box>
        </Box>
      </TouchableOpacity>
    );
  }

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={settings.CurrencyDefaults}
        subtitle={settings.CurrencyDefaultsSubtitle}
      />
      <Box style={styles.contentContainer}>
        <Box style={styles.satModeContainer}>
          <OptionCard
            title={settings.SatsMode}
            description={settings.satsModeSubTitle}
            callback={() => changeSatsMode()}
            Icon={
              <Switch
                value={satsEnabled}
                onValueChange={() => changeSatsMode()}
                testID="switch_darkmode"
              />
            }
          />
        </Box>
        <CountrySwitchCard
          title={settings.FiatCurrency}
          description={settings.Seebalance}
          my={2}
          bgColor={`${colorMode}.backgroundColor2`}
          icon={false}
          onPress={() => console.log('pressed')}
        />
        <Menu
          onPress={() => {
            setShowCurrency(true);
          }}
          arrow={false}
          label={currency.symbol}
          value={currency.code}
        />
        <KeeperModal
          visible={showCurrency}
          closeOnOverlayClick={true}
          close={() => {
            setShowCurrency(false);
          }}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          DarkCloseIcon={colorMode === 'dark'}
          showCloseIcon={false}
          buttonText={null}
          buttonCallback={() => {}}
          Content={CurrencyModalContent}
        />
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
            setShowLanguages(true);
          }}
          arrow={false}
          label={selectedLanguage.flag}
          value={`${selectedLanguage.country_code.toUpperCase()}- ${selectedLanguage.displayTitle}`}
        />
        <KeeperModal
          visible={showLanguages}
          closeOnOverlayClick={true}
          close={() => {
            setShowLanguages(false);
          }}
          modalBackground={`${colorMode}.modalWhiteBackground`}
          textColor={`${colorMode}.primaryText`}
          DarkCloseIcon={colorMode === 'dark'}
          showCloseIcon={false}
          buttonText={null}
          buttonCallback={() => {}}
          Content={LanguageModalContent}
        />
      </Box>
    </ScreenWrapper>
  );
}

export default ChangeLanguage;

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    width: '90%',
    height: wp('13%'),
    position: 'relative',
    marginHorizontal: 10,
    borderRadius: 10,
  },
  textCurrency: {
    fontSize: 15,
  },
  icArrow: {
    marginLeft: wp('3%'),
    marginRight: wp('8%'),
    alignSelf: 'center',
  },
  textValue: {
    fontSize: 12,
    letterSpacing: 0.36,
    marginLeft: wp('3%'),
  },
  mainText: {
    color: '#00715B',
  },
  scrollViewWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 5,
    position: 'absolute',
    width: '95%',
    height: '70%',
    zIndex: 10,
    top: 40,
  },
  langScrollViewWrapper: {
    borderWidth: 1,
    borderColor: Colors.Platinum,
    borderRadius: 10,
    paddingHorizontal: 5,
    margin: 15,
    width: '90%',
    zIndex: 10,
  },
  menuWrapper: {
    height: wp('13%'),
    width: wp('15%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownIconWrapper: {
    marginLeft: 'auto',
    height: wp('13%'),
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  emptyView: {
    height: '55%',
    alignSelf: 'center',
    width: 2,
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
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
  },
  symbolText: {
    fontSize: 13,
    color: '#00836A',
  },
  codeTextWrapper: {
    flex: 1,
    height: wp('13%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  codeText: {
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
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
  },
  flagStyle: {
    fontSize: 13,
    color: '#00836A',
    fontWeight: '700',
  },
  currencyModal: {
    height: hp(400),
  },
  countryCodeWrapper1: {
    flex: 1,
    justifyContent: 'center',
    height: wp('13%'),
    borderBottomWidth: 1,
    borderBottomColor: Colors.Platinum,
  },
  countryCodeWrapper2: {
    fontSize: 13,
    marginLeft: wp('3%'),
    letterSpacing: 0.6,
  },
  countryCodeText: {
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    marginTop: 20,
    // paddingHorizontal: 20,
  },
  satModeContainer: {
    paddingLeft: 10,
  },
});
