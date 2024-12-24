/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react/prop-types */
import Text from 'src/components/KeeperText';
import { Pressable, StatusBar, StyleSheet } from 'react-native';
import { Box, ScrollView, useColorMode } from 'native-base';
import React, { useContext, useEffect, useState } from 'react';
import { hp, wp } from 'src/constants/responsive';
import KeeperHeader from 'src/components/KeeperHeader';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import IconRecieve from 'src/assets/images/icon_received_lg.svg';
import IconSend from 'src/assets/images/icon_send_lg.svg';
import IconRecieveDark from 'src/assets/images/icon_received_dark_lg.svg';
import IconSendDark from 'src/assets/images/icon_send_dark_lg.svg';
import useBalance from 'src/hooks/useBalance';
import moment from 'moment';
import { Transaction } from 'src/services/wallets/interfaces';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import { useAppSelector } from 'src/store/hooks';
import BTC from 'src/assets/images/btc.svg';

function TabBar({ tabs, activeTab, setActiveTab }) {
  const { colorMode } = useColorMode();

  return (
    <Box style={styles.tabBarContainer} borderColor={`${colorMode}.border`}>
      {tabs.map((tab, index) => (
        <Pressable
          key={index}
          onPress={() => {
            setActiveTab(index);
          }}
          style={styles.tabBarItem}
        >
          <Box
            style={styles.tabBar}
            backgroundColor={
              activeTab === index ? `${colorMode}.pantoneGreen` : `${colorMode}.secondaryBackground`
            }
            borderLeftRadius={index === 0 ? 14 : 0}
            borderBottomLeftRadius={index === 0 ? 14 : 0}
            borderTopRightRadius={index === tabs.length - 1 ? 14 : 0}
            borderBottomRightRadius={index === tabs.length - 1 ? 14 : 0}
          >
            <Text
              color={
                activeTab === index && colorMode === 'light'
                  ? `${colorMode}.white`
                  : `${colorMode}.primaryText`
              }
            >
              {tab.label}
            </Text>
          </Box>
        </Pressable>
      ))}
    </Box>
  );
}

function Address({ address, activeTab, colorMode }) {
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const isCurrentCurrencyFiat = currentCurrency === CurrencyKind.FIAT;
  return (
    <Box style={styles.addressContainer}>
      {activeTab === 0 ? (
        colorMode === 'dark' ? (
          <IconSendDark width={wp(18)} height={hp(18)} />
        ) : (
          <IconSend width={wp(18)} height={hp(18)} />
        )
      ) : colorMode === 'dark' ? (
        <IconRecieveDark width={wp(18)} height={hp(18)} />
      ) : (
        <IconRecieve width={wp(18)} height={hp(18)} />
      )}
      {typeof address === 'string' ? (
        <Box width={'90%'}>
          <Text
            ellipsizeMode="middle"
            numberOfLines={1}
            color={`${colorMode}.transactionDeatilAddress`}
          >
            {address}
          </Text>
        </Box>
      ) : (
        <Box width={'90%'} flexDirection={'row'} justifyContent={'space-between'}>
          <Text
            ellipsizeMode="middle"
            numberOfLines={1}
            maxWidth={'50%'}
            color={`${colorMode}.transactionDeatilAddress`}
          >
            {address.address}
          </Text>
          <Text
            ellipsizeMode="middle"
            numberOfLines={1}
            color={`${colorMode}.transactionDeatilAddress`}
          >
            {!isCurrentCurrencyFiat &&
              getCurrencyIcon(BTC, colorMode === 'light' ? 'dark' : 'light')}
            {` ${getBalance(address.amount)} `}
            {getSatUnit()}
          </Text>
        </Box>
      )}
    </Box>
  );
}

