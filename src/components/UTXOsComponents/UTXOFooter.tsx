import React from 'react';
import MixIcon from 'src/assets/images/icon_mix.svg';
import Send from 'src/assets/images/send.svg';
import { WalletType } from 'src/core/wallets/enums';
import useVault from 'src/hooks/useVault';
import useToastMessage from 'src/hooks/useToastMessage';
import { allowedMixTypes, allowedSendTypes } from 'src/screens/WalletDetails/WalletDetails';
import KeeperFooter from '../KeeperFooter';

function UTXOFooter({
  setEnableSelection,
  enableSelection,
  setInitiateWhirlpool,
  setInitateWhirlpoolMix,
  setIsRemix,
  wallet,
  utxos,
  setRemixingToVault,
}) {
  const { activeVault } = useVault();
  const { showToast } = useToastMessage();
  const footerItems = [
    {
      text: 'Select for Mix',
      Icon: MixIcon,
      onPress: () => {
        setEnableSelection(!enableSelection);
        setInitiateWhirlpool(true);
      },
      disabled: !utxos.length,
      hideItem: !allowedMixTypes.includes(wallet?.type),
    },
    {
      text: wallet.type === WalletType.POST_MIX ? 'Select for Remix' : 'Select for Mix',
      Icon: MixIcon,
      onPress: () => {
        setEnableSelection(!enableSelection);
        setIsRemix(wallet?.type === WalletType.POST_MIX);
        setInitateWhirlpoolMix(true);
      },
      disabled: !utxos.length,
      hideItem: ![WalletType.PRE_MIX, WalletType.POST_MIX].includes(wallet?.type),
    },
    {
      text: 'Remix to Vault',
      Icon: MixIcon,
      onPress: () => {
        if (!activeVault) {
          showToast('Please create a vault before remixing!');
          return;
        }
        setEnableSelection(!enableSelection);
        setIsRemix(wallet?.type === WalletType.POST_MIX);
        setInitateWhirlpoolMix(true);
        setRemixingToVault(true);
      },
      disabled: !utxos.length,
      hideItem: WalletType.POST_MIX !== wallet?.type || !activeVault,
    },
    {
      text: 'Select to Send',
      Icon: Send,
      onPress: () => setEnableSelection(!enableSelection),
      disabled: !utxos.length,
      hideItem: !allowedSendTypes.includes(wallet?.type),
    },
  ];

  return <KeeperFooter items={footerItems} />;
}

export default UTXOFooter;
