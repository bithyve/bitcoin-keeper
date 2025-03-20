import React, { useContext, useState, useMemo } from 'react';
import { useColorMode, View } from 'native-base';
import { StyleSheet } from 'react-native';
import KeeperModal from 'src/components/KeeperModal';
import { wp, hp } from 'src/constants/responsive';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import useWallets from 'src/hooks/useWallets';
import SignerCard from 'src/screens/AddSigner/SignerCard';
import { EntityKind, VaultType, VisibilityType } from 'src/services/wallets/enums';
import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import HexagonIcon from './HexagonIcon';
import Colors from 'src/theme/Colors';
import useBalance from 'src/hooks/useBalance';
import { useAppSelector } from 'src/store/hooks';
import useCurrencyCode from 'src/store/hooks/state-selectors/useCurrencyCode';
import CurrencyKind from 'src/models/enums/CurrencyKind';
import useVault from 'src/hooks/useVault';

const WalletList = React.memo(
  ({
    walletsData,
    selectedCard,
    handleCardSelect,
    getCurrencyIcon,
    getBalance,
    getSatUnit,
    getWalletIcon,
  }) => {
    return (
      <View style={styles.walletListContainer}>
        {walletsData.map((data, index) => (
          <SignerCard
            key={index}
            name={data.presentationData.name}
            subtitle={`${getCurrencyIcon()} ${getBalance(
              data.specs.balances.confirmed + data.specs.balances.unconfirmed
            )} ${getSatUnit()}`}
            colorVarient="transparent"
            icon={
              <HexagonIcon
                width={38}
                height={33}
                backgroundColor={Colors.primaryGreen}
                icon={getWalletIcon(data)}
              />
            }
            isSelected={selectedCard === index}
            onCardSelect={() => handleCardSelect(index)}
            colorMode="light"
            customStyle={styles.signerCard}
          />
        ))}
      </View>
    );
  }
);

const SelectWalletModal = ({
  showModal,
  setShowModal,
  onlyWallets,
  onlyVaults,
  buttonCallback,
  secondaryCallback,
  title = 'Select vault for auto-transfer ',
  subTitle = 'Please select vault to which you want to transfer your funds',
  buttonText = 'Transfer',
  secondaryButtonText = 'Skip',
  hideHiddenVaults = false,
}) => {
  const { colorMode } = useColorMode();
  const { translations } = useContext(LocalizationContext);
  const { wallets } = useWallets({ getAll: true });
  const { getSatUnit, getBalance } = useBalance();
  const currentCurrency = useAppSelector((state) => state.settings.currencyKind);
  const currencyCode = useCurrencyCode();
  const { allVaults } = useVault({ includeArchived: false });

  const walletsData = useMemo(() => {
    if (onlyWallets) return wallets;
    if (onlyVaults) {
      if (hideHiddenVaults)
        return allVaults.filter(
          (vault) => vault.presentationData.visibility !== VisibilityType.HIDDEN // To hide vaults which are hidden
        );
      return allVaults;
    }
    return [...wallets, ...allVaults];
  }, [wallets, allVaults, onlyWallets, onlyVaults]);

  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardSelect = (index) => {
    setSelectedCard(index);
  };

  const getCurrencyIcon = () => {
    return currentCurrency === CurrencyKind.BITCOIN ? '₿' : currencyCode;
  };

  const getWalletIcon = (wallet) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE ? <CollaborativeIcon /> : <VaultIcon />;
    }
    return <WalletIcon />;
  };

  const handleProceed = () => {
    if (selectedCard !== null) {
      buttonCallback(walletsData[selectedCard]);
    }
  };

  return (
    <KeeperModal
      visible={showModal}
      close={() => setShowModal(false)}
      modalBackground={`${colorMode}.modalWhiteBackground`}
      textColor={`${colorMode}.modalWhiteContent`}
      title={title}
      subTitle={subTitle}
      buttonText={buttonText}
      buttonCallback={handleProceed}
      secondaryButtonText={secondaryButtonText}
      secondaryCallback={secondaryCallback}
      subTitleWidth={wp(280)}
      Content={() => (
        <WalletList
          walletsData={walletsData}
          selectedCard={selectedCard}
          handleCardSelect={handleCardSelect}
          getCurrencyIcon={getCurrencyIcon}
          getBalance={getBalance}
          getSatUnit={getSatUnit}
          getWalletIcon={getWalletIcon}
        />
      )}
      buttonTextColor={`${colorMode}.buttonText`}
      buttonBackground={`${colorMode}.pantoneGreen`}
      showCloseIcon={false}
    />
  );
};

const styles = StyleSheet.create({
  walletListContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  signerCard: {
    width: wp(95),
    marginBottom: hp(20),
  },
});

export default SelectWalletModal;
