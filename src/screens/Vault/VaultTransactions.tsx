import {
  FlatList,
} from 'react-native';
// libraries
import { Box, Text } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { hp, wp, getTransactionPadding } from 'src/common/data/responsiveness/responsive';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
import { useDispatch } from 'react-redux';
// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import { Transaction } from 'src/core/wallets/interfaces';
import StatusBarComponent from 'src/components/StatusBarComponent';
// asserts
import VaultIcon from 'src/assets/images/svgs/icon_vault_brown.svg';
import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import IconSent from 'src/assets/images/svgs/icon_sent.svg';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';

const VaultTransactions = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const renderTransactionElement = ({ item }) => {
    return <TransactionElement transaction={item} />;
  };
  const TransactionElement = ({ transaction }: { transaction: Transaction }) => {
    return (
      <Box
        flexDirection={'row'}
        height={getTransactionPadding()}
        borderRadius={10}
        justifyContent={'space-between'}
        alignItems={'center'}
        marginTop={hp(20)}
      >
        <Box flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
          {transaction?.transactionType == 'Received' ? <IconRecieve /> : <IconSent />}
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
              bjkdfie79583…
            </Text>
            <Text
              color={'light.dateText'}
              marginX={1}
              fontSize={11}
              fontWeight={100}
              letterSpacing={0.5}
              opacity={0.82}
            >
              30 May 22 11:00am
            </Text>
          </Box>
        </Box>
        <Box flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
          <Box>
            <BtcBlack />
          </Box>
          <Text
            color={'light.textBlack'}
            fontSize={19}
            fontWeight={200}
            letterSpacing={0.95}
            marginX={2}
            marginRight={3}
          >
            0.3232
          </Text>
          <Box>
            <IconArrowGrey />
          </Box>
        </Box>
      </Box>
    );
  };
  return (
    <Box
      style={styles.Container}
    >
      <StatusBarComponent padding={50} />
      <Box marginX={3} >
        <Box width={wp(200)}>
          <HeaderTitle
            onPressHandler={() => navigation.goBack()}
          />
        </Box>
        {/* {card} */}
        <Box
          flexDirection={'row'}
          alignItems={'center'}
        >
          <VaultIcon />
          <Box>
            <Text
              fontWeight={200}
              fontSize={16}
              letterSpacing={0.8}
              color={'light.headerText'}
            >
              Vault Transactions
            </Text>
            <Text
              fontWeight={200}
              fontSize={12}
              letterSpacing={0.6}
              color={'light.modalText'}
            >
              All incoming and outgoing transactions
            </Text>
          </Box>
        </Box>
        {/* {flatlist} */}
        <Box
          marginTop={hp(10)}
          paddingBottom={hp(300)}
        >
          <FlatList
            data={[1, 2, 3]}
            renderItem={renderTransactionElement}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.ReceiveBackground',
  },
  linearGradient: {
    borderRadius: 6,
    marginTop: hp(3),
  },
  cardContainer: {
    flexDirection: 'row',
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: RFValue(12),
    letterSpacing: '0.24@s',
  },
  subtitle: {
    fontSize: RFValue(10),
    letterSpacing: '0.20@s',
  },

  textInput: {
    width: '100%',
    backgroundColor: '#FDF7F0',
    borderRadius: 10,
    opacity: 0.5,
    padding: 15,
  },



});
export default VaultTransactions;
