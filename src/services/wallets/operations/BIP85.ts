import wif from 'wif';
import bs58 from 'bs58';
import * as bip39 from 'bip39';
import crypto from 'crypto';
import config from 'src/utils/service-utilities/config';
import BIP32Factory from 'bip32';
import { WalletType, BIP85Languages, BIP85Words, EntityKind } from '../enums';
import { BIP85Config } from '../interfaces';
import ecc from './taproot-utils/noble_ecc';

const bip32 = BIP32Factory(ecc);
export default class BIP85 {
  private static hmacsha512 = (message): Buffer => {
    const key = 'bip-entropy-from-k';
    return crypto.createHmac('sha512', key).update(message).digest();
  };

  public static bip32XPRVToEntropy = (path: string, xprvString: string) => {
    const xprv = bip32.fromBase58(xprvString);
    const child = xprv.derivePath(path);
    return BIP85.hmacsha512(child.privateKey);
  };

  public static bip39MnemonicToEntropy = async (
    path: string,
    mnemonic: string,
    passphrase?: string
  ) => {
    const bip39Seed = await bip39.mnemonicToSeed(mnemonic, passphrase);
    const xprv = bip32.fromSeed(bip39Seed);
    const child = xprv.derivePath(path);
    return BIP85.hmacsha512(child.privateKey);
  };

  public static entropyToBIP39 = (entropy: Buffer, words: number, language = 'english'): string => {
    const width = Math.floor(((words - 1) * 11) / 8 + 1);
    return bip39.entropyToMnemonic(entropy.subarray(0, width));
  };

  public static entropyToWif = (entropy: Buffer) => {
    const privateKey = Buffer.from(entropy.subarray(0, 32));
    return wif.encode(128, privateKey, true);
  };

  public static entropyFromWif = (key: string) => wif.decode(key).privateKey;

  public static calculateChecksum = (extendedKey: Buffer) => {
    let hash = crypto.createHash('sha256');
    hash.update(extendedKey);
    const data = hash.digest();
    hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest().subarray(0, 4);
  };

  public static bip32XPRVToXPRV = (path: string, xprvString) => {
    const ent = BIP85.bip32XPRVToEntropy(path, xprvString);

    const prefix = Buffer.from('0488ade4', 'hex');
    const depth = Buffer.from('00', 'hex');
    const parentFingerprint = Buffer.from('00'.repeat(4), 'hex');
    const childNum = Buffer.from('00'.repeat(4), 'hex');
    const chainCode = ent.subarray(0, 32);
    const privateKey = Buffer.concat(
      [Buffer.from('00', 'hex'), ent.subarray(32, ent.length)],
      ent.length + 1
    );
    const extendedKey = Buffer.concat(
      [prefix, depth, parentFingerprint, childNum, chainCode, privateKey],
      78
    );
    const checksum = BIP85.calculateChecksum(extendedKey);

    const bytes = Buffer.concat([extendedKey, checksum], extendedKey.length + checksum.length);
    return bs58.encode(bytes);
  };

  public static bip32XPRVToHex = (path: string, width: number, xprvString: string) => {
    const entropy = BIP85.bip32XPRVToEntropy(path, xprvString);
    return entropy.subarray(0, width).toString('hex');
  };

  private static languageIdxOf = (language: string) => {
    const languages = [
      'english',
      'japanese',
      'korean',
      'spanish',
      'chinese_simplified',
      'chinese_traditional',
      'french',
      'italian',
      'czech',
    ];

    return languages.indexOf(language);
  };

  public static applications = {
    bip39: (xprvString: string, language: string, words: number, index: number) => {
      const languageIdx = BIP85.languageIdxOf(language);
      const path = `m/83696968'/39'/${languageIdx}'/${words}'/${index}'`;
      const entropy = BIP85.bip32XPRVToEntropy(path, xprvString);
      const res = BIP85.entropyToBIP39(entropy, words, language);
      return res;
    },
    xprv: (xprvString: string, index: number) => {
      const path = `83696968'/32'/${index}'`;
      return BIP85.bip32XPRVToXPRV(path, xprvString);
    },
    wif: (xprvString: string, index: number) => {
      const path = `m/83696968'/2'/${index}'`;
      const entropy = BIP85.bip32XPRVToEntropy(path, xprvString);
      return BIP85.entropyToWif(entropy);
    },
    hex: (xprvString: string, index: number, width: number) => {
      const path = `m/83696968'/128169'/${width}'/${index}'`;
      const res = BIP85.bip32XPRVToHex(path, width, xprvString);
      return res;
    },
  };

  public static generateBIP85Configuration = (
    walletType: WalletType | EntityKind,
    instanceNumber: number,
    words: number = BIP85Words.TWELVE,
    language: string = BIP85Languages.ENGLISH
  ): BIP85Config => {
    const { series, upperBound } = config.WALLET_INSTANCE_SERIES[walletType];
    if (instanceNumber > upperBound - 1) {
      throw new Error(
        `Cannot create new instance of type ${walletType}, exceeds instance upper bound`
      );
    }
    const index = series + instanceNumber;

    const bip85Config: BIP85Config = {
      index,
      words,
      language,
      derivationPath: `m/83696968'/39'/${BIP85.languageIdxOf(language)}'/${words}'/${index}'`,
    };
    return bip85Config;
  };
}
