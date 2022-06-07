import React from 'react';
import { StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Box, Text, Pressable } from 'native-base';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// icons, images and functions
import IconArrowBlack from 'src/assets/images/svgs/icon_arrow_black.svg';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';
import IconRecieve from 'src/assets/icons/Wallets/icon_recieve.svg';
import BackIcon from 'src/assets/images/svgs/back_white.svg';
import SettingIcon from 'src/assets/images/svgs/settings.svg';
import Icon from 'src/assets/images/svgs/seedsigner.svg';
import Btc from 'src/assets/images/svgs/btc.svg';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import BtcSmall from 'src/assets/images/svgs/btc_small.svg';
import { getAccountCardHeight, getTransactionPadding, windowHeight } from 'src/common/data/responsiveness/responsive';
import BaseCardWallet from 'src/assets/images/basecard_wallet.png';

const Transaction = () => {
  return (
    <Box
      flexDirection={'row'}
      height={getTransactionPadding()}
      borderRadius={10}
      justifyContent={'space-between'}
      alignItems={'center'}
      marginY={windowHeight >= 850 ? '3%' : '2.4%'}
    >
      <Box flexDirection={'row'} alignItems={'center'}>
        <IconRecieve />
        <Box flexDirection={'column'} marginLeft={3}>
          <Text color={'light.textBlack'} marginX={1} fontSize={12} fontWeight={200} letterSpacing={0.6}>
            bjkdfie79583…
          </Text>
          <Text color={'light.dateText'} marginX={1} fontSize={10} fontWeight={100} letterSpacing={0.5}>
            30 May 22 11:00am
          </Text>
        </Box>
      </Box>
      <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'} >
        <Box>
          <BtcBlack />
        </Box>
        <Text color={'light.textBlack'} fontSize={19} fontWeight={200} letterSpacing={0.95} marginX={2} marginRight={3}>
          0.000018
        </Text>
        <Box >
          <IconArrowGrey />
        </Box>
      </Box>
    </Box>
  )
}
const WalletDetailScreen = () => (
  <Box>
    <ImageBackground
      source={BaseCardWallet}
      style={styles.cardImageContainer}
    >
      <Box style={styles.headerContainer}>
        <TouchableOpacity>
          <BackIcon />
        </TouchableOpacity>
        <TouchableOpacity >
          <SettingIcon />
        </TouchableOpacity>
      </Box>
      <Box
        flexDirection={'row'}
        height={70}
        borderRadius={10}
        justifyContent={'space-between'}
        alignItems={'center'}
        paddingX={3}
        marginX={5}
        marginTop={'4%'}
      >
        <Box flexDirection={'row'} alignItems={'center'}>
          <Icon />
          <Box flexDirection={'column'} marginLeft={2}>
            <Text color={'light.textLight'} marginX={1} fontSize={16} fontWeight={200} letterSpacing={0.32}>
              Maldives Funds
            </Text>
            <Text color={'light.textLight'} marginX={1} fontSize={12} fontWeight={100} letterSpacing={0.24}>
              Single-sig
            </Text>
          </Box>
        </Box>
        <Pressable backgroundColor={'light.KnowMoreButton'} borderRadius={6} padding={1} borderColor={'light.textLight'} borderWidth={'.5'}>
          <Text color={'light.textLight'} marginX={1} fontSize={12} fontWeight={100} letterSpacing={0.6}>
            Know More
          </Text>
        </Pressable>
      </Box>

      <Box
        flexDirection={'row'}
        height={70}
        borderRadius={10}
        justifyContent={'space-between'}
        alignItems={'center'}
        paddingX={3}
        marginX={5}
        marginTop={'2%'}
      >
        <Box flexDirection={'row'} alignItems={'center'}>
          <Text color={'light.textLight'} fontSize={26} fontWeight={200} letterSpacing={1.3}>
            <Box alignItems={'center'} justifyContent={'flex-end'} paddingBottom={1} marginRight={2}>
              <Btc />
            </Box>
            0.000024
          </Text>
        </Box>

        <Box flexDirection={'column'} marginLeft={2} alignItems={'flex-end'}>
          <Text color={'light.textLight'} marginX={1} fontSize={12} fontWeight={100} letterSpacing={0.24}>
            Available to spend
          </Text>
          <Text color={'light.textLight'} marginX={1} fontSize={14} fontWeight={200} letterSpacing={1.4}>
            <Box marginRight={1}>
              <BtcSmall />
            </Box>
            0.000018
          </Text>
        </Box>

      </Box>
    </ImageBackground>

    <Box
      marginTop={getAccountCardHeight()}
      paddingX={7}
      paddingY={getTransactionPadding()}
      height={'100%'}
      width={'100%'}
      backgroundColor={'light.ReceiveBackground'}
      borderRadius={20}
    >
      <Box flexDirection={'row'} justifyContent={'space-between'}>
        <Text color={'light.textBlack'} marginX={1} fontSize={16} fontWeight={200} letterSpacing={1.28}>
          Transactions
        </Text>
        <Box flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Text color={'light.light'} marginX={1} fontSize={11} fontWeight={300} letterSpacing={0.6}>
            View All
          </Text>
          <IconArrowBlack />
        </Box>
      </Box>

      <Box marginTop={5}>
        <Transaction />
        <Transaction />
        <Transaction />
        <Transaction />
        <Transaction />
        <Transaction />
      </Box>
      <Box borderWidth={0.5} borderColor={'light.GreyText'} borderRadius={20} marginTop={'5'} />

      <Box flexDirection={'row'} marginY={4} justifyContent={'space-evenly'}>
        <IconRecieve />
        <IconRecieve />
        <IconRecieve />
      </Box>
    </Box>
  </Box>
);

const styles = StyleSheet.create({
  cardImageContainer: {
    width: '100%',
    height: 450,
    marginTop: -70,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: hp(16),
    paddingHorizontal: wp(10),
  },
});

export default WalletDetailScreen;
