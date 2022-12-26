import BlockChainHomeIcon from 'src/assets/images/blockchainHome.svg';
import SingleSigIcon from 'src/assets/images/svgs/single_sig.svg';
import BlueWalletIcon from 'src/assets/images/svgs/blue_wallet.svg';
import { Wallet } from 'src/core/wallets/interfaces/wallet';

export interface WALLET {
  Icon: React.SFC<React.SVGProps<SVGSVGElement>>;
  type: string;
  name: string;
  description: string;
  isImported: boolean;
  balance: number;
}

export const defaultWallets: WALLET[] = [
  {
    Icon: SingleSigIcon,
    type: 'Single-sig',
    name: 'Maldives Funds',
    description: 'Beach and Sunshine baby!',
    isImported: false,
    balance: 0.000024,
  },
  {
    Icon: BlockChainHomeIcon,
    type: 'Blockchain.com Wallet',
    name: 'Investment Funds',
    description: 'Rainy day umbrella',
    isImported: true,
    balance: 0.000389,
  },
];

export const walletData = (item) => {
  const walletTitle = (item as Wallet)?.presentationData?.name;
  if (walletTitle === 'Full Import') {
    return {
      Icon: BlueWalletIcon,
      type: 'Blue Wallet',
      name: 'Imported Wallet',
      description: 'Daily Spends',
      balance: 0,
    };
  }
  if (walletTitle === 'Checking Wallet') {
    return {
      Icon: SingleSigIcon,
      type: 'Single-sig',
      name: item?.presentationData?.name,
      description: item?.presentationData?.description,
      balance: 0,
    };
  }
  return {
    Icon: item.Icon,
    type: item.type,
    name: item.name,
    description: item.description,
    balance: item.balance,
  };
};
