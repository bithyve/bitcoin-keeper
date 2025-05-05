import KeeperLogo from 'src/assets/images/keeper-logo.svg';
import PrivateLogo from 'src/assets/images/Kepper_Private_logo.svg';
import PrivateLogoLight from 'src/assets/privateImages/Kepper-Private-light-logo.svg';
import WalletIcon from 'src/assets/images/WalletIcon.svg';
import PrivateWallet from 'src/assets/privateImages/wallet-icon.svg';
import PrivateWalletLight from 'src/assets/privateImages/wallet-gold.svg';
import PrivateKeys from 'src/assets/privateImages/key-icon.svg';
import KeysIcon from 'src/assets/images/homeGreenKeyIcon.svg';
import PrivateKeyLight from 'src/assets/privateImages/header-key-gold.svg';
import ConciergeIcon from 'src/assets/images/faq-green.svg';
import ConceirgeWhite from 'src/assets/images/faqWhiteIcon.svg';
import Privateconcierge from 'src/assets/privateImages/concierge-icon.svg';
import PrivateConciergeLight from 'src/assets/privateImages/gold-concierge-icon.svg';
import MoreGreen from 'src/assets/images/more-green.svg';
import MoreWhite from 'src/assets/images/moreWhiteIcon.svg';
import PrivateMore from 'src/assets/images/more-white-icon.svg';
import PrivateMoreLight from 'src/assets/privateImages/more-gold-icon.svg';
import KeyGreen from 'src/assets/images/key-green.svg';
import KeyWhite from 'src/assets/images/KeyWhiteIcon.svg';
import PrivateKeyGold from 'src/assets/privateImages/key-gold-icon.svg';
import WalletWhite from 'src/assets/images/walletWhiteIcon.svg';

const themeIcons = {
  keeperLogo: {
    DARK: KeeperLogo,
    LIGHT: KeeperLogo,
    PRIVATE: PrivateLogo,
    PRIVATE_LIGHT: PrivateLogoLight,
  },
  header_Wallet: {
    DARK: WalletIcon,
    LIGHT: WalletIcon,
    PRIVATE: PrivateWallet,
    PRIVATE_LIGHT: PrivateWalletLight,
  },
  header_key: {
    DARK: KeysIcon,
    LIGHT: KeysIcon,
    PRIVATE: PrivateKeys,
    PRIVATE_LIGHT: PrivateKeyLight,
  },
  header_concierge: {
    DARK: ConciergeIcon,
    LIGHT: ConciergeIcon,
    PRIVATE: Privateconcierge,
    PRIVATE_LIGHT: PrivateConciergeLight,
  },
  header_more: {
    DARK: MoreGreen,
    LIGHT: MoreGreen,
    PRIVATE: PrivateMore,
    PRIVATE_LIGHT: PrivateMoreLight,
  },
  footer_more: {
    DARK: MoreWhite,
    LIGHT: MoreGreen,
    PRIVATE: PrivateMoreLight,
    PRIVATE_LIGHT: PrivateMoreLight,
  },
  footer_concierge: {
    DARK: ConceirgeWhite,
    LIGHT: ConciergeIcon,
    PRIVATE: PrivateConciergeLight,
    PRIVATE_LIGHT: PrivateConciergeLight,
  },
  footer_Key: {
    DARK: KeyWhite,
    LIGHT: KeyGreen,
    PRIVATE: PrivateKeyGold,
    PRIVATE_LIGHT: PrivateKeyGold,
  },
  footer_Wallet: {
    DARK: WalletWhite,
    LIGHT: WalletIcon,
    PRIVATE: PrivateWalletLight,
    PRIVATE_LIGHT: PrivateWalletLight,
  },
};

export default themeIcons;
