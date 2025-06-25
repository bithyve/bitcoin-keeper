import { NetworkType } from '../../enums';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import ecc from '../taproot-utils/noble_ecc';
import * as bitcoinJS from 'bitcoinjs-lib';
import { TronWeb } from 'tronweb';
const bip32 = BIP32Factory(ecc);

// TRON network configurations
const TRON_NETWORKS = {
  [NetworkType.MAINNET]: {
    fullHost: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
  },
  [NetworkType.TESTNET]: {
    fullHost: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
  },
};

/**
 * Create TronWeb instance for specified network
 */
export function createTronWeb(networkType: NetworkType): any {
  return new TronWeb(TRON_NETWORKS[networkType]);
}
/**
 * Generate a new TRON wallet with private key
 */
export const generateTronWallet = (networkType: NetworkType = NetworkType.MAINNET) => {
  try {
    const tronWeb = createTronWeb(networkType);
    const account = tronWeb.createAccount();

    return {
      address: account.address.base58,
      privateKey: account.privateKey,
      publicKey: account.publicKey,
    };
  } catch (error) {
    throw new Error('Failed to generate TRON wallet');
  }
};

/**
 * Create TRON wallet from private key
 */
export const createTronWalletFromPrivateKey = (
  privateKey: string,
  networkType: NetworkType = NetworkType.MAINNET
) => {
  try {
    const tronWeb = createTronWeb(networkType);
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    // Ensure it's exactly 64 hex characters (32 bytes)
    if (!/^[a-fA-F0-9]{64}$/.test(cleanPrivateKey)) {
      throw new Error('Invalid private key format. Must be 64 hex characters.');
    }

    let address: string = tronWeb.address.fromPrivateKey(cleanPrivateKey);
    return {
      address,
      privateKey: cleanPrivateKey,
      isValid: true,
    };
  } catch (error) {
    throw new Error(`Failed to create TRON wallet from private key: ${error.message}`);
  }
};

/**
 * Create TRON wallet from mnemonic using SLIP-0044 derivation path
 * TRON coin type: 195 (m/44'/195'/0'/0/0)
 */
export const createTronWalletFromMnemonic = (
  mnemonic: string,
  networkType: NetworkType,
  accountIndex: number = 0
) => {
  try {
    // Validate mnemonic
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    // Generate seed from mnemonic
    const network =
      networkType === NetworkType.MAINNET ? bitcoinJS.networks.bitcoin : bitcoinJS.networks.testnet;
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed, network);

    // TRON derivation path: m/44'/195'/account'/0/0
    // 195 is TRON's coin type from SLIP-0044
    const derivationPath = `m/44'/195'/${accountIndex}'/0/0`;
    const child = root.derivePath(derivationPath);

    // Get private key from derived child
    const privateKey = child.privateKey.toString('hex');
    return createTronWalletFromPrivateKey(privateKey, networkType);
  } catch (error) {
    throw new Error(`Failed to create TRON wallet from mnemonic: ${error.message}`);
  }
};

/**
 * Validate TRON address format using TronWeb
 */
export function isValidTronAddress(address: string, networkType: NetworkType): boolean {
  try {
    const tronWeb = createTronWeb(networkType);
    return tronWeb.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Get TRC20 token balance from TRON blockchain
 */
export async function getTrc20Balance(
  address: string,
  tokenContract: string,
  networkType: NetworkType = NetworkType.MAINNET
): Promise<{ balance: number; decimals: number }> {
  try {
    // Get the network-aware TronWeb instance
    const tronWebInstance = createTronWeb(networkType);

    // Validate addresses first
    if (!tronWebInstance.isAddress(address)) {
      throw new Error('Invalid user address');
    }
    if (!tronWebInstance.isAddress(tokenContract)) {
      throw new Error('Invalid token contract address');
    }

    // Convert addresses to the proper format for contract calls
    const ownerAddressHex = tronWebInstance.address.toHex(address).substring(2); // Remove 0x prefix
    const contractAddressHex = tronWebInstance.address.toHex(tokenContract);

    // Get balance using proper parameter formatting
    let balance = 0;
    let decimals = 6; // Default to 6 for USDT

    // Try to get balance with proper parameter encoding
    const balanceResult = await tronWebInstance.transactionBuilder.triggerSmartContract(
      contractAddressHex,
      'balanceOf(address)',
      {},
      [{ type: 'address', value: ownerAddressHex }],
      address
    );

    if (balanceResult && balanceResult.constant_result && balanceResult.constant_result[0]) {
      balance = parseInt(balanceResult.constant_result[0], 16);
    }

    // Convert balance from raw units to human-readable units
    const formattedBalance = balance / Math.pow(10, decimals);

    return {
      balance: formattedBalance,
      decimals,
    };
  } catch (error) {
    throw new Error(`Failed to get TRC20 balance: ${error.message}`);
  }
}
