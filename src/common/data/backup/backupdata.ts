import { BACKUP_KEYS } from 'src/common/data/defaultData/defaultData';
import Cloud from 'src/assets/images/svgs/cloud.svg';
import CloudTile from 'src/assets/images/svgs/cloud_tile.svg';
import ColdCard from 'src/assets/images/svgs/coldcard.svg';
import ColdCardTile from 'src/assets/images/svgs/coldcard_tile.svg';
import Contact from 'src/assets/images/svgs/contacts.svg';
import ContactTile from 'src/assets/images/svgs/contacts_tile.svg';
import Foundationdevice from 'src/assets/images/svgs/foundationdevice.svg';
import FoundationdeviceTile from 'src/assets/images/svgs/foundationdevice_tile.svg';
import Hardware from 'src/assets/images/svgs/hardware.svg';
import HardwareTile from 'src/assets/images/svgs/hardware_tile.svg';
import Key from 'src/assets/images/svgs/key.svg';
import KeyTile from 'src/assets/images/svgs/key_tile.svg';
import Laptop from 'src/assets/images/svgs/laptop.svg';
import LaptopTile from 'src/assets/images/svgs/laptop_tile.svg';
import Ledger from 'src/assets/images/svgs/ledger.svg';
import LedgerTile from 'src/assets/images/svgs/ledger_tile.svg';
import Mobile from 'src/assets/images/svgs/mobile.svg';
import MobileTile from 'src/assets/images/svgs/mobile_tile.svg';
import PDF from 'src/assets/images/svgs/pdf.svg';
import PDFTile from 'src/assets/images/svgs/pdf_tile.svg';
import Seedsigner from 'src/assets/images/svgs/seedsigner.svg';
import SeedsignerTile from 'src/assets/images/svgs/seedsigner_tile.svg';
import Trezor from 'src/assets/images/svgs/trezor.svg';
import TrezorTile from 'src/assets/images/svgs/trezor_tile.svg';

export const Data: BACKUP_KEYS[] = [
  {
    id: '1',
    title: 'Cloud',
    subtitle: 'We support iCloud, Google Drive and Dropbox',
    Icon: Cloud,
  },
  {
    id: '2',
    title: 'Mobile Phone',
    subtitle: 'iOS or Android running Hexa Keeper',
    Icon: Mobile,
  },
  {
    id: '3',
    title: 'PDF',
    subtitle: 'Take a print or save elsewhere',
    Icon: PDF,
  },
  {
    id: '4',
    title: 'Desktop',
    subtitle: 'A desktop running Keeper',
    Icon: Laptop,
  },
  {
    id: '5',
    title: 'Hardware Wallet',
    subtitle: 'We support Ledger, Trezor and Cold Card',
    Icon: Hardware,
  },
  {
    id: '6',
    title: 'Contacts',
    subtitle: 'Contacts who have Keeper',
    Icon: Contact,
  },
  {
    id: '7',
    title: 'Signer Apps',
    subtitle: 'We support Seed Signer and Blue Wallet',
    Icon: Key,
  },
];

export const HardwareData: BACKUP_KEYS[] = [
  {
    id: '8',
    title: 'Ledger',
    subtitle: '',
    Icon: Ledger,
  },
  {
    id: '9',
    title: 'Trezor',
    subtitle: '',
    Icon: Trezor,
  },
  {
    id: '10',
    title: 'Coldcard',
    subtitle: '',
    Icon: ColdCard,
  },
  {
    id: '11',
    title: 'Seed Signer',
    subtitle: '',
    Icon: Seedsigner,
  },
  {
    id: '12',
    title: 'Foundation Device',
    subtitle: '',
    Icon: Foundationdevice,
  },
];

export const getIcon = (id): ((id) => SVGElement) => {
  if (id == 1) {
    return CloudTile;
  } else if (id == 2) {
    return MobileTile;
  } else if (id == 3) {
    return PDFTile;
  } else if (id == 4) {
    return LaptopTile;
  } else if (id == 5) {
    return HardwareTile;
  } else if (id == 6) {
    return ContactTile;
  } else if (id == 7) {
    return KeyTile;
  } else if (id == 8) {
    return LedgerTile;
  } else if (id == 9) {
    return TrezorTile;
  } else if (id == 10) {
    return ColdCardTile;
  } else if (id == 11) {
    return SeedsignerTile;
  } else if (id == 12) {
    return FoundationdeviceTile;
  }
};
