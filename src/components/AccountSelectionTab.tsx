import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, HStack, Pressable } from 'native-base';

import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/common/data/responsiveness/responsive';
import GradientIcon from 'src/screens/WalletDetailScreen/components/GradientIcon';

import PreMix from 'src/assets/images/icon_premix.svg';
import PostMix from 'src/assets/images/icon_postmix.svg';
import Deposit from 'src/assets/images/icon_deposit.svg';
import BadBank from 'src/assets/images/icon_badbank.svg';

export const enum AccountTypes {
  DEPOSIT = 'DEPOSIT',
  PREMIX = 'PREMIX',
  POSTMIX = 'POSTMIX',
  BADBANK = 'BADBANK',
}

const AccountTabs = [
  {
    title: 'Deposit Account',
    Icon: Deposit,
    type: AccountTypes.DEPOSIT,
  },
  {
    title: 'Premix Account',
    Icon: PreMix,
    type: AccountTypes.PREMIX,
  },
  {
    title: 'Postmix Account',
    Icon: PostMix,
    type: AccountTypes.POSTMIX,
  },
  {
    title: 'BadBank Account',
    Icon: BadBank,
    type: AccountTypes.BADBANK,
    isLast: true,
  },
];

const SingleAccount = ({ title, Icon, gradient, bold = false, onPress, isLast }) => {
  return (
    <Box style={{ flexDirection: 'row' }}>
      <Pressable style={{ alignItems: 'center' }} onPress={onPress}>
        <GradientIcon Icon={Icon} height={hp(45)} gradient={gradient} />
        <Text numberOfLines={2} bold={bold} color="light.GreyText" style={styles.accountText}>
          {title}
        </Text>
      </Pressable>
      {isLast ? null : <Divider />}
    </Box>
  );
};

const Divider = () => {
  return <Box style={styles.divider} />;
};

export const AccountSelectionTab = ({ selectedAccount, setSelectedAccount }) => {
  return (
    <HStack>
      <Box style={styles.container}>
        {AccountTabs.map((account) => {
          return (
            <Box>
              <SingleAccount
                isLast={account.isLast}
                title={account.title}
                Icon={account.Icon}
                bold={account.type === selectedAccount}
                gradient={
                  account.type === selectedAccount
                    ? ['light.gradientStart', 'light.gradientEnd']
                    : ['#BFBFBF', '#BFBFBF']
                }
                onPress={() => setSelectedAccount(account.type)}
              />
            </Box>
          );
        })}
      </Box>
    </HStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  accountText: {
    fontSize: 13,
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
