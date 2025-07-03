import { CommonActions, useNavigation } from '@react-navigation/native';
import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import SendBtcArrow from 'src/assets/images/send-btc-arrow.svg';
import RecieveBtcArrow from 'src/assets/images/recieve-btc-arrow.svg';
import BuyBtcIcon from 'src/assets/images/buy-btc-icon.svg';
import MoreBtcIcon from 'src/assets/images/more-btc-icon.svg';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';

const DetailCards = ({ wallet }) => {
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const CardsData = [
    {
      id: 1,
      icon: SendBtcArrow,
      title: 'Send Bitcoin',
      callback: () => {
        navigation.dispatch(CommonActions.navigate('Send', { sender: wallet }));
      },
    },
    {
      id: 2,
      icon: RecieveBtcArrow,
      title: 'Received Bitcoin',
      callback: () => {
        navigation.dispatch(CommonActions.navigate('Receive', { wallet }));
      },
    },
    {
      id: 3,
      icon: BuyBtcIcon,
      title: 'Buy Bitcoin with Ramp',
      callback: () => {
        navigation.dispatch(CommonActions.navigate({ name: 'BuyBitcoin', params: { wallet } }));
      },
    },
    {
      id: 4,
      icon: MoreBtcIcon,
      title: 'More Options',
      callback: () => {},
    },
  ];

  return (
    <Box style={styles.container} backgroundColor={'transparent'}>
      {CardsData.map(({ id, icon: Icon, title, callback }) => (
        <TouchableOpacity key={id} onPress={callback}>
          <Box
            backgroundColor={`${colorMode}.textInputBackground`}
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
