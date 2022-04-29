import BlockChainHomeIcon from '../../../../assets/images/blockchainHome.svg';
import SingleSigIcon from '../../../../assets/images/single_sig.svg';
import ColdCardIcon from '../../../../assets/images/coldcard_tile.svg';
import LaptopIcon from '../../../../assets/images/laptop_tile.svg';
import PdfIcon from '../../../../assets/images/pdf_tile.svg';
import BlueWalletIcon from '../../../../assets/images/blue_wallet.svg';

export interface BACKUP_KEYS {
  id: string;
  title: string;
  Icon: React.SFC<React.SVGProps<SVGSVGElement>>;
  subtitle?: string;
  onPress?: () => void;
}

export interface WALLET {
  Icon: React.SFC<React.SVGProps<SVGSVGElement>>;
  type: string;
  name: string;
  description: string;
  isImported: boolean;
  balance: Number;
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

export const defaultBackupKeys: BACKUP_KEYS[] = [
  {
    id: '58694a0f-3da1-471f-bd96-14557114225679d72',
    title: 'Cold Card',
    Icon: ColdCardIcon,
  },
  {
    id: '58694a0f-3da1-471f-da34-145571e26ad5679d72',
    title: `Arika's MacBook`,
    Icon: LaptopIcon,
  },
  {
    id: '58694a0f-vc12-471f-1211-145571e26732179d72',
    title: `PDF on DropBox`,
    subtitle: 'New Key',
    Icon: PdfIcon,
  },
];

export const accountData = (item) => {
  const acctype = item?.primarySubAccount?.defaultTitle;
  const totalBalance =
    item?.primarySubAccount?.balances?.confirmed + item?.primarySubAccount?.balances?.unconfirmed;

  if (acctype == 'Full Import') {
    return {
      Icon: BlueWalletIcon,
      type: 'Blue Wallet',
      name: 'Imported Wallet',
      description: 'Daily Spends',
      balance: totalBalance,
    };
  } else if (acctype == 'Checking Account') {
    return {
      Icon: SingleSigIcon,
      type: 'Single-sig',
      name: item?.primarySubAccount?.customDisplayName,
      description: item?.primarySubAccount?.customDescription,
      balance: totalBalance,
    };
  } else {
    return {
      Icon: item.Icon,
      type: item.type,
      name: item.name,
      description: item.description,
      balance: item.balance,
    };
  }
};
