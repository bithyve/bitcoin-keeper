import { EntityKind } from '../../services/wallets/enums';
import { Vault, VaultScheme, VaultSigner } from '../../services/wallets/interfaces/vault';
import { Wallet } from '../../services/wallets/interfaces/wallet';
import WalletOperations from '../../services/wallets/operations';

const crypto = require('crypto');

export const getDerivationPath = (derivationPath: string) =>
  derivationPath.substring(2).split("'").join('h');

export const getMultiKeyExpressions = (
  signers: VaultSigner[],
  withPathRestrictions: boolean = true,
  nextFreeAddressIndex?: number,
  forDescriptor: boolean = false,
  abbreviated: boolean = false
) => {
  const keyExpressions = signers.map((signer: VaultSigner) =>
    getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub,
      withPathRestrictions,
      nextFreeAddressIndex,
      forDescriptor,
      abbreviated
    )
  );
  return keyExpressions.join();
};

export const getKeyExpression = (
  masterFingerprint: string,
  derivationPath: string,
  xpub: string,
  withPathRestrictions: boolean = false,
  nextFreeAddressIndex?: number,
  forDescriptor: boolean = false,
  abbreviated: boolean = false
) => {
  if (nextFreeAddressIndex != undefined)
    return `[${masterFingerprint}/${getDerivationPath(
      derivationPath
    )}]${xpub}/0/${nextFreeAddressIndex}`;
  else if (abbreviated) return `[${masterFingerprint}/${getDerivationPath(derivationPath)}]`;
  else
    return `[${masterFingerprint}/${getDerivationPath(derivationPath)}]${xpub}${
      withPathRestrictions ? '/**' : forDescriptor ? '/<0;1>/*' : ''
    }`;
};

export const generateAbbreviatedOutputDescriptors = (wallet: Vault | Wallet) => {
  if (wallet.entityKind === EntityKind.WALLET) {
    const {
      derivationDetails: { xDerivationPath },
      specs: { xpub },
    } = wallet as Wallet;
    const des = `wpkh(${getKeyExpression(
      wallet.id,
      xDerivationPath,
      xpub,
      false,
      undefined,
      false,
      true
    )})`;
    return des;
  }
  const { signers, scheme, isMultiSig } = wallet as Vault;
  if (!isMultiSig) {
    const signer: VaultSigner = signers[0];

    const des = `wpkh(${getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub,
      false,
      undefined,
      false,
      true
    )})`;
    return des;
  }
  return `wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(
    signers,
    false,
    undefined,
    false,
    true
  )}))`;
};

