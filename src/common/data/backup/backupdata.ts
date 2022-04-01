import Cloud from 'src/assets/images/svgs/cloud.svg';
import Mobile from 'src/assets/images/svgs/mobile.svg';
import PDF from 'src/assets/images/svgs/pdf.svg';
import Laptop from 'src/assets/images/svgs/laptop.svg';
import Hardware from 'src/assets/images/svgs/hardware.svg';
import Contact from 'src/assets/images/svgs/contacts.svg';
import Key from 'src/assets/images/svgs/key.svg';
import ColdCard from 'src/assets/images/svgs/coldcard.svg';
import Ledger from 'src/assets/images/svgs/ledger.svg';
import Trezor from 'src/assets/images/svgs/trezor.svg';
import Seedsigner from 'src/assets/images/svgs/seedsigner.svg';
import Foundationdevice from 'src/assets/images/svgs/foundationdevice.svg';

import ColdCardTile from 'src/assets/images/svgs/coldcard_tile.svg';
import LedgerTile from 'src/assets/images/svgs/ledger_tile.svg';
import TrezorTile from 'src/assets/images/svgs/trezor_tile.svg';
import SeedsignerTile from 'src/assets/images/svgs/seedsigner_tile.svg';
import FoundationdeviceTile from 'src/assets/images/svgs/foundationdevice_tile.svg';
import CloudTile from 'src/assets/images/svgs/cloud_tile.svg';
import MobileTile from 'src/assets/images/svgs/mobile_tile.svg';
import PDFTile from 'src/assets/images/svgs/pdf_tile.svg';
import LaptopTile from 'src/assets/images/svgs/laptop_tile.svg';
import HardwareTile from 'src/assets/images/svgs/hardware_tile.svg';
import ContactTile from 'src/assets/images/svgs/contacts_tile.svg';
import KeyTile from 'src/assets/images/svgs/key_tile.svg';

export const Data = [
  {
    id: 1,
    title: 'Cloud',
    subtitle: 'We support iCloud, Google Drive and Dropbox',
    Icon: Cloud,
  },
  {
    id: 2,
    title: 'Mobile phone',
    subtitle: 'iOS or Android running Hexa Keeper',
    Icon: Mobile,
  },
  {
    id: 3,
    title: 'PDF',
    subtitle: 'Take a print or save elsewhere',
    Icon: PDF,
  },
  {
    id: 4,
    title: 'Desktop',
    subtitle: 'A desktop running Hexa Vault',
    Icon: Laptop,
  },
  {
    id: 5,
    title: 'Hardware wallet',
    subtitle: 'We support Ledger, Trezor and Cold Card',
    Icon: Hardware,
  },
  {
    id: 6,
    title: 'Contacts',
    subtitle: 'Contacts who have Hexa Vault',
    Icon: Contact,
  },
  {
    id: 7,
    title: 'Signer Apps',
    subtitle: 'We support Seed Signer and Blue Wallet',
    Icon: Key,
  },
];

export const HardwareData = [
  {
    id: 8,
    title: 'Ledger',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur',
    Icon: Ledger,
  },
  {
    id: 9,
    title: 'Trezor',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur',
    Icon: Trezor,
  },
  {
    id: 10,
    title: 'Cold Card',
    subtitle: 'Lorem ipsum dolor sit amet, consecteturt',
    Icon: ColdCard,
  },
  {
    id: 11,
    title: 'Seed Signer',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur',
    Icon: Seedsigner,
  },
  {
    id: 12,
    title: 'Foundation Device',
    subtitle: 'Lorem ipsum dolor sit amet, consectetur',
    Icon: Foundationdevice,
  },
];

export const getIcon = (id) => {
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
