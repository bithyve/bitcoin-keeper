import React, { useState, useContext } from 'react';
import { Box, Text, Pressable } from 'native-base';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
// libraries
import { RFValue } from 'react-native-responsive-fontsize';
import { LocalizationContext } from 'src/common/content/LocContext';
import LinearGradient from 'react-native-linear-gradient';
// Components
import StatusBarComponent from 'src/components/StatusBarComponent';
import { hp, wp, getTransactionPadding } from 'src/common/data/responsiveness/responsive';
import { Transaction } from 'src/core/wallets/interfaces';
// asserts
import BackIcon from 'src/assets/icons/back.svg';
import Server from 'src/assets/images/svgs/server.svg';
import Edit from 'src/assets/images/svgs/edit.svg';
import DotView from 'src/components/DotView';
import Change from 'src/assets/images/svgs/change.svg';
import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import Heathcheck from 'src/assets/images/svgs/heathcheck.svg';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import Settings from 'src/assets/images/svgs/settings_brown.svg';

const SigningServer = ({ navigation }) => {
  const { translations } = useContext(LocalizationContext);
  const BackupWallet = translations['BackupWallet'];

  const GradientIcon = ({ height, Icon }) => {
    return (
      <LinearGradient
        colors={['#694B2E', '#694B2E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Icon />
      </LinearGradient>
    );
  };
  const SimpleIcon = ({ height, Icon }) => {
    return (
      <Box
        style={{
          height: hp(height),
          width: hp(height),
          borderRadius: height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FAC48B'
        }}
      >
        <Icon />
      </Box>
    );
  };

  const Description = ({ text }) => {
    return (
      <Text
        color={'light.inActiveMsg'}
        fontSize={RFValue(12)}
        fontWeight={'200'}
        letterSpacing={0.6}
      >
        {text}
      </Text>
    )
  }
  const HistoryCard = () => {
    return (
      <Box>
        <Box
          zIndex={99}
          position={'absolute'}
          left={-8}
          bg={'light.ReceiveBackground'}
          p={2}
          borderRadius={15}
        >
          <DotView height={2} width={2} color={'#E3BE96'} />
        </Box>
        <Text
          color={'light.GreyText'}
          fontSize={RFValue(10)}
          fontWeight={'300'}
          ml={5}
          opacity={0.7}
        >
          {'15 March ’21'}
        </Text>
        <Box
          borderLeftColor={'#E3BE96'}
          borderLeftWidth={1}
          ml={wp(3.5)}
          position="relative"
        >
          <Box
            backgroundColor={'light.lightYellow'}
            my={2}
            p={5}
            marginLeft={wp(15)}
            borderRadius={10}
          >
            <Text
              color={'light.recieverAddress'}
              fontSize={RFValue(14)}
              fontWeight={200}
              letterSpacing={0.96}
            >
              Health Check Skipped
            </Text>
            <Description text={'Lorem ipsum dolor sit amet, cons ectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et'} />
            {/* <TransactionElement /> */}
          </Box>
        </Box>
      </Box>
    )
  }

  const TransactionElement = ({ transaction = {} }: { transaction?: Transaction }) => {
    return (
      <Box
        flexDirection={'row'}
        height={getTransactionPadding()}
        borderRadius={10}
        justifyContent={'space-between'}
        alignItems={'center'}
        marginTop={hp(20)}
      >
        <Box
          flexDirection={'row'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <IconRecieve />
          <Box flexDirection={'column'} marginLeft={1.5}>
            <Text
              color={'light.GreyText'}
              marginX={1}
              fontSize={13}
              fontWeight={200}
              letterSpacing={0.6}
              numberOfLines={1}
              width={wp(125)}
            >
              {'bjkdfie79583…'}
            </Text>
            <Text
              color={'light.dateText'}
              marginX={1}
              fontSize={11}
              fontWeight={100}
              letterSpacing={0.5}
              opacity={0.82}
            >
              {'30 May 22 11:00am'}
            </Text>
          </Box>
        </Box>
        <Box
          flexDirection={'row'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Box>
            <BtcBlack />
          </Box>
          <Text
            color={'light.recieverAddress'}
            fontSize={19}
            fontWeight={200}
            letterSpacing={0.95}
            marginX={2}
            marginRight={3}
          >
            {0.00015}
          </Text>
        </Box>
      </Box>
    );
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#F7F2EC',
      }}
    >
      <StatusBarComponent padding={hp(2)} />
      {/* {header} */}
      <Box
        flexDirection={'row'}
        justifyContent={'space-between'}
        style={{
          paddingLeft: wp(30),
          paddingRight: wp(20),
          marginTop: hp(20)
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <BackIcon />
        </TouchableOpacity>
        <Box
          height={hp(20)}
          width={wp(70)}
          borderColor={'light.brownborder'}
          borderWidth={0.5}
          borderRadius={5}
          backgroundColor={'light.yellow2'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Text
            color={'light.brownborder'}
            fontWeight={200}
            letterSpacing={0.6}
            fontSize={12}
          >
            Learn More
          </Text>
        </Box>
      </Box>
      {/* {Signing Server} */}
      <Box
        alignItems={'center'}
        justifyContent={'center'}
        flexDirection={'row'}
        marginTop={hp(35)}
      >
        <Box marginRight={wp(17)}>
          <GradientIcon Icon={Server} height={hp(50)} />
        </Box>
        <Box>
          <Text
            fontSize={RFValue(14)}
            fontWeight={'200'}
            letterSpacing={1.12}
            color={'light.lightBlack'}
          >
            Signing Server
          </Text>
          <Text
            fontSize={RFValue(10)}
            fontWeight={'200'}
            letterSpacing={1}
            color={'light.modalText'}
          >
            Added on 12 January 2022
          </Text>
          <Text
            color={'light.GreyText'}
            fontSize={RFValue(12)}
            fontFamily={'body'}
            letterSpacing={0.6}

          >
            Lorem ipsum dolor sit amet
          </Text>
        </Box>
        <Box marginLeft={wp(40)}>
          <Edit />
        </Box>
      </Box>
      {/* {list} */}
      <Box mx={wp(30)} marginTop={hp(50)} height={hp(380)}>
        <FlatList
          data={[1, 2, 3, 4, 5]}
          contentContainerStyle={{ flexGrow: 1 }}
          renderItem={({ item }) => (
            <HistoryCard />
          )}
          keyExtractor={(item) => `${item}`}
          showsVerticalScrollIndicator={false}
        />
      </Box>
      <Box
        style={{
          marginHorizontal: wp(40),
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          style={{
            marginVertical: hp(20)
          }}>
          <Text
            color={'light.modalText'}
            fontWeight={200}
            fontSize={13}
            letterSpacing={0.65}
          >
            You will be reminded in 90 days Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </Text>
        </Box>
        <Box
          marginLeft={2}
          width={wp(318)}
          backgroundColor={'light.Border'}
          opacity={0.1}
          height={0.5}
        />
        <Box
          width={wp(256)}
          flexDirection={'row'}
          justifyContent={'space-between'}
          alignItems={'center'}
          marginTop={hp(18)}
        >
          <TouchableOpacity style={styles.IconText}>
            <SimpleIcon Icon={Change} height={hp(38)} />
            <Text
              color={'light.lightBlack'}
              fontSize={12}
              letterSpacing={0.84}
              marginY={1}
              width={wp(52)}
              textAlign={'center'}
              numberOfLines={2}
            >
              Change Signer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.IconText}>
            <SimpleIcon Icon={Heathcheck} height={hp(38)} />
            <Text
              color={'light.lightBlack'}
              fontSize={12}
              letterSpacing={0.84}
              marginY={1}
              width={wp(52)}
              numberOfLines={2}
              textAlign={'center'}
            >
              Health Check
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.IconText}>
            <SimpleIcon Icon={Settings} height={hp(38)} />
            <Text
              color={'light.lightBlack'}
              fontSize={12}
              letterSpacing={0.84}
              marginY={1}
              width={wp(60)}
              numberOfLines={2}
              textAlign={'center'}
            >
              Advanced Options
            </Text>
          </TouchableOpacity>
        </Box>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  IconText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SigningServer;
