import wif from "wif"
import bs58 from "bs58"
import bip39 from "bip39"
import bip32 from "bip32"
import crypto from "crypto"

const hmacsha512 = (message): Buffer  => {
  const key = "bip-entropy-from-k"
  return crypto
    .createHmac("sha512", key)
    .update(message)
    .digest();
}

export const bip32XPRVToEntropy = (path: string, xprvString: string) => {
  const xprv = bip32.fromBase58(xprvString);
  const child = xprv.derivePath(path);
  return hmacsha512(child.privateKey);
}

export const bip39MnemonicToEntropy = async (path: string, mnemonic: string, passphrase: string) => {
  const bip39Seed = await bip39.mnemonicToSeed(mnemonic, passphrase);
  const xprv = await bip32.fromSeed(bip39Seed);
  const child = xprv.derivePath(path);
  return hmacsha512(child.privateKey);
}

export const entropyToBIP39 = (entropy: Buffer, words: number, language = "english"): string => {
  const width = Math.floor(((words - 1) * 11) / 8 + 1);
  return bip39.entropyToMnemonic(entropy.slice(0, width));
}

export const entropyToWif = (entropy: Buffer) => {
  const privateKey = Buffer.from(entropy.slice(0, 32));
  return wif.encode(128, privateKey, true);
}

export const entropyFromWif = (key: string) => {
  return wif.decode(key).privateKey;
}

const calculateChecksum = (extendedKey: Buffer) => {
    let hash = crypto.createHash("sha256");
    hash.update(extendedKey);
    let data = hash.digest();
    hash = crypto.createHash("sha256");
    hash.update(data);
    return hash.digest().slice(0, 4);
  }

export const bip32XPRVToXPRV = (path: string, xprvString) => {
    const ent = bip32XPRVToEntropy(path, xprvString);

    const prefix = Buffer.from("0488ade4", "hex");
    const depth = Buffer.from("00", "hex");
    const parentFingerprint = Buffer.from("00".repeat(4), "hex");
    const childNum = Buffer.from("00".repeat(4), "hex");
    const chainCode = ent.slice(0, 32);
    // const privateKey = Buffer.concat(
    //   [Buffer.from("00", "hex"), Buffer.from(ent.slice(32, ent.length), "hex")],
    //   ent.length + 1
    // );
    const privateKey = Buffer.concat(
        [Buffer.from("00", "hex"), ent.slice(32, ent.length)],
        ent.length + 1
      );
    const extendedKey = Buffer.concat(
      [prefix, depth, parentFingerprint, childNum, chainCode, privateKey],
      78
    );
    const checksum = calculateChecksum(extendedKey);
  
    const bytes = Buffer.concat(
      [extendedKey, checksum],
      extendedKey.length + checksum.length
    );
    return bs58.encode(bytes);
  }

export const bip32XPRVToHex = async (path: string, width: number, xprvString: string) => {
  const entropy = await bip32XPRVToEntropy(path, xprvString);
  return entropy.slice(0, width).toString("hex");
}

const languageIdxOf = (language: string) => {
  const languages = [
    "english",
    "japanese",
    "korean",
    "spanish",
    "chinese_simplified",
    "chinese_traditional",
    "french",
    "italian",
    "czech",
  ];

  return languages.indexOf(language);
}

export const applications = {
  bip39: async (xprvString: string, language: string, words: number, index: number) => {
    const languageIdx = languageIdxOf(language);
    const path = `m/83696968'/39'/${languageIdx}'/${words}'/${index}'`;
    const entropy = await bip32XPRVToEntropy(path, xprvString);
    const res = await entropyToBIP39(entropy, words, language);
    return res;
  },
  xprv: (xprvString: string, index: number) => {
    const path = `83696968'/32'/${index}'`;
    return bip32XPRVToXPRV(path, xprvString);
  },
  wif: async (xprvString: string, index: number) => {
    const path = `m/83696968'/2'/${index}'`;
    const entropy = await bip32XPRVToEntropy(path, xprvString);
    return entropyToWif(entropy);
  },
  hex: async (xprvString: string, index: number, width: number) => {
    const path = `m/83696968'/128169'/${width}'/${index}'`;
    const res = await bip32XPRVToHex(path, width, xprvString);
    return res;
  },
};