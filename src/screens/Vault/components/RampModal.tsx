import { Linking } from 'react-native';
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
    <Box padding={1}>
      <Text color="#073B36" fontSize={13} letterSpacing={0.65} my={1}>
        By proceeding, you understand that Ramp will process the payment and transfer for the
        purchased bitcoin
      </Text>
      <Box
        my={4}
        alignItems="center"
        borderRadius={10}
        p={4}
        backgroundColor="#FDF7F0"
        flexDirection="row"
      >
        <VaultIcon />
        <Box mx={4}>
          <Text fontSize={12} color="#5F6965">
            Bitcoin will be transferred to
          </Text>
          <Text fontSize={19} letterSpacing={1.28} color="#041513">
            {vault.presentationData.name}
          </Text>
          <Text
            fontStyle="italic"
            fontSize={12}
            color="#00836A"
          >{`Balance: ${vault.specs.balances.confirmed} sats`}</Text>
        </Box>
      </Box>

      <Box
        my={4}
        alignItems="center"
        borderRadius={10}
        px={4}
        py={6}
        backgroundColor="#FDF7F0"
        flexDirection="row"
      >
        <Box
          backgroundColor="#FAC48B"
          borderRadius={20}
          height={10}
          width={10}
          justifyItems="center"
          alignItems="center"
        >
          <Text fontSize={22}>@</Text>
        </Box>
        <Box mx={4}>
          <Text fontSize={12} color="#5F6965">
            Address for ramp transactions
          </Text>
          <Text
            width={wp(200)}
            ellipsizeMode="middle"
            numberOfLines={1}
            fontSize={19}
            letterSpacing={1.28}
            color="#041513"
          >
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
    </Box>
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

export default RampModal;
