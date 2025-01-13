import React, { useContext } from 'react';
import SendGreen from 'src/assets/images/send-green.svg';
import SendWhite from 'src/assets/images/send-white.svg';
import { DerivationPurpose, EntityKind } from 'src/services/wallets/enums';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import idx from 'idx';
import KeeperFooter from '../KeeperFooter';
import { useColorMode } from 'native-base';

function UTXOFooter({ setEnableSelection, enableSelection, wallet, utxos }) {
  const { translations } = useContext(LocalizationContext);
  const { wallet: walletTranslation } = translations;
  const { colorMode } = useColorMode();

  const isVault = wallet?.entityKind === EntityKind.VAULT;
  let isTaprootWallet = false;
  if (!isVault) {
    // case: single-sig hot wallet
    const derivationPath = idx(wallet as Wallet, (_) => _.derivationDetails.xDerivationPath);
    if (derivationPath && WalletUtilities.getPurpose(derivationPath) === DerivationPurpose.BIP86) {
      isTaprootWallet = true;
    }
  }

  const footerItems = [
    {
      text: walletTranslation.selectToSend,
      Icon: colorMode === 'light' ? SendGreen : SendWhite,
      onPress: () => setEnableSelection(!enableSelection),
      disabled: !utxos.length,
    },
  ];

  return <KeeperFooter items={footerItems} />;
}

export default UTXOFooter;
