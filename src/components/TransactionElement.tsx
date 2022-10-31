import React from 'react';
import { Box, Text } from 'native-base';

import { getAmount, getUnit } from 'src/common/constants/Bitcoin';
import { getTransactionPadding, hp, wp } from 'src/common/data/responsiveness/responsive';
import { Transaction } from 'src/core/wallets/interfaces';

import IconRecieve from 'src/assets/images/svgs/icon_received.svg';
import IconSent from 'src/assets/images/svgs/icon_sent.svg';
import BtcBlack from 'src/assets/images/svgs/btc_black.svg';
import IconArrowGrey from 'src/assets/images/svgs/icon_arrow_grey.svg';
import { TouchableOpacity } from 'react-native';

const TransactionElement = (
  { transaction,
    onPress = () => { } }
    :
    { transaction: Transaction, onPress?: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <Box
        flexDirection={'row'}
        height={getTransactionPadding()}
        borderRadius={10}
        justifyContent={'space-between'}
        alignItems={'center'}
        marginTop={hp(25)}
      >
        <Box flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
          {transaction.transactionType == 'Received' ? <IconRecieve /> : <IconSent />}
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
              {transaction?.txid}
            </Text>
            <Text
              color={'light.dateText'}
              marginX={1}
              fontSize={11}
              fontWeight={100}
              letterSpacing={0.5}
              opacity={0.82}
            >
              {transaction.date}
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
            {getAmount(transaction.amount)}
            <Text color={'light.dateText'} letterSpacing={0.6} fontSize={hp(12)} fontWeight={200}>
              {getUnit()}
            </Text>
          </Text>
          <Box>
            <IconArrowGrey />
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};
export default TransactionElement;