import React from 'react';
import { Box, HStack, useColorMode, VStack } from 'native-base';
import { NetworkAmount } from 'src/constants/Bitcoin';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp, hp } from 'src/constants/responsive';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import { Vault } from 'src/core/wallets/interfaces/vault';

function VaultInfo({ vault }: { vault: Vault }) {
  const { colorMode } = useColorMode();
  const {
    presentationData: { name, description } = { name: '', description: '' },
    specs: { balances: { confirmed, unconfirmed } } = {
      balances: { confirmed: 0, unconfirmed: 0 },
    },
  } = vault;
  const exchangeRates = useExchangeRates();
  const currencyCode = useCurrencyCode();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);

  const styles = getStyles(0);
  return (
    <VStack style={styles.vaultWrapper}>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack>
          <Box paddingRight={3}>
            <VaultIcon />
          </Box>
          <VStack>
            <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={16}>
              {name}
            </Text>
            <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={12}>
              {description}
            </Text>
          </VStack>
        </HStack>
        <VStack alignItems="flex-end">
          <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={9}>
            Unconfirmed
          </Text>
          {NetworkAmount(
            unconfirmed,
            exchangeRates,
            currencyCode,
            currentCurrency,
            [styles.vaultInfoText, { fontSize: 12 }],
            0.9
          )}
        </VStack>
      </HStack>
      <VStack paddingBottom="16" paddingTop="6">
        {NetworkAmount(confirmed, exchangeRates, currencyCode, currentCurrency, [
          styles.vaultInfoText,
          { fontSize: 31, lineHeight: 31 },
          2,
        ])}
        <Text color={`${colorMode}.white`} style={styles.vaultInfoText} fontSize={9}>
          Available Balance
        </Text>
      </VStack>
    </VStack>
  );
}

const getStyles = (top) =>
  StyleSheet.create({
    container: {
      paddingTop: Math.max(top, 35),
      justifyContent: 'space-between',
      flex: 1,
    },
    IconText: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    vaultInfoText: {
      marginLeft: wp(3),
      letterSpacing: 1.28,
    },
    vaultWrapper: {
      marginTop: hp(30),
    },
  });

export default VaultInfo;
