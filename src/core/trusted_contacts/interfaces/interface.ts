import { ImageSourcePropType } from 'react-native';
import {
  DeepLinkEncryptionType,
  InitTrustedContactFlowKind,
  ShareSplitScheme,
  TrustedContactRelationTypes,
} from './enum';

export interface MetaShare {
  encryptedShare?: {
    pmShare: string;
  };
  shareId: string;
  meta: {
    version: string;
    validator: string;
    index: number;
    walletId: string;
    tag: string;
    timestamp: string;
    reshareVersion: number;
    questionId: string;
    question?: string;
    guardian?: string;
    encryptedKeeperInfo?: string;
    scheme?: ShareSplitScheme;
  };
}

export interface ContactDetails {
  id: string;
  contactName?: string;
  image?: ImageSourcePropType | null;
}

export interface ChannelAssets {
  shareId?: string;
  primaryMnemonicShard?: any;
  keeperInfo?: any;
  secondaryMnemonicShard?: any;
  bhXpub?: string;
}

export interface ContactInfo {
  contactDetails?: ContactDetails;
  isKeeper?: boolean;
  channelKey?: string;
  secondaryChannelKey?: string;
  contactsSecondaryChannelKey?: string;
  channelAssets?: {
    primaryMnemonicShard?: any;
    keeperInfo?: any;
    secondaryMnemonicShard?: any;
    bhXpub?: string;
  };
  flowKind?: InitTrustedContactFlowKind;
}

export interface PrimaryStreamData {
  walletID?: string;
  walletName?: string;
  relationType?: TrustedContactRelationTypes;
  FCM?: string;
  contactDetails?: ContactDetails;
  paymentAddresses?: {
    [walletType: string]: string;
  };
  giftDeepLink?: string;

  // primary keeper exclusives
  secondarySetupData?: {
    secondaryXpub: string;
    secondaryShardWI: string;
  };
  bhXpub?: string;
}

export interface SecondaryStreamData {
  secondaryMnemonicShard?: any;
  bhXpub?: string;
}

export interface BackupStreamData {
  primaryMnemonicShard?: MetaShare;
  keeperInfo?: any;
}

export interface UnecryptedStreamData {
  streamId: string;
  primaryData?: PrimaryStreamData;
  secondaryData?: SecondaryStreamData; // in/out-stream secondaryData = null
  backupData?: BackupStreamData | null; // in/out-stream backupData = null
  metaData?: {
    flags?: {
      active?: boolean;
      lastSeen: number;
      newData?: boolean;
    };
    version?: string;
  };
}

export type UnecryptedStreams = {
  [streamId: string]: UnecryptedStreamData;
};

export interface StreamData {
  streamId: string;
  primaryEncryptedData?: string; // CH encrypted: encrypted via primary channel key
  secondaryEncryptedData?: string; // CH2 encrypted: encrypted via secondary channel key & is not stored in the app
  encryptedBackupData?: string; // not stored in the app
  metaData?: {
    flags?: {
      active?: boolean;
      lastSeen: number;
      newData?: boolean;
    };
    version?: string;
  };
}

export type Streams = {
  [streamId: string]: StreamData;
};

export interface TrustedContact {
  contactDetails: ContactDetails;
  relationType: TrustedContactRelationTypes;
  channelKey: string;
  permanentChannelAddress: string;
  isActive: boolean; // is the channel active
  hasNewData: boolean; // instream has new data
  permanentChannel?: Streams; // encrypted and uploaded to Relay
  unencryptedPermanentChannel?: UnecryptedStreams; // unecrypted retained copy
  secondaryChannelKey?: string | null; // temporary secondaryKey(removed post successful contact setup)
  streamId?: string; // contact's streamId
  walletID?: string; // contact's walletId
  contactsSecondaryChannelKey?: string; // contacts secondaryKey(stored locally)
  deepLinkConfig?: {
    encryptionType: DeepLinkEncryptionType;
    encryptionKey: string | null;
  };
  timestamps: {
    created: number;
  };
}
export interface Trusted_Contacts {
  [channelKey: string]: TrustedContact;
}
