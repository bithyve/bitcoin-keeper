import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import SendBtcArrow from 'src/assets/images/send-btc-arrow.svg';
import RecieveBtcArrow from 'src/assets/images/recieve-btc-arrow.svg';
import BuyBtcIcon from 'src/assets/images/buy-btc-icon.svg';
import MoreBtcIcon from 'src/assets/images/more-btc-icon.svg';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import SendWhiteIcon from 'src/assets/images/send-btc-white-arrow.svg';
import RecieveWhiteIcon from 'src/assets/images/recieve-btc-white-arrow.svg';
import BuyBtcWhiteIcon from 'src/assets/images/buy-btc-icon-white.svg';
import MoreBtcIconWhite from 'src/assets/images/more-option-white-icon.svg';
import { LocalizationContext } from 'src/context/Localization/LocContext';

const DetailCards = ({ setShowMore, sendCallback, receiveCallback, buyCallback }) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslations, common } = translations;
  const CardsData = [
    {
      id: 1,
      icon: isDarkMode ? SendWhiteIcon : SendBtcArrow,
      title: walletTranslations.sendBitcoin,
      callback: () => {
        sendCallback();
      },
    },
    {
      id: 2,
      icon: isDarkMode ? RecieveWhiteIcon : RecieveBtcArrow,
      title: walletTranslations.receiveBitcoin,
      callback: () => {
        receiveCallback();
      },
    },
    {
      id: 3,
      icon: isDarkMode ? BuyBtcWhiteIcon : BuyBtcIcon,
      title: walletTranslations.buyBitCoin,
      callback: () => {
        buyCallback();
      },
    },
    {
      id: 4,
      icon: isDarkMode ? MoreBtcIconWhite : MoreBtcIcon,
      title: common.moreOptions,
      callback: () => {
        setShowMore(true);
      },
    },
  ];

  return (
    <Box style={styles.container} backgroundColor={'transparent'}>
      {CardsData.map(({ id, icon: Icon, title, callback }) => (
        <TouchableOpacity key={id} onPress={callback}>
          <Box
            backgroundColor={`${colorMode}.primaryBackground`}
            borderWidth={1}
            borderColor={`${colorMode}.separator`}
            style={styles.card}
          >
            <Icon width={18} height={18} />
            <Text fontSize={11} style={styles.title}>
              {title}
            </Text>
          </Box>
        </TouchableOpacity>
      ))}
    </Box>
  );
};

export default DetailCards;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp(8),
    width: wp(75),
    height: hp(100),
    paddingHorizontal: 10,
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
    borderRadius: 8,
  },

  title: {
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '100%',
  },
});
