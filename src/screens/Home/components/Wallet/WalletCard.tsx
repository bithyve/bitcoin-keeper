import React, { useState } from 'react';
import { Box, useColorMode } from 'native-base';
import { StyleSheet } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, wp } from 'src/constants/responsive';
import WalletLine from 'src/assets/images/walletCardLines.svg';
import HexagonIcon from 'src/components/HexagonIcon';
import Colors from 'src/theme/Colors';
import BalanceComponent from '../BalanceComponent';
import CardPill from 'src/components/CardPill';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { EntityKind } from 'src/services/wallets/enums';
import { useNavigation } from '@react-navigation/native';
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
}) => {
  const defaultHexagonBackgroundColor = Colors.White;
  const [isShowAmount, setIsShowAmount] = useState(false);
  const { getWalletIcon } = useWalletAsset();
  const WalletIcon = getWalletIcon(wallet);

  return (
    <LinearGradient
      colors={backgroundColor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.cardContainer]}
    >
      <Box style={styles.topLeftContainer}>
        <HexagonIcon
          width={iconWidth}
          height={iconHeight}
          backgroundColor={hexagonBackgroundColor || defaultHexagonBackgroundColor}
          icon={<WalletIcon />}
        />
      </Box>

      <WalletLine style={styles.walletLine} width={wp(180)} height={hp(200)} />
      <Box style={styles.pillsContainer}>
        {tags?.map(({ tag, color }, index) => (
          <CardPill
            key={tag}
            heading={tag}
            backgroundColor={color}
            cardStyle={index % 2 !== 0 && styles.secondCard}
          />
        ))}
      </Box>

      <Box style={styles.bottomContainer}>
        <Box style={styles.bottomLeft}>
          <Text color={Colors.White} style={styles.description}>
            {description}
          </Text>
          <Text medium color={Colors.White} style={styles.title}>
            {title}
          </Text>
        </Box>
        <Box style={styles.bottomRight}>
          <BalanceComponent
            setIsShowAmount={setIsShowAmount}
            isShowAmount={isShowAmount}
            balance={totalBalance}
          />
        </Box>
      </Box>
    </LinearGradient>
  );
};

export default WalletCard;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'column',
    width: wp(327),
    height: wp(180),
    padding: wp(20),
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  walletLine: {
    position: 'absolute',
    top: -15,
    right: -25,
    zIndex: 0,
  },
  topLeftContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: hp(20),
    left: 20,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  bottomLeft: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 14,
  },
  description: {
    fontSize: 11,
  },
  bottomRight: {
    justifyContent: 'center',
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  secondCard: {
    maxWidth: wp(80),
  },
});
