import React, { useContext } from 'react';
import MixIcon from 'src/assets/images/icon_mix.svg';
import SendGreen from 'src/assets/images/send-green.svg';
import SendWhite from 'src/assets/images/send-white.svg';
import { DerivationPurpose, EntityKind, WalletType } from 'src/services/wallets/enums';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import { allowedMixTypes, allowedSendTypes } from 'src/screens/WalletDetails/WalletDetails';
import { LocalizationContext } from 'src/context/Localization/LocContext';
import { Wallet } from 'src/services/wallets/interfaces/wallet';
import WalletUtilities from 'src/services/wallets/operations/utils';
import idx from 'idx';
import KeeperFooter from '../KeeperFooter';
import { useColorMode } from 'native-base';

function UTXOFooter({
  setEnableSelection,
  enableSelection,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  setIsRemix,
  wallet,
  utxos,
  setRemixingToVault,
  vaultId,
}) {
  const { activeVault } = useVault({ vaultId });
  const { showToast } = useToastMessage();
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
    // {
    //   text: walletTranslation.selectForMix,
    //   Icon: MixIcon,
    //   onPress: () => {
    //     setEnableSelection(!enableSelection);
    //     setInitiateWhirlpool(true);
    //   },
    //   disabled: !utxos.length,
    //   hideItem: !allowedMixTypes.includes(wallet?.type) || isVault || isTaprootWallet,
    // },
    // {
    //   text:
    //     wallet.type === WalletType.POST_MIX
    //       ? walletTranslation.selectForRemix
    //       : walletTranslation.selectForMix,
    //   Icon: MixIcon,
    //   onPress: () => {
    //     setEnableSelection(!enableSelection);
    //     setIsRemix(wallet?.type === WalletType.POST_MIX);
    //     setInitateWhirlpoolMix(true);
    //   },
    //   disabled: !utxos.length,
    //   hideItem: ![WalletType.PRE_MIX, WalletType.POST_MIX].includes(wallet?.type),
    // },
    // {
    //   text: walletTranslation.remixVault,
    //   Icon: MixIcon,
    //   onPress: () => {
    //     if (!activeVault) {
    //       showToast('Please create a vault before remixing!');
    //       return;
    //     }
    //     setEnableSelection(!enableSelection);
    //     setIsRemix(wallet?.type === WalletType.POST_MIX);
    //     setInitateWhirlpoolMix(true);
    //     setRemixingToVault(true);
    //   },
    //   disabled: !utxos.length,
    //   hideItem: WalletType.POST_MIX !== wallet?.type || !activeVault,
    // },
    {
      text: walletTranslation.selectToSend,
      Icon: colorMode === 'light' ? SendGreen : SendWhite,
      onPress: () => setEnableSelection(!enableSelection),
      disabled: !utxos.length,
      hideItem: !allowedSendTypes.includes(wallet?.type),
    },
  ];

  return <KeeperFooter items={footerItems} />;
}

export default UTXOFooter;
