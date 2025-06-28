import * as CryptoJS from 'crypto-js';
import { NetworkType, EntityKind, VisibilityType, WalletType } from '../enums';
import {
  createTronWalletFromMnemonic,
  DEFAULT_TRON_DERIVATION_PATH,
} from '../operations/dollars/Tron';
import USDT, { USDTTransaction } from '../operations/dollars/USDT';
import BIP85 from '../operations/BIP85';
import { BIP85Config } from '../interfaces';

export enum USDTWalletType {
  DEFAULT = 'DEFAULT',
  IMPORTED = 'IMPORTED',
}

export interface USDTWalletSpecs {
  address: string; // TRON address (TR...)
  privateKey: string; // Private key
  gasFreeAddress: string; // GasFree service proxy address
  balance: number; // Available USDT balance
  frozen: number; // Frozen amount in pending transfers
  isActive: boolean; // GasFree activation status
  canTransfer: boolean; // Whether transfers are allowed
  nextNonce: number; // Next transaction nonce
  fees: {
    transferFee: number;
    activateFee: number;
  };
  transactions: USDTTransaction[];
  hasNewUpdates: boolean;
  lastSynched: number; // Last sync timestamp
}

export interface USDTWalletPresentationData {
  name: string; // Custom wallet name
  description: string; // Custom description
  visibility: VisibilityType; // Visibility setting
}

export interface USDTWalletDerivationDetails {
  instanceNum?: number; // instance number of this particular walletType
  mnemonic?: string; // mnemonic of the wallet
  bip85Config?: BIP85Config; // bip85 configuration leading to the derivation path for the corresponding entropy
  xDerivationPath: string; // derivation path of the extended keys belonging to this wallet
}

export interface USDTWallet {
  id: string;
  entityKind: EntityKind.USDT_WALLET;
  type: USDTWalletType;
  networkType: NetworkType;
  derivationDetails: USDTWalletDerivationDetails;
  presentationData: USDTWalletPresentationData;
  specs: USDTWalletSpecs;
  createdAt: number;
}

export interface USDTWalletImportDetails {
  privateKey: string;
  address: string;
}

export interface USDTWalletCreationParams {
  usdtWalletType: USDTWalletType;
  walletName: string;
  walletDescription: string;
  instanceNum: number;
  networkType: NetworkType;
  primaryMnemonic?: string;
  importDetails?: USDTWalletImportDetails;
}

/**
 * Generate USDT wallet specs from TRON account data
 */
export const generateUSDTWalletSpecs = async (
  address: string,
  privateKey: string,
  networkType: NetworkType
): Promise<USDTWalletSpecs> => {
  const accountStatus = await USDT.getAccountStatus(address, networkType);
  console.log({ accountStatus });
  if (!accountStatus?.gasFreeAddress)
    throw new Error(`Failed to initiate specs for USDT wallet, missing gasFreeAddress`);

  const specs: USDTWalletSpecs = {
    address: accountStatus.address,
    privateKey,
    gasFreeAddress: accountStatus.gasFreeAddress,
    balance: accountStatus.balance,
    frozen: accountStatus.frozen,
    isActive: accountStatus.isActive,
    canTransfer: accountStatus.canTransfer,
    nextNonce: accountStatus.nextNonce,
    fees: accountStatus.fees,
    transactions: [],
    hasNewUpdates: true,
    lastSynched: Date.now(),
  };

  return specs;
};

/**
 * Generate wallet ID from address
 */
export const generateWalletId = (address: string): string => {
  return CryptoJS.SHA256(address).toString();
};

/**
 * Main factory function to generate USDT wallets
 */
