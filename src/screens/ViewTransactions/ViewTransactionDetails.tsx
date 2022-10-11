import { Box, HStack, ScrollView, Text, VStack } from 'native-base';
import { CommonActions, useNavigation } from '@react-navigation/native';
import {
  FlatList,
  InteractionManager,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import StatusBarComponent from 'src/components/StatusBarComponent';
import Header from 'src/components/Header';
import { ScaledSheet } from 'react-native-size-matters';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';
import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import IconSent from 'src/assets/images/svgs/icon_sent.svg';
import AddNew from 'src/assets/images/svgs/icon_add_new.svg';
import IconEdit from 'src/assets/images/svgs/icon_edit.svg';
import { LocalizationContext } from 'src/common/content/LocContext';

//To-Do: @raheel Migrate the logic to the new screen
const Title = () => {
  const { translations } = useContext(LocalizationContext);
  const transactions = translations['transactions'];
  return (
    <Box flexDirection={'row'} px={'2%'} py={'5%'}>
      <StatusBar barStyle={'light-content'} />
      <View style={{ flexDirection: 'column', marginLeft: 20 }}>
        <Text fontSize={16} color={'light.headerText'}>
          {transactions.TransactionDetails}
        </Text>
        <Text color={'light.GreyText'}>{transactions.TransactionSubTitle}</Text>
      </View>
    </Box>
  );
};

const TransactionBody = (transaction) => {
  const thisTransaction = transaction.transaction;
  return (
    <Box
      flexDirection={'row'}
      height={getTransactionPadding()}
      borderRadius={10}
      justifyContent={'space-between'}
      alignItems={'center'}
      marginTop={hp(25)}
      marginBottom={hp(20)}
    >
      <Box flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
        {thisTransaction.transactionType == 'Received' ? <IconRecieve /> : <IconSent />}
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
            {thisTransaction.address}
          </Text>
          <Text
            color={'light.dateText'}
            marginX={1}
            fontSize={11}
            fontWeight={100}
            letterSpacing={0.5}
            opacity={0.82}
          >
            {thisTransaction.date}
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
          {thisTransaction.amount}
        </Text>
      </Box>
    </Box>
  );
};

const UserTags = (transaction) => {
  const { translations } = useContext(LocalizationContext);
  const transactions = translations['transactions'];
  return (
    <Box py={'5%'} backgroundColor={'light.lightYellow'}>
      <Box flexDirection={'row'}>
        <View style={{ flexDirection: 'column', marginLeft: 10 }}>
          <Text fontSize={14} marginBottom={5} color={'light.headerText'}>
            {transactions.UserTags}
          </Text>
          <Box p={0.5} borderRadius={5} backgroundColor={'light.transactionPolicyCard'}>
            <Text marginX={2}>Family</Text>
          </Box>
        </View>
      </Box>
      <Box
        backgroundColor={'light.Border'}
        marginLeft={'5%'}
        marginTop={5}
        height={0.1}
        width={'90%'}
      />
      <Box
        flexDirection={'row'}
        width={'70%'}
        alignSelf={'center'}
        marginTop={5}
        justifyContent={'space-between'}
      >
        <AddNew />
        <Text marginRight={10} marginTop={1}>
          {'   '}
          {transactions.AddNew}
        </Text>
        <IconEdit />
        <Text marginRight={10} marginTop={1}>
          {'   '}
          {transactions.EditTags}
        </Text>
      </Box>
    </Box>
  );
};

const Address = ({ transaction, title }) => {
  return (
    <Box flexDirection={'column'} backgroundColor={'light.lightYellow'} py={'2%'} marginTop={5}>
      <View style={{ flexDirection: 'column', marginLeft: 10 }}>
        <Text fontSize={14} color={'light.headerText'}>
          {title}
        </Text>
        <Text color={'light.GreyText'}>{transaction}</Text>
      </View>
    </Box>
  );
};

const Details = ({ transaction, title }) => {
  return (
    <Box
      width={'45%'}
      flexDirection={'column'}
      backgroundColor={'light.lightYellow'}
      py={'2%'}
      marginTop={5}
    >
      <View style={{ flexDirection: 'column', marginLeft: 10 }}>
        <Text fontSize={14} color={'light.headerText'}>
          {title}
        </Text>
        {title == 'Fees' ? (
          <Text color={'light.GreyText'}>{transaction} btc</Text>
        ) : (
          <Text color={'light.GreyText'}>{transaction}</Text>
        )}
      </View>
    </Box>
  );
};

const Confirmation = ({ transaction, title }) => {
  return (
    <Box
      width={'45%'}
      flexDirection={'column'}
      backgroundColor={'light.lightYellow'}
      py={'2%'}
      marginTop={5}
    >
      <View style={{ flexDirection: 'column', marginLeft: 10 }}>
        <Text fontSize={14} color={'light.headerText'}>
          {title}
        </Text>
        {transaction > 6 ? (
          <Text color={'light.GreyText'}>6+</Text>
        ) : (
          <Text color={'light.GreyText'}>{transaction}</Text>
        )}
      </View>
    </Box>
  );
};

const ViewTransactionDetails = ({ route }) => {
  const navigtaion = useNavigation();
  const transaction = route.params.transaction;
  console.log(transaction);
  return (
    <Box style={styles.Container} background={'light.ReceiveBackground'}>
      <StatusBarComponent padding={50} />
      <Box>
        <Header
          onPressHandler={() => navigtaion.goBack()}
          headerTitleColor={'light.headerText'}
          fontSize={16}
        />
        <Title />
        <ScrollView>
          <TransactionBody transaction={transaction} />

          <Address transaction={transaction.recipientAddresses} title={'To Address'} />
          <Address transaction={transaction.senderAddresses} title={'From Address'} />
          <Address transaction={transaction.txid} title={'Transaction ID'} />
          <Box flexDirection={'row'} justifyContent={'space-between'}>
            <Details transaction={transaction.fee} title={'Fees'} />
            <Details transaction={transaction.transactionType} title={'Transaction Type'} />
          </Box>
          <Box flexDirection={'row'} justifyContent={'space-between'}>
            <Details transaction={transaction.type} title={'Privacy'} />
            <Confirmation transaction={transaction.confirmations} title={'Confirmations'} />
          </Box>
        </ScrollView>
      </Box>
    </Box>
  );
};

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    position: 'relative',
  },
});
export default ViewTransactionDetails;
