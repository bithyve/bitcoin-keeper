import { Box, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import KeeperQRCode from 'src/components/KeeperQRCode';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletCopiableData from 'src/components/WalletCopiableData';
import WalletHeader from 'src/components/WalletHeader';
import { hp, windowWidth } from 'src/constants/responsive';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';

const RecieveUsdt = ({ route }) => {
  const { usdtWallet }: { usdtWallet: USDTWallet } = route.params;
  const details = usdtWallet.accountStatus.gasFreeAddress;
  const { colorMode } = useColorMode();

  return (
    <ScreenWrapper>
      <Box flex={1} justifyContent="flex-start">
        <WalletHeader title="Receive" />

        <Box style={styles.container} borderColor={`${colorMode}.separator`}>
          <Box borderWidth={15} borderColor={`${colorMode}.buttonText`}>
            {details && <KeeperQRCode qrData={details} size={windowWidth * 0.7} showLogo />}
          </Box>
          <Box>
            <WalletCopiableData
              data={details}
              width={windowWidth * 0.8}
              height={hp(60)}
              dataType="address"
            />
          </Box>
        </Box>

        <Box mt="auto" p={4}>
          <Text bold mb={2} color={`${colorMode}.dashedButtonBorderColor`}>
            Note
          </Text>
          <Text color={`${colorMode}.primaryText`}>
            Please send only USDT on the Tron network to this address. Any other assets or networks
            may result in a loss of funds.
          </Text>
        </Box>
      </Box>
    </ScreenWrapper>
  );
};

export default RecieveUsdt;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: hp(20),
    borderWidth: 1,
    paddingTop: 20,
  },
});