export const generateOutputDescriptors = (
  wallet: Vault | Wallet,
  includePatchRestrictions: boolean = false
) => {
  const receivingAddress = WalletOperations.getExternalAddressAtIdx(wallet, 0);
  if (wallet.entityKind === EntityKind.WALLET) {
    const {
      derivationDetails: { xDerivationPath },
      specs: { xpub },
    } = wallet as Wallet;
    const des = `wpkh(${getKeyExpression(
      wallet.id,
      xDerivationPath,
      xpub,
      includePatchRestrictions,
      undefined,
      true
    )})${includePatchRestrictions ? `\n/0/*,/1/*\n${receivingAddress}` : ''}`;
    return des;
  }
  const { signers, scheme, isMultiSig } = wallet as Vault;
  if (!isMultiSig) {
    const signer: VaultSigner = signers[0];

    const des = `wpkh(${getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub,
      includePatchRestrictions,
      undefined,
      true
    )})${includePatchRestrictions ? `\n/0/*,/1/*\n${receivingAddress}` : ''}`;
    return des;
  }
  return `wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(
    signers,
    includePatchRestrictions,
    undefined,
    true
  )}))${includePatchRestrictions ? `\n/0/*,/1/*\n${receivingAddress}` : ''}`;
};

export const generateVaultAddressDescriptors = (wallet: Vault | Wallet) => {
  const receivingAddress = WalletOperations.getNextFreeAddress(wallet);
  const { nextFreeAddressIndex } = wallet.specs;

  if (wallet.entityKind === EntityKind.WALLET) {
    const {
      derivationDetails: { xDerivationPath },
      specs: { xpub },
    } = wallet as Wallet;
    const des = `wpkh(${getKeyExpression(
      wallet.id,
      xDerivationPath,
      xpub,
      true,
      nextFreeAddressIndex
    )})`;
    return {
      descriptorString: des,
      receivingAddress,
    };
  }
  const { signers, scheme, isMultiSig } = wallet as Vault;
  if (!isMultiSig) {
    const signer: VaultSigner = signers[0];
    const des = `wpkh(${getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub,
      true,
      nextFreeAddressIndex
    )})`;
    return {
      descriptorString: des,
      receivingAddress,
    };
  }

  return {
    descriptorString: `wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(
      signers,
      true,
      nextFreeAddressIndex
    )}))`,
    receivingAddress,
  };
};

// PASRER
export interface ParsedSignersDetails {
  xpub: String;
  masterFingerprint: String;
  path: String;
  isMultisig: Boolean;
}
export interface ParsedVauleText {
  signersDetails: ParsedSignersDetails[] | null;
  isMultisig: Boolean | null;
  scheme: VaultScheme;
}

const isAllowedScheme = (m, n) => {
  return m <= n;
};

function removeEmptyLines(data) {
  const lines = data.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim() !== '');
  const output = nonEmptyLines.join('\n');
  return output;
}

function isValidMasterFingerprint(masterFingerprint) {
  return /^[0-9a-fA-F]{8}$/.test(masterFingerprint);
}

function isValidDerivationPath(derivationPath) {
  return /^m(\/\d+'?)+$/.test(derivationPath);
}

function isValidXpub(xpub) {
  return typeof xpub === 'string' && xpub.length > 4;
}

const parseKeyExpression = (keyExpression) => {
  let masterFingerprint = '';
  let path = '';
  let xpub = '';

  // Case 1: If the keyExpression is enclosed in square brackets
  const bracketMatch = keyExpression.match(/\[([^\]]+)\](.*)/);
  if (bracketMatch) {
    const insideBracket = bracketMatch[1];
    masterFingerprint = insideBracket.substring(0, 8).toUpperCase();
    path =
      'm' +
      insideBracket
        .substring(8)
        .replace(/(\d+)h/g, "$1'")
        .replace(/'/g, "'");
    xpub = bracketMatch[2].replace(/[^\w\s]+$/, '').split(/[^\w]+/)[0];
  } else {
    // Case 2: If the keyExpression is not enclosed in square brackets
    const parts = keyExpression.split("'");
    masterFingerprint = parts[0].substring(0, 8).toUpperCase();
    path = 'm' + keyExpression.substring(8, keyExpression.lastIndexOf("'") + 1).replace(/'/g, "'");
    xpub = keyExpression
      .substring(keyExpression.lastIndexOf("'") + 1)
      .replace(/[^\w\s]+$/, '')
      .split(/[^\w]+/)[0];
  }
  if (
    !isValidMasterFingerprint(masterFingerprint) ||
    !isValidDerivationPath(path) ||
    !isValidXpub(xpub)
  ) {
    return null; // At least one of the fields is invalid
  }

  return { masterFingerprint, path, xpub };
};

export const parseTextforVaultConfig = (secret: string) => {
  let config;
  if (secret.includes('wpkh(')) {
    config = { descriptor: secret, label: 'Singlesig vault' };

    const descriptorIndex = config.descriptor.indexOf('wpkh(');
    const hasSquareBrackets = config.descriptor[descriptorIndex + 3] === '[';
    const start = descriptorIndex + (hasSquareBrackets ? 6 : 5);
    const keyExpressions = config.descriptor
      .substring(start)
      .split(',')
      .map((expression) => expression.trim());

    const signersDetailsList = keyExpressions.map((expression) => parseKeyExpression(expression));
    const parsedResponse: ParsedVauleText = {
      signersDetails: signersDetailsList,
      isMultisig: false,
      scheme: {
        m: 1,
        n: 1,
      },
    };
    return parsedResponse;
  }
  if (!config && secret.indexOf('sortedmulti(')) {
    config = { descriptor: secret, label: 'Multisig vault' };
  }
  if (secret.indexOf('sortedmulti(') !== -1 && config.descriptor) {
    if (config.descriptor.includes('sh(wsh(')) {
      throw Error('Unsuportted Script type');
    }

    const descriptorIndex = config.descriptor.indexOf('sortedmulti(');
    const hasSquareBrackets = config.descriptor[descriptorIndex + 10] === '[';
    const start = descriptorIndex + (hasSquareBrackets ? 13 : 12);
    const keyExpressions = config.descriptor
      .substring(start)
      .split(',')
      .map((expression) => expression.trim());

    const signersDetailsList = keyExpressions
      .map((expression) => parseKeyExpression(expression))
      .filter((details) => details !== null);

    const m = parseInt(keyExpressions.splice(0, 1)[0]);
    const n = signersDetailsList.length;
    if (!isAllowedScheme(m, n)) {
      throw Error('Unsupported schemes');
    }
    const scheme: VaultScheme = {
      m,
      n,
    };

    const parsedResponse: ParsedVauleText = {
      signersDetails: signersDetailsList,
      isMultisig: true,
      scheme,
    };
    return parsedResponse;
  }
  if (secret.includes('Derivation')) {
    const text = removeEmptyLines(secret);
    const lines = text.split('\n');
    const signersDetailsList = [];
    let scheme;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Policy')) {
        const [m, n] = line.split('Policy:')[1].split('of');
        scheme = { m: parseInt(m), n: parseInt(n) };
        if (!isAllowedScheme(m, n)) {
          throw Error('Unsupported scheme');
        }
      }
      if (line.startsWith('Derivation:')) {
        const path = line.split(':')[1].trim();
        const masterFingerprintLine = lines[i + 1].trim();
        const masterFingerprint = masterFingerprintLine.split(':')[0].trim();
        const xpub = lines[i + 1].split(':')[1].trim();
        signersDetailsList.push({ xpub, masterFingerprint: masterFingerprint.toUpperCase(), path });
      }
    }

    const parsedResponse: ParsedVauleText = {
      signersDetails: signersDetailsList,
      isMultisig: scheme.n !== 1,
      scheme,
    };
    return parsedResponse;
  }
  throw Error('Unsupported format!');
};

export const urlParamsToObj = (url: string): any => {
  try {
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    const params = {};
    let match;
    while ((match = regex.exec(url))) {
      // eslint-disable-next-line prefer-destructuring
      params[match[1]] = match[2];
    }
    return params;
  } catch (err) {
    return {};
  }
};

export const createCipheriv = (data: string, password: string) => {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(password, 'hex'), iv);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

export const createDecipheriv = (data: { iv: string; encryptedData: string }, password: string) => {
  const algorithm = 'aes-256-cbc';
  const encryptedText = Buffer.from(data.encryptedData, 'hex');
  // Creating Decipher
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(password, 'hex'),
    Buffer.from(data.iv, 'hex')
  );
  // Updating encrypted text
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  // Returning iv and encrypted data
  return JSON.parse(decrypted.toString());
};

export const createCipherGcm = (data: string, password: string) => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(password, 'hex');
  const iv = crypto.randomBytes(12); // 12 bytes for GCM
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted.toString('hex'),
    authTag: authTag.toString('hex'),
  };
};

interface DecryptData {
  iv: string;
  encryptedData: string;
  authTag: string;
}
export const createDecipherGcm = (data: DecryptData, password: string) => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(password, 'hex');
  const iv = Buffer.from(data.iv, 'hex');
  const encryptedText = Buffer.from(data.encryptedData, 'hex');
  const authTag = Buffer.from(data.authTag, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted: Buffer;

  try {
    decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  } catch (err) {
    throw new Error('Failed to decrypt data: ' + err.message);
  }
  return JSON.parse(decrypted.toString('utf-8'));
};

export const getArchivedVaults = (allVaults: Vault[], vault: Vault) => {
  return vault.archived || !vault.archivedId
    ? []
    : allVaults.filter(
        (v) =>
          v.archived &&
          // include vaults that have the same parent archived id or the parent vault itself which is archived but does not have an archived id
          (v.archivedId === vault.archivedId || v.id === vault.archivedId)
      );
};
export function generateKeyFromPassword(password, salt = 'ARzDkUmENwt1', iterations = 100) {
  // Derive a 16-byte key from the 12-character password
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256'); // 16 bytes = 128 bits
}
