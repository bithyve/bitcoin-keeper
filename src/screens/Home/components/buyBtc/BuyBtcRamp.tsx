import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import RampNetwork from 'src/assets/images/ramp-network.svg';
import RampNetworkDark from 'src/assets/images/ramp-dark-logo.svg';
import { hp, wp } from 'src/constants/responsive';
import Text from 'src/components/KeeperText';
import HexagonIcon from 'src/components/HexagonIcon';
import MultiSendSvg from 'src/assets/images/@.svg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import { useRoute } from '@react-navigation/native';
import Buttons from 'src/components/Buttons';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type Props = {};

const BuyBtcRamp = ({}: Props) => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === 'dark';
  const buyBitCoinHexagonBackgroundColor = ThemedColor({
    name: 'buyBitCoinHexagonBackgroundColor',
  });
  const route = useRoute();
  const { selectedWallet } = route.params as any;
  const { translations } = useContext(LocalizationContext);
  const { buyBTC: buyBTCText, common } = translations;

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <Box style={styles.container}>
        <WalletHeader title={buyBTCText.rampTitle} />
        <Text fontSize={13} color={`${colorMode}.primaryText`} style={{ marginTop: hp(15) }}>
          {buyBTCText.rampSubTitle}
        </Text>
        <Box
          style={styles.cardWrapper}
          backgroundColor={`${colorMode}.primaryBackground`}
          borderColor={`${colorMode}.separator`}
        >
          {isDarkMode ? <RampNetworkDark /> : <RampNetwork />}
          <Text>{buyBTCText.buyBTCWithoutExchange}</Text>
        </Box>
        <Text color={`${colorMode}.primaryText`} medium style={{ marginBottom: hp(10) }}>
          {buyBTCText.addressForTransaction}
        </Text>
        <Box
          style={styles.addressContainer}
          backgroundColor={`${colorMode}.primaryBackground`}
          borderColor={`${colorMode}.separator`}
        >
          <HexagonIcon
            width={wp(39)}
            height={hp(35)}
            backgroundColor={buyBitCoinHexagonBackgroundColor}
            icon={<MultiSendSvg />}
          />
          <Text color={`${colorMode}.primaryText`} fontSize={12} style={styles.addressText}>
            {selectedWallet}
          </Text>
        </Box>
      </Box>
      <Box style={styles.ButtonContainer}>
        <Text>{buyBTCText.rampPayment}</Text>
        <Buttons primaryText={common.proceed} fullWidth />
      </Box>
    </ScreenWrapper>
  );
};

export default BuyBtcRamp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardWrapper: {
    paddingHorizontal: hp(20),
    paddingVertical: hp(20),
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: hp(20),
    gap: hp(10),
  },
  addressContainer: {
    paddingHorizontal: hp(20),
    paddingVertical: hp(20),
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: hp(20),
    gap: hp(10),
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    width: '80%',
  },
  ButtonContainer: {
    gap: hp(20),
    paddingVertical: hp(20),
  },
});
