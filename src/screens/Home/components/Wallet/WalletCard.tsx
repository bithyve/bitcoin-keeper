import React from 'react';
import { Box } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import WalletLine from 'src/assets/images/walletCardLines.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import BalanceComponent from '../BalanceComponent';
import CardPill from 'src/components/CardPill';
import LinearGradient from 'react-native-linear-gradient';
import useWalletAsset from 'src/hooks/useWalletAsset';

type WalletCardProps = {
  backgroundColor?: string[];
  icon?: React.ReactNode;
  iconWidth?: number;
  iconHeight?: number;
  hexagonBackgroundColor?: string;
  keysText?: string;
  title?: string;
  tags?: string[];
  description?: string;
  totalBalance?: number;
  wallet?: any;
  allowHideBalance?: boolean;
  isShowAmount?: boolean;
  setIsShowAmount?: () => void;
  tag: string;
};

const WalletCard: React.FC<WalletCardProps> = ({
  backgroundColor = ['#fff', '#fff'],
  iconWidth = 40,
  iconHeight = 34,
  hexagonBackgroundColor,
  title,
  tags,
  description,
  totalBalance,
  wallet,
  allowHideBalance = true,
  isShowAmount,
  setIsShowAmount,
  tag,
}) => {
  const defaultHexagonBackgroundColor = Colors.headerWhite;
  const { getWalletIcon } = useWalletAsset();
  const WalletIcon = getWalletIcon(wallet);

  return (
    <LinearGradient
      colors={backgroundColor}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.cardContainer]}
    >
      <WalletLine style={styles.walletLine} width={wp(180)} height={hp(200)} />
      <Box style={styles.topRow}>
        <Box style={styles.cardNameCtr}>
          <HexagonIcon
            width={iconWidth}
            height={iconHeight}
            backgroundColor={hexagonBackgroundColor || defaultHexagonBackgroundColor}
            icon={<WalletIcon />}
          />
          <Text medium color={Colors.headerWhite} style={styles.title}>
            {title}
          </Text>
        </Box>
        <Box style={{ flex: 1 }}>
          <Box style={styles.pillsContainer}>
            <CardPill key={tag} heading={tag} backgroundColor={Colors.pillOrange} />
          </Box>
        </Box>
      </Box>
      <Box style={styles.balanceCtr}>
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
  );
};

export default WalletCard;

const styles = StyleSheet.create({
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
  },
  topRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardNameCtr: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(6),
    maxWidth: '50%',
  },
  balanceCtr: {
    position: 'absolute',
    bottom: hp(7),
    left: wp(16),
  },
  walletLine: {
    position: 'absolute',
    top: -15,
    right: -25,
    zIndex: 0,
  },
  title: {
    marginTop: hp(2),
    fontSize: 15,
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
});
