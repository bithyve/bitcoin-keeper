import { Linking, StyleSheet } from 'react-native';
import React, { useCallback } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import { Box, useColorMode } from 'native-base';
import WalletInsideGreen from 'src/assets/images/Wallet_inside_green.svg';
import Buttons from 'src/components/Buttons';
import { fetchRampReservation } from 'src/services/ramp';
import { wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import GradientIcon from './GradientIcon';

function RampBuyContent({ balance, setShowBuyRampModal, receivingAddress, name }) {
  const { colorMode } = useColorMode();
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
      <Text color={`${colorMode}.black`} style={styles.buyBtcContent}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>
      <Box style={styles.toWalletWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
        <GradientIcon Icon={WalletInsideGreen} height={35} gradient={['#FFFFFF', '#80A8A1']} />
        <Box style={styles.buyBtcCard}>
          <Text style={styles.buyBtcTitle} color={`${colorMode}.primaryText`}>
            Bitcoin will be transferred to
          </Text>
          <Text style={styles.presentationName} color={`${colorMode}.black`}>
            {name}
          </Text>
          <Text style={styles.confirmBalanceText}>{`Balance: ${balance} sats`}</Text>
        </Box>
      </Box>

      <Box style={styles.atViewWrapper} backgroundColor={`${colorMode}.seashellWhite`}>
        <Box style={styles.atViewWrapper02}>
          <Text style={styles.atText}>@</Text>
        </Box>
        <Box style={styles.buyBtcCard}>
          <Text style={styles.buyBtcTitle} color={`${colorMode}.primaryText`}>
            Address for ramp transactions
          </Text>
          <Text
            style={styles.addressTextView}
            color={`${colorMode}.black`}
            ellipsizeMode="middle"
            numberOfLines={1}
          >
            {receivingAddress}
          </Text>
        </Box>
      </Box>
      <Box style={styles.ctcWrapper}>
        <Buttons
          secondaryText="Cancel"
          secondaryCallback={() => {
            setShowBuyRampModal(false);
          }}
          primaryText="Buy Bitcoin"
          primaryCallback={() => buyWithRamp(receivingAddress)}
        />
      </Box>
    </Box>
  );
}

function RampModal({ showBuyRampModal, setShowBuyRampModal, balance, receivingAddress, name }) {
  const { colorMode } = useColorMode();
  const Content = useCallback(
    () => (
      <RampBuyContent
        balance={balance}
        setShowBuyRampModal={setShowBuyRampModal}
        receivingAddress={receivingAddress}
        name={name}
      />
    ),
    [balance, name, receivingAddress]
  );
  return (
    <KeeperModal
      visible={showBuyRampModal}
      close={() => {
        setShowBuyRampModal(false);
      }}
      title="Buy bitcoin with Ramp"
      subTitle="Ramp enables BTC purchases using Apple Pay, Debit/Credit card, Bank Transfer and open banking where available payment methods available may vary based on your country"
      modalBackground={`${colorMode}.modalWhiteBackground`}
      subTitleColor={`${colorMode}.secondaryText`}
      textColor={`${colorMode}.primaryText`}
      DarkCloseIcon={colorMode === 'dark'}
      Content={Content}
    />
  );
}

export default RampModal;

const styles = StyleSheet.create({
  buyBtcWrapper: {
    padding: 1,
    width: wp(280),
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
    flexDirection: 'row',
  },
  buyBtcCard: {
    marginHorizontal: 20,
  },
  buyBtcTitle: {
    fontSize: 12,
  },
  presentationName: {
    fontSize: 19,
    letterSpacing: 1.28,
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
  },
  ctcWrapper: {
    marginTop: 20,
    paddingRight: 5,
  },
});
