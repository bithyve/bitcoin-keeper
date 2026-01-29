import { Box, useColorMode } from 'native-base';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Text from 'src/components/KeeperText';
import { hp, windowWidth, wp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { EntityKind } from 'src/services/wallets/enums';
import CoinIcon from 'src/assets/images/coins.svg';
import SignerIcon from 'src/assets/images/keys-icon.svg';
import CircleIconWrapper from 'src/components/CircleIconWrapper';
import UpdateSchemeIcon from 'src/assets/images/updateScheme.svg';

interface Props {
  updateSchemeCallback?: () => void;
  viewCoinsCallback?: () => void;
  manageKeysCallback?: () => void;
  disabled?: boolean;
  wallet?: any;
}

const DetailCards = ({
  updateSchemeCallback,
  viewCoinsCallback,
  manageKeysCallback,
  disabled,
  wallet,
}: Props) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { common } = translations;

  const CardsData = [
    updateSchemeCallback && {
      id: 1,
      icon: (
        <CircleIconWrapper
          width={40}
          icon={<UpdateSchemeIcon />}
          backgroundColor={`${colorMode}.pantoneGreen`}
        />
      ),
      title: 'Update Wallet', //
      callback: updateSchemeCallback,
      disableOption: disabled,
    },
    viewCoinsCallback && {
      id: 2,
      icon: (
        <CircleIconWrapper
          width={40}
          icon={<CoinIcon />}
          backgroundColor={`${colorMode}.pantoneGreen`}
        />
      ),
      title: common.viewAllCoins,
      callback: viewCoinsCallback,
      disableOption: disabled,
    },
    manageKeysCallback && {
      id: 3,
      icon: (
        <CircleIconWrapper
          width={40}
          icon={<SignerIcon />}
          backgroundColor={`${colorMode}.pantoneGreen`}
        />
      ),
      title: common.manageKeys,
      callback: manageKeysCallback,
      disableOption: disabled,
    },
  ].filter(Boolean);

  // Remove "More Options" for USDT wallets
  if (wallet?.entityKind === EntityKind.USDT_WALLET) {
    CardsData.pop();
  }

  return (
    <Box style={styles.container} backgroundColor="transparent">
      {CardsData.map(({ id, icon, title, callback, disableOption }) => (
        <TouchableOpacity
          key={id}
          onPress={callback}
          disabled={disableOption}
          style={{ opacity: disableOption ? 0.6 : 1 }}
        >
          <Box
            backgroundColor={`${colorMode}.primaryBackground`}
            borderWidth={1}
            borderColor={`${colorMode}.separator`}
            style={styles.card}
          >
            {icon}
            <Text fontSize={11} medium style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {title}
            </Text>
          </Box>
        </TouchableOpacity>
      ))}
    </Box>
  );
};

export default DetailCards;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: wp(4),
    width: windowWidth * 0.27,
    padding: wp(11),
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
    borderRadius: 8,
  },
  title: {
    marginTop: 8,
    textAlign: 'center',
    maxWidth: '100%',
    fontWeight: '500',
  },
});
