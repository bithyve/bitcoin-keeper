import { Box, useColorMode } from 'native-base';
import React, { useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import HexagonIcon from 'src/components/HexagonIcon';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import WalletHeader from 'src/components/WalletHeader';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import ThemedColor from 'src/components/ThemedColor/ThemedColor';
import KeyPadView from 'src/components/AppNumPad/KeyPadView';
import Buttons from 'src/components/Buttons';
import DeleteDarkIcon from 'src/assets/images/delete.svg';
import DeleteIcon from 'src/assets/images/deleteLight.svg';
import { hp, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useToastMessage from 'src/hooks/useToastMessage';

const UsdtAmount = ({ route }) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;
  const { showToast } = useToastMessage();

  const HexagonIconColor = ThemedColor({ name: 'HexagonIcon' });

  const [amount, setAmount] = useState('0');
  const [errorMessage, setErrorMessage] = useState('');

  const onPressNumber = (text) => {
    if (errorMessage) {
      showToast(errorMessage);
      return;
    }

    if (text === 'x') {
      onDeletePressed();
      return;
    }

    if (text === '.') {
      if (amount.includes('.')) return;
      setAmount((prev) => (prev === '0' ? '0.' : prev + '.'));
      return;
    }

    if (amount === '0') {
      setAmount(text);
    } else {
      const newAmount = amount + text;
      const parts = newAmount.split('.');
      if (parts[1] && parts[1].length > 2) return;
      setAmount(newAmount);
    }
  };

  const onDeletePressed = () => {
    if (amount.length <= 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleSend = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Invalid amount');
      showToast('Please enter a valid amount');
      return;
    }
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <WalletHeader title="Enter Amount" />

      <Box
        style={styles.container}
        backgroundColor={`${colorMode}.boxSecondaryBackground`}
        borderColor={`${colorMode}.separator`}
      >
        <HexagonIcon
          backgroundColor={HexagonIconColor}
          icon={<UsdtWalletLogo width={16} height={16} />}
          width={33}
          height={30}
        />
        <Box>
          <Text bold>USDT Wallet</Text>
          <Text color={`${colorMode}.greyText`}>Balance: 5000 USDT</Text>
        </Box>
      </Box>

      <Box style={styles.amountWrapper}>
        <Text fontSize={32} color={`${colorMode}.primaryText`}>
          {amount}{' '}
        </Text>
        <Text fontSize={25} color={`${colorMode}.greyText`}>
          USDT
        </Text>
      </Box>

      <KeyPadView
        onPressNumber={onPressNumber}
        onDeletePressed={onDeletePressed}
        enableDecimal
        keyColor={`${colorMode}.keyPadText`}
        ClearIcon={colorMode === 'dark' ? <DeleteIcon /> : <DeleteDarkIcon />}
      />

      <Box style={styles.ctaBtnWrapper}>
        <Buttons
          primaryText={common.done}
          primaryDisable={parseFloat(amount) <= 0 || !!errorMessage}
          primaryCallback={handleSend}
          fullWidth
        />
      </Box>
    </ScreenWrapper>
  );
};

export default UsdtAmount;

const styles = StyleSheet.create({
  container: {
    marginTop: hp(20),
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(16),
    paddingHorizontal: wp(20),
    borderRadius: 10,
    gap: wp(10),
  },
  ctaBtnWrapper: {
    marginTop: hp(30),
  },

  amountWrapper: {
    marginTop: '46%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
});
