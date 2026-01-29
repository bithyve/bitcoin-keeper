import { Box, StatusBar, useColorMode } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import LinearGradient from 'react-native-linear-gradient';
import CardPill from 'src/components/CardPill';
import Text from 'src/components/KeeperText';
import BalanceComponent from 'src/screens/Home/components/BalanceComponent';
import Colors from 'src/theme/Colors';
import WalletHeader from 'src/components/WalletHeader';
import ThemedSvg from 'src/components/ThemedSvg.tsx/ThemedSvg';
import { EntityKind } from 'src/services/wallets/enums';
import WalletLine from 'src/assets/images/walletCardLines.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import useWalletAsset from 'src/hooks/useWalletAsset';

interface Props {
  settingCallBack?: () => void;
  backgroundColor?: any;
  tags?: { tag: string; color: string }[];
  setIsShowAmount?: any;
  isShowAmount?: boolean;
  title?: string;
  description?: string;
  totalBalance?: number;
  allowHideBalance?: boolean;
  wallet?: any;
}

const WalletDetailHeader = ({
  backgroundColor,
  settingCallBack,
  tags,
  setIsShowAmount,
  isShowAmount,
  title,
  description,
  totalBalance,
  allowHideBalance,
  wallet,
}: Props) => {
  const iconWidth = 40;
  const iconHeight = 34;
  const { colorMode } = useColorMode();
  const { getWalletIcon } = useWalletAsset();
  const WalletIcon = getWalletIcon(wallet);
  return (
    <Box safeAreaTop style={styles.container}>
      <StatusBar barStyle={colorMode === 'dark' ? 'light-content' : 'dark-content'} />
      <WalletHeader
        rightComponent={
          <TouchableOpacity onPress={() => settingCallBack()}>
            <ThemedSvg name={'enhanced_setting_icon'} height={20} width={20} />
          </TouchableOpacity>
        }
      />
      <LinearGradient
        colors={backgroundColor}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.cardContainer]}
      >
        <WalletLine style={styles.walletLine} width={wp(180)} height={hp(200)} />
        <Box style={styles.topRow}>
          <Box>
            <HexagonIcon
              width={iconWidth}
              height={iconHeight}
              backgroundColor={
                wallet.entityKind === EntityKind.USDT_WALLET
                  ? Colors.aqualightMarine
                  : Colors.CyanGreen
              }
              icon={<WalletIcon />}
            />
          </Box>
          <Box style={{ flex: 1 }}>
            <Box style={styles.pillsContainer}>
              <Box style={styles.pillsContainer}>
                {tags?.map(({ tag, color }) => (
                  <CardPill key={tag} heading={tag} backgroundColor={color} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box style={styles.bottomRow}>
          <Box>
            <Text color={Colors.headerWhite} style={{}}>
              {description}
            </Text>
            <Text semiBold color={Colors.headerWhite} style={styles.title}>
              {title}
            </Text>
          </Box>
          <BalanceComponent
            setIsShowAmount={setIsShowAmount ? setIsShowAmount : () => {}}
            isShowAmount={allowHideBalance ? isShowAmount : true}
            balance={totalBalance}
            wallet={wallet}
            BalanceFontSize={20}
            ctrStyle={styles.amount}
          />
        </Box>
      </LinearGradient>
    </Box>
  );
};

export default WalletDetailHeader;
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(22),
    paddingTop: hp(40),
  },
  cardContainer: {
    flexDirection: 'column',
    width: windowWidth * 0.88,
    height: wp(180),
    paddingHorizontal: wp(18),
    paddingVertical: wp(16),
    borderRadius: 15,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
    marginTop: hp(5),
  },
  topRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  walletLine: {
    position: 'absolute',
    top: -15,
    right: -25,
    zIndex: 0,
  },
  title: {
    marginTop: hp(2),
    fontSize: 16,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  amount: {
    marginHorizontal: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
