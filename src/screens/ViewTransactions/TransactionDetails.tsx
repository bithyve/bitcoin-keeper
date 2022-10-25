import { Box, Text } from 'native-base';
import React, { useContext } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { RFValue } from 'react-native-responsive-fontsize';
import { ScaledSheet } from 'react-native-size-matters';
// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { LocalizationContext } from 'src/common/content/LocContext';
import { Transaction } from 'src/core/wallets/interfaces';
// asserts
import IconRecieve from 'src/assets/images/svgs/icon_received_lg.svg';
import IconSend from 'src/assets/images/svgs/icon_send_lg.svg';
import { getAmount, getUnit } from 'src/common/constants/Bitcoin';

const TransactionDetails = ({ route }) => {

  const { translations } = useContext(LocalizationContext);
  const transactions = translations['transactions'];

  const transaction: Transaction = route.params.transaction;

  const InfoCard = ({ title, describtion, width = 300 }) => {
    return (
      <Box
        backgroundColor={'light.lightYellow'}
        style={{
          height: hp(58),
          width: wp(width),
          marginVertical: hp(7),
          justifyContent: 'center',
          paddingLeft: wp(15),
          borderRadius: 10
        }}
      >
        <Text
          fontWeight={200}
          fontSize={15}
          letterSpacing={1.12}
          color={'light.headerText'}
        >
          {title}
        </Text>
        <Text
          fontWeight={200}
          fontSize={12}
          letterSpacing={2.4}
          color={'light.GreyText'}
        >
          {describtion}
        </Text>
      </Box>
    );
  };

  return (
    <Box
      style={styles.Container}
    >
      <StatusBarComponent padding={50} />
      <Box marginX={3} >
        <Box width={wp(250)}>
          <HeaderTitle
            onPressHandler={() => navigation.goBack()}
            title={transactions.TransactionDetails}
            subtitle={''}
            paddingTop={hp(20)}
          />
        </Box>
        {/* {card} */}
        <Box
          flexDirection={'row'}
          alignItems={'center'}
          marginTop={hp(40)}
          width={320}
          justifyContent={'center'}
        >
          {transaction.transactionType == 'Received' ? <IconRecieve /> : <IconSend />}
          <Box marginLeft={wp(10)} width={wp(100)}>
            <Text
              fontWeight={200}
              fontSize={14}
              letterSpacing={0.7}
              color={'light.headerText'}
            >
              {transaction.address}
            </Text>
            <Text
              fontWeight={200}
              fontSize={10}
              letterSpacing={0.5}
              color={'light.dateText'}
            >
              {transaction.date}
            </Text>
          </Box>
          <Box marginLeft={wp(50)}>
            <Text
              fontWeight={200}
              fontSize={19}
              letterSpacing={0.95}
            >
              {getAmount(transaction.amount) + ' '}
              <Text color={'light.dateText'} letterSpacing={0.6} fontSize={hp(12)} fontWeight={200}>
                {getUnit()}
              </Text>
            </Text>
          </Box>
        </Box>
        {/* {flatlist} */}
        <Box
          alignItems={'center'}
          marginTop={hp(40)}
          width={320}
          justifyContent={'center'}
        >
          <InfoCard title={'To Address'} describtion={transaction.recipientAddresses} />
          <InfoCard title={'From Address'} describtion={transaction.senderAddresses} />
          <InfoCard title={'Transaction ID'} describtion={transaction.txid} />
          <Box flexDirection={'row'} justifyContent={'space-between'} width={'103%'}>
            <InfoCard title={'Fee'} describtion={transaction.fee} width={145} />
            <InfoCard title={'Transaction Type'} describtion={transaction.transactionType} width={145} />
          </Box>
          <Box flexDirection={'row'} justifyContent={'space-between'} width={'103%'}>
            <InfoCard title={'Privacy'} describtion={transaction.type} width={145} />
            <InfoCard title={'Confirmations'} describtion={transaction.confirmations} width={145} />
          </Box>
        </Box>
      </Box>
    </Box >
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
export default TransactionDetails;
