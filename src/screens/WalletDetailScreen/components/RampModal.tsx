import { Linking, StyleSheet, Text } from 'react-native';
import React, { useCallback } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box } from 'native-base';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import Buttons from 'src/components/Buttons';
import { fetchRampReservation } from 'src/services/ramp';
import { wp } from 'src/common/data/responsiveness/responsive';
import GradientIcon from './GradientIcon';

function RampBuyContent({ wallets, walletIndex, setShowBuyRampModal }) {
  const buyWithRamp = (address: string) => {
    try {
      setShowBuyRampModal(false);
      Linking.openURL(fetchRampReservation({ receiveAddress: address }));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Box style={styles.buyBtcWrapper}>
      <Text color="#073B36" style={styles.buyBtcContent}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>
      <Box style={styles.toWalletWrapper}>
        <GradientIcon Icon={WalletInsideGreen} height={35} gradient={['#FFFFFF', '#80A8A1']} />
        <Box style={styles.buyBtcCard}>
          <Text style={styles.buyBtcTitle}>Bitcoin will be transferred to</Text>
          <Text style={styles.presentationName}>{wallets[walletIndex].presentationData.name}</Text>
          <Text
            style={styles.confirmBalanceText}
          >{`Balance: ${wallets[walletIndex].specs.balances.confirmed} sats`}</Text>
        </Box>
      </Box>

      <Box style={styles.atViewWrapper}>
        <Box style={styles.atViewWrapper02}>
          <Text style={styles.atText}>@</Text>
        </Box>
        <Box style={styles.buyBtcCard}>
          <Text style={styles.buyBtcTitle}>Address for ramp transactions</Text>
          <Text
            style={styles.addressTextView}
            ellipsizeMode="middle"
            numberOfLines={1}
          >
            {wallets[walletIndex].specs.receivingAddress}
          </Text>
        </Box>
      </Box>
      <Buttons
        secondaryText="Cancel"
        secondaryCallback={() => {
          setShowBuyRampModal(false);
        }}
        primaryText="Buy Bitcoin"
        primaryCallback={() => buyWithRamp(wallets[walletIndex].specs.receivingAddress)}
      />
    </Box>
  );
}

function RampModal({ showBuyRampModal, setShowBuyRampModal, wallets, walletIndex }) {
  const Content = useCallback(
    () => (
      <RampBuyContent
        wallets={wallets}
        walletIndex={walletIndex}
        setShowBuyRampModal={setShowBuyRampModal}
      />
    ),
    [wallets, walletIndex]
  );
  return (
    <KeeperModal
      visible={showBuyRampModal}
      close={() => {
        setShowBuyRampModal(false);
      }}
      title="Buy bitcoin with Ramp"
      subTitle="Ramp enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available payment methods available may vary based on your country"
      subTitleColor="#5F6965"
      textColor="light.primaryText"
      Content={Content}
    />
  );
}

export default RampModal;

const styles = StyleSheet.create({
  buyBtcWrapper: {
    padding: 1,
  },
  buyBtcContent: {
    fontSize: 13,
    letterSpacing: 0.65,
    marginVertical: 1,
  },
  toWalletWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
  buyBtcCard: {
    marginHorizontal: 20,
  },
  buyBtcTitle: {
    fontSize: 12,
    color: '#5F6965',
  },
  presentationName: {
    fontSize: 19,
    letterSpacing: 1.28,
    color: '#041513',
  },
  confirmBalanceText: {
    fontStyle: 'italic',
    fontSize: 12,
    color: '#00836A',
  },
  atViewWrapper: {
    marginVertical: 4,
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FDF7F0',
    flexDirection: 'row',
  },
  atViewWrapper02: {
    backgroundColor: '#FAC48B',
    borderRadius: 30,
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  atText: {
    fontSize: 21,
    textAlign: 'center',
  },
  addressTextView: {
    width: wp(200),
    fontSize: 19,
    color: "#041513"
  },
});
