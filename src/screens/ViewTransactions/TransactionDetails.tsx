import Text from 'src/components/KeeperText';
import { TouchableOpacity } from 'react-native';
import { Box, ScrollView } from 'native-base';
import React, { useContext } from 'react';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import { ScaledSheet } from 'react-native-size-matters';
// components, interfaces
import HeaderTitle from 'src/components/HeaderTitle';
import StatusBarComponent from 'src/components/StatusBarComponent';
import { LocalizationContext } from 'src/common/content/LocContext';
import openLink from 'src/utils/OpenLink';
// asserts
import IconRecieve from 'src/assets/images/icon_received_lg.svg';
import IconSend from 'src/assets/images/icon_send_lg.svg';
import Link from 'src/assets/images/link.svg';
import { getAmt, getUnit } from 'src/common/constants/Bitcoin';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import config from 'src/core/config';
import { NetworkType } from 'src/core/wallets/enums';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';

function TransactionDetails({ route }) {
  const navigation = useNavigation();
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind)
  const { translations } = useContext(LocalizationContext);
  const { transactions } = translations;
  const { transaction } = route.params;

  function InfoCard({
    title,
    describtion,
    width = 320,
    icon,
    letterSpacing = 1,
    numberOfLines = 1,
  }) {
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
        <Box style={[icon && { flexDirection: 'row', width: '100%', alignItems: 'center' }]}>
          <Box width={icon ? '90%' : '100%'}>
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
              letterSpacing={letterSpacing}
              color="light.GreyText"
              width={icon ? '60%' : '90%'}
              numberOfLines={numberOfLines}
            >
              {describtion}
            </Text>
          </Box>
          {icon && <Link />}
        </Box>
      </Box>
    );
  }
  const redirectToBlockExplorer = () => {
    openLink(
      `https://blockstream.info${config.NETWORK_TYPE === NetworkType.TESTNET ? '/testnet' : ''
      }/tx/${transaction.txid}`
    );
  };
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
        <Box style={styles.transViewWrapper}>
          <Box flexDirection="row">
            {transaction.transactionType === 'Received' ? <IconRecieve /> : <IconSend />}
            <Box style={styles.transView}>
              <Text color="light.headerText" numberOfLines={1} style={styles.transIDText}>
                {transaction.txid}
              </Text>
              <Text style={styles.transDateText} color="light.dateText">
                {moment(transaction?.date).format('DD MMM YY  •  hh:mma')}
              </Text>
            </Box>
          </Box>
          <Box>
            <Text style={styles.amountText}>
              {`${getAmt(transaction.amount, exchangeRates, currencyCode, currentCurrency)} `}
              <Text color="light.dateText" style={styles.unitText}>
                {getUnit(currentCurrency)}
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box style={styles.infoCardsWrapper}>
          <InfoCard
            title="To Addresses"
            describtion={transaction.recipientAddresses.toString().replace(/,/g, '\n')}
            icon={false}
            numberOfLines={transaction.recipientAddresses.length}
          />
          <InfoCard
            title="From Addresses"
            describtion={transaction.senderAddresses.toString().replace(/,/g, '\n')}
            icon={false}
            numberOfLines={transaction.senderAddresses.length}
          />
          <TouchableOpacity onPress={redirectToBlockExplorer}>
            <InfoCard
              title="Transaction ID"
              describtion={transaction.txid}
              icon={true}
              letterSpacing={2.4}
            />
          </TouchableOpacity>
          {transaction.notes && (
            <InfoCard
              title="Note"
              describtion={transaction.notes}
              icon={false}
              letterSpacing={2.4}
            />
          )}
          <InfoCard
            title="Fee"
            describtion={transaction.fee + ' sats'}
            icon={false}
            letterSpacing={2.4}
          />
          <InfoCard
            title="Confirmations"
            describtion={transaction.confirmations > 6 ? '6+' : transaction.confirmations}
            icon={false}
            letterSpacing={2.4}
          />
        </Box>
      </ScrollView>
    </Box>
  );
}

const styles = ScaledSheet.create({
  Container: {
    flex: 1,
    padding: '20@s',
    backgroundColor: 'light.secondaryBackground',
  },
  transViewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(40),
    width: wp(320),
    justifyContent: 'space-between',
    paddingBottom: hp(25),
  },
  transView: {
    marginLeft: wp(10),
    width: wp(120),
  },
  infoCardsWrapper: {
    alignItems: 'center',
    marginTop: hp(20),
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  transDateText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  transIDText: {
    fontSize: 14,
  },
  amountText: {
    fontSize: 19,
    letterSpacing: 0.95,
  },
  unitText: {
    letterSpacing: 0.6,
    fontSize: hp(12),
  },
});
export default TransactionDetails;
