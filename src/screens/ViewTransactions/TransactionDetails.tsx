import Text from 'src/components/KeeperText';
import { Box } from 'native-base';
import React, { useContext } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
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
import { useNavigation } from '@react-navigation/native';

function TransactionDetails({ route }) {
  const navigation = useNavigation();
  const { translations } = useContext(LocalizationContext);
  const { transactions } = translations;
  const { transaction } = route.params;

  function InfoCard({ title, describtion, width = 320 }) {
    return (
      <Box
        backgroundColor="light.primaryBackground"
        style={{
          height: hp(65),
          width: wp(width),
          marginVertical: hp(7),
          justifyContent: 'center',
          paddingLeft: wp(15),
          borderRadius: 10,
          padding: 3,
        }}
      >
        <Text
          fontSize={14}
          letterSpacing={1.12}
          color="light.headerText"
          width="90%"
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          fontSize={12}
          letterSpacing={2.4}
          color="light.GreyText"
          width="90%"
          numberOfLines={1}
        >
          {describtion}
        </Text>
      </Box>
    );
  }

  return (
    <Box style={styles.Container}>
      <StatusBarComponent padding={50} />
      <Box width={wp(250)}>
        <HeaderTitle
          onPressHandler={() => navigation.goBack()}
          title={transactions.TransactionDetails}
          subtitle=""
          paddingTop={hp(20)}
        />
        <Box
          flexDirection="row"
          alignItems="center"
          marginTop={hp(40)}
          width={wp(320)}
          justifyContent="space-between"
        >
          <Box flexDirection="row">
            {transaction.transactionType === 'Received' ? <IconRecieve /> : <IconSend />}
            <Box
              style={{
                marginLeft: wp(10),
                width: wp(100),
              }}
            >
              <Text
                fontSize={14}
                letterSpacing={0.7}
                color="light.headerText"
                numberOfLines={1}
                width={wp(120)}
              >
                {transaction.address}
              </Text>
              <Text fontSize={10} letterSpacing={0.5} color="light.dateText">
                {transaction.date}
              </Text>
            </Box>
          </Box>
          <Box>
            <Text fontSize={19} letterSpacing={0.95}>
              {`${getAmount(transaction.amount)} `}
              <Text color="light.dateText" letterSpacing={0.6} fontSize={hp(12)}>
                {getUnit()}
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>

      <Box alignItems="center" marginTop={hp(44)} justifyContent="center" marginX={3}>
        <InfoCard title="To Address" describtion={transaction.recipientAddresses} />
        <InfoCard title="From Address" describtion={transaction.senderAddresses} />
        <InfoCard title="Transaction ID" describtion={transaction.txid} />
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
          <InfoCard title="Fee" describtion={transaction.fee} width={145} />
          <InfoCard title="Type" describtion={transaction.transactionType} width={145} />
        </Box>
        <Box flexDirection="row" justifyContent="space-between" width="100%">
          <InfoCard title="Privacy" describtion={transaction.type} width={145} />
          <InfoCard title="Confirmations" describtion={transaction.confirmations} width={145} />
        </Box>
      </Box>
    </Box>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.ReceiveBackground',
  },
});
export default TransactionDetails;
