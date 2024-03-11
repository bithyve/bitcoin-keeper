import { EntityKind } from './wallets/enums';
import { Vault, VaultScheme, VaultSigner } from './wallets/interfaces/vault';
import { Wallet } from './wallets/interfaces/wallet';
import WalletOperations from './wallets/operations';

const crypto = require('crypto');

export const getDerivationPath = (derivationPath: string) =>
  derivationPath.substring(2).split("'").join('h');

export const getMultiKeyExpressions = (signers: VaultSigner[]) => {
  const keyExpressions = signers.map((signer: VaultSigner) =>
    getKeyExpression(signer.masterFingerprint, signer.derivationPath, signer.xpub)
  );
  return keyExpressions.join();
};

export const getKeyExpression = (
  masterFingerprint: string,
  derivationPath: string,
  xpub: string,
  withPathRestrictions: boolean = true
) =>
  `[${masterFingerprint}/${getDerivationPath(derivationPath)}]${xpub}${
    withPathRestrictions ? '/**' : ''
  }`;

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
    console.log('here');
    const insideBracket = bracketMatch[1];
    masterFingerprint = insideBracket.substring(0, 8).toUpperCase();
    path =
      'm' +
      insideBracket
        .substring(8)
        .replace(/(\d+)h/g, "$1'")
        .replace(/'/g, "'");
    xpub = bracketMatch[2].replace(/[^\w\s]+$/, '').split(/[^\w]+/)[0];
    console.log({ xpub });
  } else {
    // Case 2: If the keyExpression is not enclosed in square brackets
    const parts = keyExpression.split("'");
    masterFingerprint = parts[0].substring(0, 8).toUpperCase();
    path = 'm' + keyExpression.substring(8, keyExpression.lastIndexOf("'") + 1).replace(/'/g, "'");
    xpub = keyExpression
      .substring(keyExpression.lastIndexOf("'") + 1)
      .replace(/[^\w\s]+$/, '')
      .split(/[^\w]+/)[0];
    // xpub = keyExpression.substring(keyExpression.lastIndexOf("'") + 1).split(/[^\w]+/)[0];

    console.log({ xpub });
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

    console.log(keyExpressions);

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

    signersDetailsList.forEach((element) => {
      console.log({ element });
    });

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
    console.log(parsedResponse.signersDetails[0]);
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