export const generateUSDTWallet = async (params: USDTWalletCreationParams): Promise<USDTWallet> => {
  const {
    usdtWalletType,
    primaryMnemonic,
    walletName,
    walletDescription,
    instanceNum,
    networkType,
    importDetails,
  } = params;

  let address: string;
  let privateKey: string;
  let derivationDetails: USDTWalletDerivationDetails;
  // Generate or import wallet based on type
  switch (usdtWalletType) {
    case USDTWalletType.DEFAULT: {
      if (!primaryMnemonic)
        throw new Error('Primary Mnemonic required for default USDT wallet type');
      // BIP85 derivation: primary mnemonic to bip85-child mnemonic
      const bip85Config = BIP85.generateBIP85Configuration(EntityKind.USDT_WALLET, instanceNum);
      const entropy = await BIP85.bip39MnemonicToEntropy(
        bip85Config.derivationPath,
        primaryMnemonic
      );
      const mnemonic = BIP85.entropyToBIP39(entropy, bip85Config.words);
      const newWallet = createTronWalletFromMnemonic(mnemonic, networkType);
      address = newWallet.address;
      privateKey = newWallet.privateKey;
      derivationDetails = {
        instanceNum,
        mnemonic,
        bip85Config,
        xDerivationPath: DEFAULT_TRON_DERIVATION_PATH,
      };
      break;
    }

    // case USDTWalletType.IMPORTED: {
    //   if (!importDetails) {
    //     throw new Error('Import details required for imported wallet');
    //   }

    //   if (!importDetails.privateKey) {
    //     throw new Error('Private key required for imported wallet');
    //   }

    //   // Create wallet from private key
    //   const importedWallet = createTronWalletFromPrivateKey(importDetails.privateKey, networkType);
    //   if (!importedWallet.isValid) {
    //     throw new Error(`Failed to import USDT wallet using private key`);
    //   }
    //   address = importedWallet.address;
    //   privateKey = importedWallet.privateKey;
    //   derivationDetails = {
    //      instanceNum, // null
    //      mnemonic: null, // null
    //      bip85Config: null, // null
    //      xDerivationPath: DEFAULT_TRON_DERIVATION_PATH,
    //   };
    //   break;
    // }

    default:
      throw new Error(`Unsupported wallet type: ${usdtWalletType}`);
  }

  // Generate wallet specs
  const specs = await generateUSDTWalletSpecs(address, privateKey, networkType);

  // Create presentation data with the provided name and description
  const presentationData: USDTWalletPresentationData = {
    name: walletName,
    description: walletDescription,
    visibility: VisibilityType.DEFAULT,
  };

  // Create the USDT wallet object
  const usdtWallet: USDTWallet = {
    id: generateWalletId(address),
    entityKind: EntityKind.USDT_WALLET,
    type: usdtWalletType,
    networkType,
    presentationData,
    derivationDetails,
    specs,
    createdAt: Date.now(),
  };

  return usdtWallet;
};

/**
 * Check if USDT wallet already exists
 */
export const checkUSDTWalletExists = (address: string, existingWallets: USDTWallet[]): boolean => {
  const walletId = generateWalletId(address);
  return existingWallets.some((wallet) => wallet.id === walletId);
};

/**
 * Update USDT wallet specs with latest data, except transactions
 */
export const updateUSDTWalletStatus = async (wallet: USDTWallet): Promise<USDTWalletSpecs> => {
  try {
    const accountStatus = await USDT.getAccountStatus(wallet.specs.address, wallet.networkType);
    const { transactions } = await USDT.getUSDTTransactions(wallet);
    const updatedSpecs: USDTWalletSpecs = {
      ...wallet.specs,
      balance: accountStatus.balance,
      frozen: accountStatus.frozen,
      isActive: accountStatus.isActive,
      canTransfer: accountStatus.canTransfer,
      nextNonce: accountStatus.nextNonce,
      fees: accountStatus.fees,
      transactions,
      hasNewUpdates: true,
      lastSynched: Date.now(),
    };

    return updatedSpecs;
  } catch (error) {
    return wallet.specs;
  }
};

/**
 * Get private key for signing (if available)
 */
export const getPrivateKeyForSigning = (wallet: USDTWallet): string => {
  return wallet.specs.privateKey;
};
