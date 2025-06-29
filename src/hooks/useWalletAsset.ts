import CollaborativeIcon from 'src/assets/images/collaborative_vault_white.svg';
import WalletIcon from 'src/assets/images/daily_wallet.svg';
import VaultIcon from 'src/assets/images/vault_icon.svg';
import AssistedIcon from 'src/assets/images/assisted-vault-white-icon.svg';
import idx from 'idx';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import {
  DerivationPurpose,
  EntityKind,
  MiniscriptTypes,
  VaultType,
  WalletType,
} from 'src/services/wallets/enums';
import { Vault } from 'src/services/wallets/interfaces/vault';
import WalletUtilities from 'src/services/wallets/operations/utils';
import Colors from 'src/theme/Colors';
import UsdtWalletLogo from 'src/assets/images/usdt-wallet-logo.svg';
import { USDTWallet } from 'src/services/wallets/factories/USDTWalletFactory';

const useWalletAsset = () => {
  const getWalletIcon = (wallet: Wallet | Vault | USDTWallet) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      switch (wallet.type) {
        case VaultType.COLLABORATIVE:
          return CollaborativeIcon;
        case VaultType.ASSISTED:
          return AssistedIcon;
        default:
          return VaultIcon;
      }
    } else if (wallet?.entityKind === EntityKind.USDT_WALLET) {
      return UsdtWalletLogo;
    } else {
      return WalletIcon;
    }
  };

  const getWalletCardGradient = (wallet: Wallet | Vault | USDTWallet) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.MINISCRIPT
        ? [Colors.EarthBrown, Colors.LabelLight1]
        : wallet.type === VaultType.SINGE_SIG
        ? [Colors.DeepTeal, Colors.OceanSage]
        : ['#24312E', '#3E524D'];
    } else if (wallet?.entityKind === EntityKind.USDT_WALLET) {
      return [Colors.CharcoalBlueGray, Colors.DustyNavy];
    } else {
      return [Colors.DarkSlateGray, Colors.primaryGreen];
    }
  };

  const getSchemeTag = (wallet: Vault) =>
    wallet.scheme.m === 1 && wallet.scheme.n === 1
      ? 'Single-key'
      : `${wallet.scheme.m} of ${wallet.scheme.n}`;

  const TAG_COLORS = [
    Colors.LabelLight3,
    Colors.pillOrange,
    Colors.Aquamarine,
    Colors.mintGreen,
    Colors.TagLight7,
  ];

  const getWalletTags = (wallet: Wallet | Vault | USDTWallet) => {
    let tags: { tag: string; color?: string }[] = [];

    if (wallet.entityKind === EntityKind.VAULT) {
      switch (wallet.type) {
        case VaultType.SINGE_SIG:
          tags = [{ tag: 'Cold Wallet' }, { tag: 'Single-key' }];
          break;
        case VaultType.COLLABORATIVE:
          tags = [{ tag: 'Collaborative' }, { tag: getSchemeTag(wallet as Vault) }];
          break;
        case VaultType.ASSISTED:
          tags = [{ tag: 'Assisted' }, { tag: getSchemeTag(wallet as Vault) }];
          break;
        case VaultType.TIMELOCKED:
          tags = [{ tag: 'Timelocked' }, { tag: getSchemeTag(wallet as Vault) }];
          break;
        case VaultType.CANARY:
          tags = [{ tag: 'Canary' }];
          break;
        case VaultType.MINISCRIPT:
          tags = [
            wallet.scheme.m !== 1 || wallet.scheme.n !== 1 ? { tag: 'Multi-key' } : null,
            { tag: getSchemeTag(wallet as Vault) },
            wallet.scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.INHERITANCE
            ) && { tag: 'Inheritance key' },
            wallet.scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.EMERGENCY
            ) && { tag: 'Emergency key' },
            wallet.scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.TIMELOCKED
            ) && { tag: 'Timelocked' },
          ].filter(Boolean);
          break;
        default:
          tags = [{ tag: 'Multi-key' }, { tag: getSchemeTag(wallet as Vault) }];
      }
      if ((wallet as Vault).isMigrating) tags.push({ tag: 'In-Transition' });
    } else if (wallet.entityKind === EntityKind.USDT_WALLET) {
      const walletKind = 'USDT';
      tags = [{ tag: walletKind }];
    } else {
      let walletKind = wallet.type === WalletType.DEFAULT ? 'Hot Wallet' : 'Imported Wallet';
      const isWatchOnly = wallet.type === WalletType.IMPORTED && !idx(wallet, (_) => _.specs.xpriv);
      if (isWatchOnly) walletKind = 'Watch Only';

      const derivationPath = idx(wallet, (_) => _.derivationDetails.xDerivationPath);
      const isTaprootWallet =
        derivationPath && WalletUtilities.getPurpose(derivationPath) === DerivationPurpose.BIP86;

      tags = [{ tag: walletKind }, { tag: isTaprootWallet ? 'Taproot' : 'Single-Key' }];
    }

    return tags.map((tag, index) => ({
      ...tag,
      color: TAG_COLORS[index % TAG_COLORS.length],
    }));
  };

  return { getWalletIcon, getWalletCardGradient, getWalletTags };
};

export default useWalletAsset;
