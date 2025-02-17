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

const useWalletAsset = () => {
  const getWalletIcon = (wallet: Wallet | Vault) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      switch (wallet.type) {
        case VaultType.COLLABORATIVE:
          return CollaborativeIcon;
        case VaultType.ASSISTED:
          return AssistedIcon;
        default:
          return VaultIcon;
      }
    } else {
      return WalletIcon;
    }
  };

  const getWalletCardGradient = (wallet: Wallet | Vault) => {
    if (wallet?.entityKind === EntityKind.VAULT) {
      return wallet.type === VaultType.COLLABORATIVE
        ? [Colors.brownColor, Colors.LabelLight1]
        : [Colors.coalGreen, Colors.GreenishGrey];
    } else {
      return [Colors.SeaweedGreen, Colors.DesaturatedTealGreen];
    }
  };

  const getSchemeTag = (wallet: Vault) =>
    wallet.scheme.m === 1 && wallet.scheme.n === 1
      ? 'Single-key'
      : `${wallet.scheme.m} of ${wallet.scheme.n}`;

  const TAG_COLORS = [
    Colors.LabelLight3,
    Colors.DesertSand,
    Colors.Aquamarine,
    Colors.mintGreen,
    Colors.LightMossGreen,
  ];

  const getWalletTags = (wallet: Wallet | Vault) => {
    let tags: { tag: string; color?: string }[] = [];

    if (wallet.entityKind === EntityKind.VAULT) {
      switch (wallet.type) {
        case VaultType.SINGE_SIG:
          tags = [{ tag: 'Cold' }, { tag: 'Single-key' }];
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
            wallet.scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.INHERITANCE
            ) && { tag: 'Inheritance Key' },
            { tag: getSchemeTag(wallet as Vault) },
          ].filter(Boolean);
          break;
        default:
          tags = [{ tag: 'Multi-key' }, { tag: getSchemeTag(wallet as Vault) }];
      }
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
