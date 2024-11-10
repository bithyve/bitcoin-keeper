import { Box, ScrollView, useColorMode } from 'native-base';
import { Pressable, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import HexagonIcon from 'src/components/HexagonIcon';
import KeeperHeader from 'src/components/KeeperHeader';
import Text from 'src/components/KeeperText';
import ScreenWrapper from 'src/components/ScreenWrapper';
import { hp, wp } from 'src/constants/responsive';
import useVault from 'src/hooks/useVault';
import useWallets from 'src/hooks/useWallets';
import { EntityKind, VaultType, VisibilityType } from 'src/services/wallets/enums';
import { Vault } from 'src/services/wallets/interfaces/vault';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import BTC from 'src/assets/images/btc.svg';
import { useContext, useState } from 'react';
import Colors from 'src/theme/Colors';
import useBalance from 'src/hooks/useBalance';
import Buttons from 'src/components/Buttons';
import { useNavigation } from '@react-navigation/native';
import { LocalizationContext } from 'src/context/Localization/LocContext';

type SelectWalletParams = {
  handleSelectWallet: (wallet: Wallet | Vault) => void;
  selectedWalletIdFromParams?: string;
  sender: Wallet | Vault;
};

type Props = NativeStackScreenProps<
  {
    SelectWallet: SelectWalletParams;
  },
  'SelectWallet'
>;

interface WalletItemProps {
  wallet: Wallet | Vault;
  getWalletIcon: (wallet: Wallet | Vault) => JSX.Element;
  selectedWalletId: string;
  setSelectedWalletId: (walletId: string) => void;
  handleSelectWallet: (wallet: Wallet | Vault) => void;
}

function WalletItem({
  wallet,
  getWalletIcon,
  selectedWalletId,
  setSelectedWalletId,
  handleSelectWallet,
}: WalletItemProps) {
  const { colorMode } = useColorMode();
  const { getSatUnit, getBalance, getCurrencyIcon } = useBalance();
  const isDarkMode = colorMode === 'dark';
  const variation = !isDarkMode ? 'dark' : 'light';
  const isSelected = wallet.id === selectedWalletId;
  const borderColor = isSelected ? `${colorMode}.pantoneGreen` : `${colorMode}.dullGreyBorder`;

  const handlePress = () => {
    if (isSelected) {
      setSelectedWalletId(null);
      handleSelectWallet(null);
    } else {
      setSelectedWalletId(wallet.id);
      handleSelectWallet(wallet);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Box
        style={styles.walletItemContainer}
        backgroundColor={`${colorMode}.secondaryBackground`}
        borderColor={borderColor}
        borderWidth={isSelected ? 2 : 1}
      >
        <Box style={styles.walletInfo}>
          <HexagonIcon
            width={42}
            height={36}
            backgroundColor={isDarkMode ? Colors.DullGreenDark : Colors.pantoneGreen}
            icon={getWalletIcon(wallet)}
          />
          <Text style={styles.walletName} color={`${colorMode}.primaryText`}>
            {wallet?.presentationData?.name}
          </Text>
        </Box>
        <Box style={styles.walletBalance}>
          {getCurrencyIcon(BTC, variation)}
          <Text color={`${colorMode}.primaryText`}>
            {getBalance(wallet?.specs?.balances?.confirmed)}
          </Text>
          <Text color={`${colorMode}.primaryText`}>{getSatUnit()}</Text>
        </Box>
      </Box>
    </Pressable>
  );
}

function SelectWalletScreen({ route }: Props) {
  const { handleSelectWallet, selectedWalletIdFromParams, sender } = route.params;
  const { colorMode } = useColorMode();
  const navigation = useNavigation();
  const { wallets } = useWallets({ getAll: true });
  const { allVaults } = useVault({ includeArchived: false });
  const { translations } = useContext(LocalizationContext);
  const { common, wallet: walletText } = translations;

  const otherWallets: (Wallet | Vault)[] = [...wallets, ...allVaults].filter(
    (item) =>
      item && item.presentationData.visibility !== VisibilityType.HIDDEN && item?.id !== sender?.id
  );

  const [selectedWalletId, setSelectedWalletId] = useState<string>(
    selectedWalletIdFromParams || ''
  );

  const getWalletIcon = (wallet: Wallet | Vault) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    }
    return <WalletIcon />;
  };

  return (
    <ScreenWrapper backgroundcolor={`${colorMode}.primaryBackground`}>
      <KeeperHeader
        title={walletText.selectWalletTitle}
        subtitle={walletText.selectWalletSubtitle}
        subTitleSize={15}
      />
      <ScrollView style={styles.walletListContainer} showsVerticalScrollIndicator={false}>
        <Box style={styles.walletList}>
          {otherWallets.map((wallet) => (
            <WalletItem
              key={wallet.id}
              wallet={wallet}
              getWalletIcon={getWalletIcon}
              selectedWalletId={selectedWalletId}
              setSelectedWalletId={setSelectedWalletId}
              handleSelectWallet={handleSelectWallet}
            />
          ))}
        </Box>
      </ScrollView>
      <Box style={styles.buttonContainer}>
        <Buttons
          primaryText={common.confirm}
          primaryCallback={() => {
            navigation.goBack();
          }}
          fullWidth
        />
      </Box>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  walletItemContainer: {
    flex: 1,
    height: hp(64),
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 7,
    paddingHorizontal: wp(18),
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  walletName: {
    width: '80%',
  },
  walletBalance: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  walletListContainer: {
    flexGrow: 1,
    marginTop: hp(42),
    gap: 20,
  },
  walletList: {
    gap: 20,
    paddingBottom: hp(20),
  },
  buttonContainer: {
    paddingTop: hp(10),
    alignSelf: 'center',
    width: '95%',
  },
});

export default SelectWalletScreen;