function TransactionAdvancedDetails({ route }) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance } = useBalance();

  const { translations } = useContext(LocalizationContext);
  const { transactions } = translations;
  const { transaction, showTnxId = true }: { transaction: Transaction; showTnxId: boolean } =
    route.params;
  const [activeTab, setActiveTab] = useState(0);
  const [addresses, setAdresses] = useState([]);

  const tabsData = [{ label: transactions.inputs }, { label: transactions.outputs }];

  useEffect(() => {
    if (activeTab === 0) {
      setAdresses(transaction.senderAddresses);
    } else {
      setAdresses(transaction.recipientAddresses);
    }
  }, [transaction, activeTab]);

  const { top } = useSafeAreaInsets();
  return (
    <Box
      backgroundColor={`${colorMode}.primaryBackground`}
      style={[styles.wrapper, { paddingTop: top }]}
    >
      <StatusBar
        barStyle={colorMode === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor="transparent"
      />
      <Box style={[styles.topSection, !showTnxId && { height: '17%' }]}>
        <KeeperHeader title={transactions.advancedDetails} />
        {showTnxId && (
          <Box style={styles.transViewWrapper}>
            <Box style={styles.transViewIcon}>
              {transaction.transactionType === 'Received' ? (
                colorMode === 'dark' ? (
                  <IconRecieveDark />
                ) : (
                  <IconRecieve />
                )
              ) : colorMode === 'dark' ? (
                <IconSendDark />
              ) : (
                <IconSend />
              )}
              <Box style={styles.transView}>
                <Text
                  color={`${colorMode}.transactionDeatilAddress`}
                  numberOfLines={1}
                  style={styles.transIDText}
                >
                  {transaction.txid}
                </Text>
                <Text style={styles.transDateText} color={`${colorMode}.transactionDeatilAddress`}>
                  {moment(transaction?.date).format('DD MMM YY  •  HH:mm A')}
                </Text>
              </Box>
            </Box>
            <Box>
              <Text style={styles.amountText}>
                {`${getBalance(transaction.amount)} `}
                <Text color={`${colorMode}.dateText`} style={styles.unitText}>
                  {getSatUnit()}
                </Text>
              </Text>
            </Box>
          </Box>
        )}
      </Box>
      <Box style={styles.bottomSection} backgroundColor={`${colorMode}.secondaryBackground`}>
        <Box style={styles.tabBarWrapper}>
          <TabBar tabs={tabsData} activeTab={activeTab} setActiveTab={setActiveTab} />
        </Box>
        <Box style={styles.divider} />
        <ScrollView
          contentContainerStyle={styles.addressListContainer}
          showsVerticalScrollIndicator={false}
        >
          <Box style={styles.addressWrapper}>
            {addresses.map((address, index) => (
              <Address key={index} address={address} activeTab={activeTab} colorMode={colorMode} />
            ))}
          </Box>
        </ScrollView>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  topSection: {
    height: '30%',
    paddingTop: hp(17),
    paddingHorizontal: 20,
  },
  bottomSection: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    paddingTop: hp(10),
  },
  transViewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(25),
    paddingLeft: wp(12.5),
    width: wp(320),
    justifyContent: 'space-between',
    paddingBottom: hp(25),
  },
  transViewIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transView: {
    marginLeft: wp(10),
    width: wp(120),
  },
  transDateText: {
    fontSize: 12,
  },
  transIDText: {
    fontSize: 14,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '400',
  },
  unitText: {
    fontSize: 14,
    fontWeight: '400',
  },
  tabBarContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: '85%',
    height: hp(38),
    borderWidth: 1,
    borderRadius: 15,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarWrapper: {
    width: '100%',
    position: 'absolute',
    top: '-3.5%',
    left: '7.5%',
  },
  addressContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    width: wp(322),
    gap: 7,
    paddingLeft: wp(10),
  },
  addressWrapper: {
    marginTop: hp(25),
    gap: 15,
  },
  addressListContainer: {
    flex: 1,
  },
  divider: {
    height: hp(25),
  },
});
export default TransactionAdvancedDetails;
