import { Linking, StyleSheet } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import KeeperModal from 'src/components/KeeperModal';
import WalletOperations from 'src/core/wallets/operations';
import { Box } from 'native-base';
import Buttons from 'src/components/Buttons';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import { fetchRampReservation } from 'src/services/ramp';
import { wp } from 'src/common/data/responsiveness/responsive';
import Text from 'src/components/KeeperText';
import { Vault } from 'src/core/wallets/interfaces/vault';

function RampBuyContent({
  vault,
  setShowBuyRampModal,
}: {
  vault: Vault;
  setShowBuyRampModal: (bool) => void;
}) {
  const [buyAddress, setBuyAddress] = useState('');

  useEffect(() => {
    const receivingAddress = WalletOperations.getNextFreeAddress(vault);
    setBuyAddress(receivingAddress);
  }, []);

  const buyWithRamp = (address: string) => {
    try {
      setShowBuyRampModal(false);
      Linking.openURL(fetchRampReservation({ receiveAddress: address }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box style={styles.modalWrapper}>
      <Text color="#073B36" style={styles.contentParaText}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>
      <Box
        style={styles.vaultDetailsWrapper}
        backgroundColor="#FDF7F0"

      >
        <VaultIcon />
        <Box style={styles.vaultTitleWrapper}>
          <Text style={styles.vaultTitle}>
            Bitcoin will be transferred to
          </Text>
          <Text style={styles.vaultPresntName}>
            {vault.presentationData.name}
          </Text>
          <Text style={styles.balanceText}>{`Balance: ${vault.specs.balances.confirmed} sats`}</Text>
        </Box>
      </Box>

      <Box style={styles.addressWrapper}>
        <Box style={styles.atWrapper}>
          <Text style={styles.atText}>@</Text>
        </Box>
        <Box style={styles.addressTitleWrapper}>
          <Text style={styles.addressTitleText}>
            Address for ramp transactions
          </Text>
          <Text style={styles.buyAddressText} ellipsizeMode="middle" numberOfLines={1}>
            {buyAddress}
          </Text>
        </Box>
      </Box>
      <Buttons
        secondaryText="Cancel"
        secondaryCallback={() => {
          setShowBuyRampModal(false);
        }}
        primaryText="Buy Bitcoin"
        primaryCallback={() => buyWithRamp(buyAddress)}
      />
    </Box >
  );
}

function RampModal({ vault, showBuyRampModal, setShowBuyRampModal }: any) {
  const Content = useCallback(
    () => <RampBuyContent vault={vault} setShowBuyRampModal={setShowBuyRampModal} />,
    []
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

const styles = StyleSheet.create({
  modalWrapper: {
    padding: 1,
  },
  contentParaText: {
    fontSize: 13,
    letterSpacing: 0.65,
    marginVertical: 1
  },
  vaultDetailsWrapper: {
    marginVertical: 5,
    alignItems: "center",
    borderRadius: 10,
    padding: 5,
    flexDirection: "row"
  },
  vaultTitleWrapper: {
    marginHorizontal: 10
  },
  vaultTitle: {
    fontSize: 12,
    color: "#5F6965"
  },
  vaultPresntName: {
    fontSize: 19,
    letterSpacing: 1.28,
    color: "#041513"
  },
  balanceText: {
    fontStyle: "italic",
    fontSize: 12,
    color: "#00836A"
  },
  addressWrapper: {
    marginVertical: 4,
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 6,
    backgroundColor: "#FDF7F0",
    flexDirection: "row"
  },
  atWrapper: {
    backgroundColor: "#FAC48B",
    borderRadius: 45,
    height: 45,
    width: 45,
    alignItems: 'center',
    justifyContent: 'center'
  },
  atText: {
    fontSize: 22,
  },
  addressTitleWrapper: {
    marginHorizontal: 10
  },
  addressTitleText: {
    fontSize: 12,
    color: "#5F6965"
  },
  buyAddressText: {
    width: wp(200),
    fontSize: 19,
    color: "#041513"
  }
})

export default RampModal;
