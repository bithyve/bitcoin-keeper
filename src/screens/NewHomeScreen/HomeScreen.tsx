/* eslint-disable react/no-unstable-nested-components */
import { Linking, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { Box, useColorMode } from 'native-base';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ActionCard from 'src/components/ActionCard';
import WalletInfoCard from 'src/components/WalletInfoCard';
import AddCard from 'src/components/AddCard';

import HomeScreenWrapper from './components/HomeScreenWrapper';
import BalanceComponent from './components/BalanceComponent';

import WalletIcon from 'src/assets/images/daily_wallet.svg';

const NewHomeScreen = () => {
  const { colorMode } = useColorMode();
  const { top } = useSafeAreaInsets();

  const dummyData = [
    {
      name: 'Setup Inheritance',
      icon: null,
    },
    {
      name: 'Buy Bitcoin',
      icon: null,
    },
    {
      name: 'Manage All Signers',
      icon: null,
    },
  ];

  const styles = getStyles(colorMode);
  return (
    <Box style={styles.container}>
      <Box
        backgroundColor={`${colorMode}.primaryGreenBackground`}
        style={[styles.wrapper, { paddingTop: top, paddingLeft: 10 }]}
      >
        <HomeScreenWrapper>
          <Box style={styles.actionContainer}>
            {dummyData.map((data, index) => (
              <ActionCard key={`${index}_${data.name}`} cardName={data.name} />
            ))}
          </Box>
        </HomeScreenWrapper>
      </Box>
      <Box style={styles.valueWrapper}>
        <BalanceComponent wallets={'01'} balance={'0.00'} />
        <Box style={{ flexDirection: 'row', gap: 20, marginVertical: 20 }}>
          <WalletInfoCard
            walletName="Daily Spending"
            walletDescription="for smaller amounts"
            icon={<WalletIcon />}
            amount={21000}
          />
          <AddCard name={'Add'} cardStyles={{ height: 260, width: 130 }} />
        </Box>
      </Box>
    </Box>
  );
};
export default NewHomeScreen;

const getStyles = (colorMode) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: `${colorMode}.pantoneGreen` },
    valueWrapper: {
      flex: 0.7,
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      flex: 0.3,
      paddingHorizontal: 15,
      paddingVertical: 8,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    actionContainer: {
      flexDirection: 'row',
      gap: 10,
      marginTop: -70,
    },
  });
