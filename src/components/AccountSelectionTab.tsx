import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, Pressable, useColorMode } from 'native-base';

import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import GradientIcon from 'src/screens/WalletDetails/components/GradientIcon';

import PreMix from 'src/assets/images/icon_premix.svg';
import PostMix from 'src/assets/images/icon_postmix.svg';
import Deposit from 'src/assets/images/icon_deposit.svg';
import BadBank from 'src/assets/images/icon_badbank.svg';
import { WalletType } from 'src/services/wallets/enums';

const AccountTabs = [
  {
    title: 'Deposit',
    Icon: Deposit,
    type: WalletType.DEFAULT,
  },
  {
    title: 'Premix',
    Icon: PreMix,
    type: WalletType.PRE_MIX,
  },
  {
    title: 'Postmix',
    Icon: PostMix,
    type: WalletType.POST_MIX,
  },
  {
    title: 'BadBank',
    Icon: BadBank,
    type: WalletType.BAD_BANK,
  },
];

function SingleAccount({ title, Icon, gradient, bold = false, onPress, index }) {
  const { colorMode } = useColorMode();
  return (
    <Box style={{ flexDirection: 'row' }}>
      <Pressable style={{ alignItems: 'center' }} onPress={onPress}>
        <GradientIcon Icon={Icon} height={hp(45)} gradient={gradient} />
        <Text
          numberOfLines={2}
          bold={bold}
          color={`${colorMode}.GreyText`}
          style={styles.accountText}
        >
          {title}
        </Text>
      </Pressable>
      {index === AccountTabs.length - 1 ? null : <Divider />}
    </Box>
  );
}

function Divider() {
  return <Box style={styles.divider} />;
}

export function AccountSelectionTab({
  selectedAccount,
  setSelectedAccount,
  updateSelectedWallet,
  setEnableSelection,
}) {
  return (
    <Box style={styles.container}>
      {AccountTabs.map((account, index) => (
        <Box key={account.title}>
          <SingleAccount
            title={account.title}
            Icon={account.Icon}
            bold={account.type === selectedAccount}
            gradient={
              account.type === selectedAccount
                ? ['light.primaryGreen', 'light.gradientEnd']
                : ['#BFBFBF', '#BFBFBF']
            }
            onPress={() => {
              updateSelectedWallet(account.type);
              setSelectedAccount(account.type);
              setEnableSelection(false);
            }}
            index={index}
          />
        </Box>
      ))}
    </Box>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  accountText: {
    fontSize: 12,
    letterSpacing: 1,
    width: wp(60),
    textAlign: 'center',
    marginTop: hp(8),
  },
  divider: {
    borderRightColor: '#005545',
    borderRightWidth: 1,
    opacity: 0.1,
    marginHorizontal: wp(10),
  },
});
