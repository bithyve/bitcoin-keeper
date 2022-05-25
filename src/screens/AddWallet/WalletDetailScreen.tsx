import React from 'react';
import { StyleSheet, View, SafeAreaView, ImageBackground, TouchableOpacity } from 'react-native';
import { Box, Text } from 'native-base';

import StatusBarComponent from 'src/components/StatusBarComponent';
import IconBack from 'src/assets/icons/Wallets/IconBack.svg';
import Toggler from 'src/assets/icons/Wallets/switchbase.svg';
import IconChecking from 'src/assets/icons/Wallets/icon_checking.svg';
import IconSetting from 'src/assets/icons/Wallets/icon_settings.svg';
import IconBitcoin from 'src/assets/icons/Wallets/icon_bitcoin.svg';
import IconArrow from 'src/assets/icons/Wallets/icon_arrow.svg';
import SmallIconBitcoin from 'src/assets/icons/Wallets/icon_bitcoin_1.svg';
import IconRecieve from 'src/assets/icons/Wallets/icon_recieve.svg';
import IconSend from 'src/assets/icons/Wallets/icon_send.svg';

import CheckingWallet from 'src/assets/images/regular_account_background.png';

const RenderTransaction = () => {
  return (
    <Box>
      <Box
        flexDir={'row'}
        alignItems={'center'}
        justifyContent={'space-between'}
        paddingX={3}
        paddingY={3}
      >
        <Box>
          <Text color={'#006DB4'} fontSize={13}>
            Bought via FastBitcoin
          </Text>
          <Text color={'#6C6C6C'} fontSize={11}>
            01/09/2019
          </Text>
        </Box>
        <Box flexDir={'row'} alignItems={'center'}>
          <Box marginRight={2}>
            <SmallIconBitcoin />
          </Box>
          <Box>
            <Text marginRight={3} fontSize={17} color={'#70C1B3'}>
              2,316,000
            </Text>
          </Box>
          <IconArrow />
        </Box>
      </Box>
      <Box
        marginTop={1}
        borderBottomWidth={0.75}
        borderBottomColor={'#6C6C6C'}
        width={'95%'}
        marginX={'auto'}
      />
    </Box>
  );
};
const WalletDetailScreen = () => {
  return (
    <SafeAreaView>
      <StatusBarComponent />
      <Box marginX={3} marginY={5}>
        <Box marginX={3} flexDir={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <IconBack />
          <Text color={'#006DB4'} fontSize={'20'} fontFamily="body" fontWeight="200">
            Wallets
          </Text>
          <Toggler />
        </Box>

        <ImageBackground
          source={CheckingWallet}
          style={styles.cardImageContainer}
          imageStyle={{
            borderRadius: 20,
          }}
        >
          <Box marginX={5} marginY={2}>
            <Box flexDir={'row'} justifyContent={'space-between'} alignItems={'center'}>
              <IconChecking />
              <Box marginTop={-5}>
                <IconSetting />
              </Box>
            </Box>
            <Box marginY={3}>
              <Text color={'#FFFFFF'} fontFamily={'body'} fontSize={15}>
                Checking Wallet
              </Text>
              <Text color={'#FFFFFF'} fontFamily={'body'} fontSize={12}>
                Fast and easy
              </Text>
            </Box>
            <Box flexDir={'row'} alignItems={'center'} justifyContent={'space-between'}>
              <Box flexDir={'row'} alignItems={'center'}>
                <Box marginRight={2}>
                  <IconBitcoin />
                </Box>
                <Text color={'#FFFFFF'} fontFamily={'body'} fontSize={21}>
                  400,000
                </Text>
                <Text marginX={'3'} color={'#FFFFFF'} fontFamily={'body'} fontSize={13}>
                  sats
                </Text>
              </Box>
              <TouchableOpacity
                style={{ borderColor: '#FFFFFF', borderWidth: 1, borderRadius: 5 }}
                activeOpacity={0.5}
              >
                <Text color={'#FFFFFF'} fontFamily={'body'} fontSize={15} padding={'1'}>
                  Know More
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </ImageBackground>

        <Box
          justifyContent={'space-between'}
          flexDir={'row'}
          marginX={3}
          marginY={8}
          marginRight={5}
        >
          <Text
            color={'#6C6C6C'}
            fontSize={13}
            fontFamily={'body'}
            fontWeight={200}
            letterSpacing={0.2}
          >
            Today
          </Text>
          <Text
            color={'#6C6C6C'}
            fontSize={13}
            fontFamily={'body'}
            fontWeight={200}
            fontStyle="italic"
            textDecorationLine={'underline'}
            letterSpacing={0.2}
          >
            View More
          </Text>
        </Box>

        <RenderTransaction />
        <RenderTransaction />
        <RenderTransaction />
        <RenderTransaction />

        <Box flexDir={'row'} justifyContent={'space-between'} marginX={'3'} marginY={'10'}>
          <TouchableOpacity style={styles.buttonContainer}>
            <IconSend />
            <Box>
              <Text style={styles.buttonText}>Send</Text>
              <Text style={styles.subText}>Tran Fee : 0.032 (sats)</Text>
            </Box>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContainer}>
            <IconRecieve />
            <Box>
              <Text style={styles.buttonText}>Receive</Text>
              <Text style={styles.subText}>Tran Fee : 0.032 (sats)</Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardImageContainer: {
    width: '100%',
    height: 180,
    marginTop: '10%',
    borderRadius: 10,
  },
  buttonContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 15,
    width: 165,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    justifyContent: 'center',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: -4,
  },
  subText: {
    color: '#BCB6B6',
    fontSize: 9,
    marginLeft: 8,
  },
});

export default WalletDetailScreen;
