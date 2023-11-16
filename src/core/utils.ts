import { EntityKind } from './wallets/enums';
import { Vault, VaultScheme, VaultSigner } from './wallets/interfaces/vault';
import { Wallet } from './wallets/interfaces/wallet';
import WalletOperations from './wallets/operations';
const cryptoJS = require('crypto');

// GENRATOR

export const getDerivationPath = (derivationPath: string) =>
  derivationPath.substring(2).split("'").join('h');

export const getMultiKeyExpressions = (signers: VaultSigner[]) => {
  const keyExpressions = signers.map((signer: VaultSigner) =>
    getKeyExpression(signer.masterFingerprint, signer.derivationPath, signer.xpub)
  );
  return keyExpressions.join();
};

export const getKeyExpression = (masterFingerprint: string, derivationPath: string, xpub: string) =>
  `[${masterFingerprint}/${getDerivationPath(derivationPath)}]${xpub}/**`;

export const genrateOutputDescriptors = (
  wallet: Vault | Wallet,
  includePatchRestrictions: boolean = true
) => {
  const receivingAddress = WalletOperations.getNextFreeAddress(wallet);
  if (wallet.entityKind === EntityKind.WALLET) {
    const {
      derivationDetails: { xDerivationPath },
      specs: { xpub },
    } = wallet as Wallet;
    const des = `wpkh(${getKeyExpression(wallet.id, xDerivationPath, xpub)})${
      includePatchRestrictions ? `\nNo path restrictions\n${receivingAddress}` : ''
    }`;
    return des;
  }
  const { signers, scheme, isMultiSig } = wallet as Vault;
  if (!isMultiSig) {
    const signer: VaultSigner = signers[0];
    // eslint-disable-next-line no-use-before-define
    const des = `wpkh(${getKeyExpression(
      signer.masterFingerprint,
      signer.derivationPath,
      signer.xpub
    )})${includePatchRestrictions ? `\nNo path restrictions\n${receivingAddress}` : ''}`;
    return des;
  }
  return `wsh(sortedmulti(${scheme.m},${getMultiKeyExpressions(signers)})${
    includePatchRestrictions ? `\nNo path restrictions\n${receivingAddress}` : ''
  }`;
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

const allowedScehemes = {
  1: [1],
  2: [3],
  3: [5, 6],
};

const isAllowedScheme = (m, n) => {
  return allowedScehemes[m].includes(n);
};

function removeEmptyLines(data) {
  const lines = data.split('\n');
  const nonEmptyLines = lines.filter((line) => line.trim() !== '');
  const output = nonEmptyLines.join('\n');
  return output;
}

const parseKeyExpression = (expression) => {
  const re = /\[([^\]]+)\](.*)/;
  const expressionSplit = expression.match(re);
  if (expressionSplit && expressionSplit.length === 3) {
    let hexFingerprint = expressionSplit[1].split('/')[0];
    if (hexFingerprint.length === 8) {
      hexFingerprint = Buffer.from(hexFingerprint, 'hex').toString('hex');
    }
    const path = `m/${expressionSplit[1].split('/').slice(1).join('/').replace(/[h]/g, "'")}`;
    let xpub = expressionSplit[2];
    if (xpub.indexOf('/') !== -1) {
      xpub = xpub.substr(0, xpub.indexOf('/'));
    }
    if (xpub.indexOf(')') !== -1) {
      xpub = xpub.substr(0, xpub.indexOf(')'));
    }
    return {
      xpub,
      masterFingerprint: hexFingerprint.toUpperCase(),
      path,
    };
  }
};

export const parseTextforVaultConfig = (secret: string) => {
  let config;
  if (secret.includes('wpkh(')) {
    config = { descriptor: secret, label: 'Singlesig vault' };
    const keyExpressions = config.descriptor
      .substr(config.descriptor.indexOf('wpkh(') + 5)
      .split(',');

    const signersDetailsList = keyExpressions.map((expression) => parseKeyExpression(expression));
    const parsedResponse: ParsedVauleText = {
      signersDetails: signersDetailsList,
      isMultisig: true,
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

    const keyExpressions = config.descriptor
      .substr(config.descriptor.indexOf('sortedmulti(') + 12)
      .split(',');

    const m = parseInt(keyExpressions.splice(0, 1)[0]);
    const n = keyExpressions.length;
    if (!isAllowedScheme(m, n)) {
      throw Error('Unsupported schemes');
    }
    const scheme: VaultScheme = {
      m,
      n,
    };
    const signersDetailsList = keyExpressions.map((expression) => parseKeyExpression(expression));
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

export const urlParamsToObj = (url: string): object => {
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
  const iv = cryptoJS.randomBytes(16);
  // Creating Cipheriv with its parameter
  const cipher = cryptoJS.createCipheriv(algorithm, Buffer.from(password, 'hex'), iv);

  // Updating text
  let encrypted = cipher.update(data);

  // Using concatenation
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Returning iv and encrypted data
  return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

export const createDecipheriv = (data: { iv: string; encryptedData: string }, password: string) => {
  const algorithm = 'aes-256-cbc';
  const encryptedText = Buffer.from(data.encryptedData, 'hex');
  // Creating Decipher
  const decipher = cryptoJS.createDecipheriv(
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
