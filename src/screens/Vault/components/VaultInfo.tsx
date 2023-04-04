import React from 'react';
import { Box, HStack, VStack } from 'native-base';
import { getNetworkAmount } from 'src/common/constants/Bitcoin';
import useExchangeRates from 'src/hooks/useExchangeRates';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import { useAppSelector } from 'src/store/hooks';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { wp, windowHeight } from 'src/common/data/responsiveness/responsive';
import VaultIcon from 'src/assets/images/icon_vault.svg';
import { Vault } from 'src/core/wallets/interfaces/vault';

function VaultInfo({ vault }: { vault: Vault }) {
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
    <VStack paddingY={windowHeight > 670 ? 12 : 5}>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack>
          <Box paddingRight={3}>
            <VaultIcon />
          </Box>
          <VStack>
            <Text color="light.white" style={styles.vaultInfoText} fontSize={16}>
              {name}
            </Text>
            <Text color="light.white" style={styles.vaultInfoText} fontSize={12}>
              {description}
            </Text>
          </VStack>
        </HStack>
        <VStack alignItems="flex-end">
          <Text color="light.white" style={styles.vaultInfoText} fontSize={9}>
            Unconfirmed
          </Text>
          {getNetworkAmount(
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
        {getNetworkAmount(confirmed, exchangeRates, currencyCode, currentCurrency, [
          styles.vaultInfoText,
          { fontSize: 31, lineHeight: 31 },
          2,
        ])}
        <Text color="light.white" style={styles.vaultInfoText} fontSize={9}>
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
  });

export default VaultInfo;
