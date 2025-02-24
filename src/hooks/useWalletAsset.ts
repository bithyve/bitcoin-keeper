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

  const getWalletTags = (wallet: Wallet | Vault) => {
    if (wallet.entityKind === EntityKind.VAULT) {
      switch (wallet.type) {
        case VaultType.SINGE_SIG:
          return [
            { tag: 'Cold', color: Colors.mintGreen },
            { tag: 'Single-key', color: Colors.LabelLight3 },
          ];
        case VaultType.COLLABORATIVE:
          return [
            { tag: 'Collaborative', color: Colors.mintGreen },
            { tag: getSchemeTag(wallet as Vault), color: Colors.LightMossGreen },
          ];
        case VaultType.ASSISTED:
          return [
            { tag: 'Assisted', color: Colors.LightMossGreen },
            { tag: getSchemeTag(wallet as Vault), color: Colors.mintGreen },
          ];
        case VaultType.TIMELOCKED:
          return [
            { tag: 'Timelocked', color: Colors.mintGreen },
            { tag: getSchemeTag(wallet as Vault), color: Colors.LightMossGreen },
          ];
        case VaultType.CANARY:
          return [{ tag: 'Canary', color: Colors.LightMossGreen }];
        case VaultType.MINISCRIPT:
          return [
            wallet.scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.INHERITANCE
            ) && { tag: 'Inheritance Key', color: Colors.Aquamarine },
            wallet.scheme.miniscriptScheme?.usedMiniscriptTypes.includes(
              MiniscriptTypes.EMERGENCY
              // TODO: Update tag color
            ) && { tag: 'Emergency Key', color: Colors.Aquamarine },
            { tag: getSchemeTag(wallet as Vault), color: Colors.LightMossGreen },
          ].filter(Boolean);
        default:
          return [
            { tag: 'Multi-key', color: Colors.mintGreen },
            { tag: getSchemeTag(wallet as Vault), color: Colors.LightMossGreen },
          ];
      }
    } else {
      let walletKind = wallet.type === WalletType.DEFAULT ? 'Hot Wallet' : 'Imported Wallet';
      const isWatchOnly = wallet.type === WalletType.IMPORTED && !idx(wallet, (_) => _.specs.xpriv);
      if (isWatchOnly) walletKind = 'Watch Only';

      const derivationPath = idx(wallet, (_) => _.derivationDetails.xDerivationPath);
      const isTaprootWallet =
        derivationPath && WalletUtilities.getPurpose(derivationPath) === DerivationPurpose.BIP86;

      return [
        { tag: walletKind, color: Colors.LightMossGreen },
        { tag: isTaprootWallet ? 'Taproot' : 'Single-Key', color: Colors.PaleCyan },
      ];
    }
  };

  return { getWalletIcon, getWalletCardGradient, getWalletTags };
};

export default useWalletAsset;
